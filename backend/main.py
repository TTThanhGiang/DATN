from fastapi import FastAPI
from api import models, database
from api.database import SessionLocal
from api.routers import auth

# tạo bảng lần đầu
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Manager System API",
    description="API cho hệ thống quản lý cửa hàng tiện lợi",
    version="0.1.0"
)

app = FastAPI(title="Attendance System API")

# # đăng ký routers
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "Welcome to Attendance API"}