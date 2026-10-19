#stdlib
from typing import List

#local
import models
import schemas
from database import get_db
from services.menu import resolve_featured_id

#thirdparty
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(tags=["Menu"])

@router.get("/api/menu", response_model=List[schemas.ProductResponse])
def get_menu(db: Session = Depends(get_db)):
    """Get all product data from database and send to front-end"""
    products = db.query(models.Product).filter(models.Product.is_active.is_(True)).all()

    if not products:
        return []

    featured_id = resolve_featured_id(products, db)

    result = []
    for p in products:
        item = schemas.ProductResponse.model_validate(p)
        if p.id == featured_id:
            item.is_featured = True
        result.append(item)

    return result