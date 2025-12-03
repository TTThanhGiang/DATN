from fastapi import FastAPI
from api import models, database
from api.database import SessionLocal
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routers import manager
from api.routers import staff
from api.routers import auth
from api.routers import user
from api.routers import admin

# tạo bảng lần đầu
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Manager System API",
    description="API cho hệ thống quản lý cửa hàng tiện lợi",
    version="0.1.0"
)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Cho phép các origin được truy cập API
origins = [
    "http://localhost:5173",   # React dev server
    "http://127.0.0.1:5173",   # trường hợp bạn dùng 127.0.0.1
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # Cho phép frontend truy cập
    allow_credentials=True,
    allow_methods=["*"],          # Cho phép tất cả phương thức (GET, POST,...)
    allow_headers=["*"],          # Cho phép tất cả headers
)

# # đăng ký routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(admin.router)
app.include_router(manager.router)
app.include_router(staff.router)


@app.get("/")
def root():
    return {"message": "Welcome to Attendance API"}