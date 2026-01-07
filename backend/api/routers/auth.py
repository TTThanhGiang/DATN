import hashlib
import os
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from api.utils.email import gui_email_xac_thuc
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from dotenv import load_dotenv

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from itsdangerous import URLSafeTimedSerializer

from api.database import get_db
from api.models import NguoiDung
import api.schemas as schemas

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Xác thực"])

# Định nghĩa schema OAuth2 cho Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/dang-nhap")

# cấu hình mã hóa mật khẩu
bo_ma_hoa = CryptContext(schemes=["bcrypt"], deprecated="auto")

# cấu hình gửi email
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

fm = FastMail(conf)

HOST_FRONTEND = os.getenv("HOST_FRONTEND")
HOST_BACKEND = os.getenv("HOST_BACKEND")

# cấu hình JWT
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

serializer = URLSafeTimedSerializer(SECRET_KEY)

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
        return {
            "so_dien_thoai": payload.get("sub"),
            "user_id": payload.get("user_id"),
            "vai_tro": payload.get("vai_tro")
        }
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
    so_dien_thoai = token_data.get("so_dien_thoai")

    if not so_dien_thoai:
        raise credentials_exception
    nguoi_dung = lay_nguoi_dung_theo_sdt(db, so_dien_thoai)
    if nguoi_dung is None:
        raise credentials_exception
    return nguoi_dung

def lay_nguoi_dung_theo_sdt(db: Session, sdt: str):
    return db.query(NguoiDung).filter(NguoiDung.so_dien_thoai == sdt).first()

def phan_quyen(*allowed_roles):
    def checker(current_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai)):
        if current_user.vai_tro not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền truy cập"
            )
        return current_user
    return checker

# async def gui_email_xac_thuc(email: schemas.EmailSchema, ho_ten: str, db: Session):
#     raw_token = serializer.dumps(email, salt="email-confirm")

#     token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

#     user = db.query(NguoiDung).filter(NguoiDung.email == email).first()
#     if not user:
#         return

#     user.email_token = token_hash
#     db.commit()

#     link = f"{HOST_BACKEND}/auth/xac-thuc-email/{token_hash}"

#     message = MessageSchema(
#         subject="Xác thực email",
#         recipients=[email],
#         body=f"""
#         <p>Chào {ho_ten},</p>
#         <p>Nhấn vào link để xác thực email:</p>
#         <a href="{link}">Xác thực email</a>
#         <p>Link có hiệu lực trong 1 giờ.</p>
#         """,
#         subtype="html"
#     )

#     await fm.send_message(message)


@router.post("/dang-nhap", response_model=schemas.Token)
def dang_nhap(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    nguoi_dung = lay_nguoi_dung_theo_sdt(db, form_data.username)

    if not nguoi_dung or not kiem_tra_mat_khau(form_data.password, nguoi_dung.mat_khau):
        raise HTTPException(status_code=400, detail="Số điện thoại hoặc mật khẩu không đúng")
    
    if not nguoi_dung.trang_thai:
        raise HTTPException(status_code=400, detail="Vui lòng xác thực email trước khi đăng nhập")
    
    access_token = tao_access_token(
        data={
            "sub": nguoi_dung.so_dien_thoai,
            "user_id": nguoi_dung.ma_nguoi_dung,
            "vai_tro": nguoi_dung.vai_tro
        }
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "vai_tro": nguoi_dung.vai_tro,  
        "ma_nguoi_dung": nguoi_dung.ma_nguoi_dung,
        }

@router.post("/dang-ky")
def dang_ky(user_in: schemas.UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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

    background_tasks.add_task(gui_email_xac_thuc, nguoi_dung_moi.email, nguoi_dung_moi.ho_ten, db)

    return {"message": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực."}


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


@router.get("/xac-thuc-email/{token_hash}")
def verify_email(token_hash: str, db: Session = Depends(get_db)):
    user = db.query(NguoiDung)\
        .filter(NguoiDung.email_token == token_hash)\
        .first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Link xác thực không hợp lệ hoặc đã được sử dụng"
        )
    user.trang_thai = True

    user.email_token = None

    db.commit()

    return RedirectResponse(url=HOST_FRONTEND, status_code=302)
