from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/api/menu")
def get_menu():

    return [
        {"id": 1, "name": "Classic Sourdough", "price": 850.00},
        {"id": 2, "name": "Chocolate Croissant", "price": 450.00},
    ]
