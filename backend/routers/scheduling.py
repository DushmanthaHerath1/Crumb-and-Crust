#local
import models
import schemas
import config
from database import get_db
from services.business_rules import get_or_create_business_rule
from services.scheduling import build_availability

#thirdparty
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(tags=["Scheduling"])

@router.get("/api/business-rules", response_model=schemas.BusinessRuleResponse)
def get_business_rules(db: Session = Depends(get_db)):
    """Rules for configuring the date picker in the front-end"""
    return get_or_create_business_rule(db)

@router.get("/api/availability", response_model=schemas.AvailabilityResponse)
def get_availability(product_ids: str = "", db: Session = Depends(get_db)):
    ids = [int(i) for i in product_ids.split(",") if i.strip().isdigit()]
    products = db.query(models.Product).filter(
        models.Product.id.in_(ids), models.Product.is_active.is_(True)
    ).all()
    lead_hours = max((p.lead_time_h for p in products), default=0)

    rule = get_or_create_business_rule(db)
    return {
        "lead_time_hours": lead_hours,
        "timezone": str(config.BAKERY_TZ),
        "days": build_availability(rule, lead_hours, db),
    }