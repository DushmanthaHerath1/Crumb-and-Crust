from typing import List

import models
import schemas
from database import get_db
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

app = FastAPI(title="Crumb & Crust API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to Crumb & Crust"}


@app.get("/api/menu", response_model=List[schemas.ProductResponse])
def get_menu(db: Session = Depends(get_db)):
    """Get all product data from database and send to front-end"""

    products = db.query(models.Product).filter(models.Product.is_active.is_(True)).all()
    return products


@app.get("/api/business-rules", response_model=schemas.BusinessRuleResponse)
def get_business_rules(db: Session = Depends(get_db)):
    """
    Rules for configure date picker in front-end
    """
    rule = db.query(models.BusinessRule).first()

    if not rule:
        rule = models.BusinessRule(
            daily_order_cap=50,
            blackout_dates=["2026-12-25"],
            opening_hours_json={"start": "08:00", "end": "14:00"},
            max_advance_days=30,
        )

        db.add(rule)
        db.commit()
        db.refresh(rule)

    else:
        needs_update = False
        if rule.opening_hours_json is None:
            rule.opening_hours_json = {"start": "08:00", "end": "14:00"}
            needs_update = True

        if rule.max_advance_days is None:
            rule.max_advance_days = 30
            needs_update = True

        if needs_update:
            db.commit()
            db.refresh(rule)

    return rule
