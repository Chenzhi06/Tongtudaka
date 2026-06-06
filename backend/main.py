from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

SQLALCHEMY_DATABASE_URL = "sqlite:///./db/tongtu.db"
os.makedirs("./db", exist_ok=True)
os.makedirs("./uploads/avatars", exist_ok=True)
os.makedirs("./uploads/backgrounds", exist_ok=True)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

from models import *
from routers import auth, admin, user

app.include_router(user.router, prefix="/api/user")
app.include_router(admin.router, prefix="/api/admin")
app.include_router(auth.router, prefix="/api")

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "同途打卡系统 API"}