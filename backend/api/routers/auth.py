import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt

from api.database import get_db
from api.models import NguoiDung
import api.schemas as schemas


router = APIRouter(prefix="/auth", tags=["Xác thực"])

# Định nghĩa schema OAuth2 cho Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/dang-nhap")

# cấu hình mã hóa mật khẩu
bo_ma_hoa = CryptContext(schemes=["bcrypt"], deprecated="auto")

# cấu hình JWT
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

def ma_hoa_mat_khau(mat_khau: str):
    return bo_ma_hoa.hash(mat_khau)

def kiem_tra_mat_khau(mat_khau: str, mat_khau_da_ma_hoa: str):
    return bo_ma_hoa.verify(mat_khau, mat_khau_da_ma_hoa)

def tao_access_token(data: dict, thoi_han: timedelta = None):
    noi_dung = data.copy()
    if thoi_han:
        ket_thuc = datetime.utcnow() + thoi_han
    else:
        ket_thuc = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    noi_dung.update({"exp": ket_thuc})
    token = jwt.encode(noi_dung, SECRET_KEY, algorithm=ALGORITHM)
    return token

def gai_ma_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return schemas.TokenData(so_dien_thoai=payload.get("sub"), vai_Tro=payload.get("vai_tro"))
    except JWTError:
        return None

def lay_nguoi_dung_hien_tai(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = gai_ma_token(token)
    if token_data is None:
        raise credentials_exception
    nguoi_dung = lay_nguoi_dung_theo_sdt(db, token_data.so_dien_thoai)
    if nguoi_dung is None:
        raise credentials_exception
    return nguoi_dung

def lay_nguoi_dung_theo_sdt(db: Session, sdt: str):
    return db.query(NguoiDung).filter(NguoiDung.so_dien_thoai == sdt).first()

#---API Endpoints---#

@router.post("/dang-nhap", response_model=schemas.Token)
def dang_nhap(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    nguoi_dung = lay_nguoi_dung_theo_sdt(db, form_data.username)

    if not nguoi_dung or not kiem_tra_mat_khau(form_data.password, nguoi_dung.mat_khau):
        raise HTTPException(status_code=400, detail="Số điện thoại hoặc mật khẩu không đúng")
    
    access_token = tao_access_token(data={"sub": nguoi_dung.so_dien_thoai, "vai_tro": nguoi_dung.vai_tro})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/dang-ky", response_model=schemas.UserResponse)
def dang_ky(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(NguoiDung).filter((NguoiDung.so_dien_thoai == user_in.so_dien_thoai) | (NguoiDung.email == user_in.email)).first():
        raise HTTPException(status_code=400, detail="Số điện thoại hoặc email đã tồn tại")
    
    mat_khau_da_ma_hoa = ma_hoa_mat_khau(user_in.mat_khau)
    nguoi_dung_moi = NguoiDung(
        ho_ten=user_in.ho_ten,
        email=user_in.email,
        so_dien_thoai=user_in.so_dien_thoai,
        mat_khau=mat_khau_da_ma_hoa,
        vai_tro="KHACH_HANG"  # Mặc định vai trò là "KHACH_HANG"
    )
    db.add(nguoi_dung_moi)
    db.commit()
    db.refresh(nguoi_dung_moi)
    return nguoi_dung_moi


@router.get("/me", response_model=schemas.UserResponse)
def lay_user_dang_nhap(user: NguoiDung = Depends(lay_nguoi_dung_hien_tai)):
    return user

@router.post("/cap-nhat-thong-tin", response_model=schemas.UserResponse)
def cap_nhat_thong_tin(user_update: schemas.UserBase, db: Session = Depends(get_db), current_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai)):
    if user_update.so_dien_thoai != current_user.so_dien_thoai:
        if db.query(NguoiDung).filter(NguoiDung.so_dien_thoai == user_update.so_dien_thoai).first():
            raise HTTPException(status_code=400, detail="Số điện thoại đã tồn tại")
    if user_update.email != current_user.email:
        if db.query(NguoiDung).filter(NguoiDung.email == user_update.email).first():
            raise HTTPException(status_code=400, detail="Email đã tồn tại")
    
    current_user.ho_ten = user_update.ho_ten
    current_user.email = user_update.email
    current_user.so_dien_thoai = user_update.so_dien_thoai

    db.commit()
    db.refresh(current_user)
    return current_user