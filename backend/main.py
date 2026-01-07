from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api import models, database
from api.routers import auth, user, admin, manager, staff, recommend

app = FastAPI(
    title="Manager System API",
    description="API cho hệ thống quản lý cửa hàng tiện lợi",
    version="0.1.0"
)

# ===================== CORS =====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # OK cho dev + docker
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== STATIC FILES =====================
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ===================== DATABASE INIT =====================
@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=database.engine)

# ===================== ROUTERS =====================
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(admin.router)
app.include_router(manager.router)
app.include_router(staff.router)
app.include_router(recommend.router)

# ===================== ROOT =====================
@app.get("/")
def root():
    return {"message": "Welcome to Manager System API"}
