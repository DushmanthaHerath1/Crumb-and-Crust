#stdlib
from datetime import datetime, time, timezone, timedelta

#local
import models
import config

#thirdparty
from fastapi import HTTPException
from sqlalchemy import or_

def _to_utc(dt: datetime) -> datetime:
    """Ensure timezone information of slots came from db and add UTC if there are not"""
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)

def _fmt(dt: datetime) -> str:
    """format the time and return it as a string"""
    return dt.strftime("%I:%M %p").lstrip("0")

def pending_cutoff(now_utc: datetime | None = None) -> datetime:
    """Pending orders created before this (naive UTC) moment no longer hold capacity."""
    now_utc = now_utc or datetime.now(timezone.utc)
    return (now_utc - timedelta(minutes=config.PENDING_HOLD_MINUTES)).replace(tzinfo=None)

def is_hold_expired(order) -> bool:
    return order.status == "pending" and order.created_at < pending_cutoff()

def booked_counts(db) -> dict:
    """Orders per bakery-local date. Abandoned/failed orders don't use up capacity."""
    rows = (
        db.query(models.Order.pickup_datetime)
        .filter(models.Order.status.notin_(["failed", "refunded"]))
        .filter(or_(
            models.Order.status != "pending",
            models.Order.created_at >= pending_cutoff(),
        ))
        .all()
    )

    counts = {}
    for (dt,) in rows:
        d = _to_utc(dt).astimezone(config.BAKERY_TZ).date().isoformat()
        counts[d] = counts.get(d, 0) + 1
    return counts

def has_capacity(db, pickup_dt: datetime, rule) -> bool:
    day = _to_utc(pickup_dt).astimezone(config.BAKERY_TZ).date().isoformat()
    return booked_counts(db).get(day, 0) < rule.daily_order_cap


def build_availability(rule, lead_hours: int, db, now_utc=None) -> list:
    now_utc = now_utc or datetime.now(timezone.utc)
    today = now_utc.astimezone(config.BAKERY_TZ).date()
    oh, om = map(int, rule.opening_hours_json["start"].split(":"))
    ch, cm = map(int, rule.opening_hours_json["end"].split(":"))
    counts = booked_counts(db)

    days = []
    for i in range(rule.max_advance_days + 1):
        day = today + timedelta(days=i)
        iso = day.isoformat()
        if iso in rule.blackout_dates:
            day_reason = "closed"
        elif counts.get(iso, 0) >= rule.daily_order_cap:
            day_reason = "fully_booked"
        else:
            day_reason = None

        cursor = datetime.combine(day, time(oh, om), tzinfo=config.BAKERY_TZ)
        close = datetime.combine(day, time(ch, cm), tzinfo=config.BAKERY_TZ)
        slots = []
        while cursor + timedelta(minutes=config.SLOT_MINUTES) <= close:
            end = cursor + timedelta(minutes=config.SLOT_MINUTES)
            start_utc = cursor.astimezone(timezone.utc)
            reason = day_reason
            if reason is None and (start_utc - now_utc).total_seconds() < lead_hours * 3600:
                reason = "lead_time"
            slots.append({
                "start": start_utc,
                "end": end.astimezone(timezone.utc),
                "label": f"{_fmt(cursor)} – {_fmt(end)}",
                "available": reason is None,
                "reason": reason,
            })
            cursor = end
        days.append({"date": iso, "slots": slots})
    return days

def validate_pickup(req_dt: datetime, rule, lead_hours: int, db):
    """Single source of truth: the order is valid only if it is an available slot."""
    req_utc = _to_utc(req_dt)
    messages = {
        "closed": "Sorry, we are closed on the requested date.",
        "fully_booked": "Sorry, we are fully booked for this date.",
        "lead_time": f"Minimum lead time not met. Your cart requires at least {lead_hours} hours of preparation.",
    }
    for day in build_availability(rule, lead_hours, db):
        for s in day["slots"]:
            if s["start"] == req_utc:
                if not s["available"]:
                    raise HTTPException(status_code=400, detail=messages[s["reason"]])
                return
    raise HTTPException(status_code=400, detail="Requested time is not a valid pickup slot.")