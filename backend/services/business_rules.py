import models

DEFAULT_OPENING_HOURS = {"start": "08:00", "end": "14:00"}
DEFAULT_BLACKOUT_DATES = ["2026-12-25"]
DEFAULT_DAILY_CAP = 50
DEFAULT_MAX_ADVANCE_DAYS = 30

def get_or_create_business_rule(db) -> models.BusinessRule:
    """
    Returns the single BusinessRule row, creating sane defaults
    the first time the app ever runs.
    """
    rule = db.query(models.BusinessRule).first()

    if not rule:
        rule = models.BusinessRule(
            daily_order_cap=DEFAULT_DAILY_CAP,
            blackout_dates=DEFAULT_BLACKOUT_DATES,
            opening_hours_json=DEFAULT_OPENING_HOURS,
            max_advance_days=DEFAULT_MAX_ADVANCE_DAYS,
        )
        db.add(rule)
        db.commit()
        db.refresh(rule)
        return rule

    needs_update = False
    if rule.opening_hours_json is None:
        rule.opening_hours_json = DEFAULT_OPENING_HOURS
        needs_update = True
    if rule.max_advance_days is None:
        rule.max_advance_days = DEFAULT_MAX_ADVANCE_DAYS
        needs_update = True

    if needs_update:
        db.commit()
        db.refresh(rule)

    return rule