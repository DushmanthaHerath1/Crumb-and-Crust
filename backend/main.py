#stdlib
from contextlib import asynccontextmanager

#local
import config
import stripe
from database import engine, get_db

#endpoint logics
from services.business_rules import get_or_create_business_rule

#routers
from routers import menu, scheduling, orders, webhooks, admin

#third party
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



@asynccontextmanager
async def lifespan(app: FastAPI):
    stripe.api_key = config.STRIPE_SECRET_KEY

    db = next(get_db())
    try:
        get_or_create_business_rule(db)
    finally:
        db.close()
    
    yield
    engine.dispose()

app = FastAPI(title="Crumb & Crust API", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(menu.router)
app.include_router(scheduling.router)
app.include_router(admin.router)
app.include_router(webhooks.router)
app.include_router(orders.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Crumb & Crust"}