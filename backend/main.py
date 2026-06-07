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
