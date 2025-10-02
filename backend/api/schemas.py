from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserBase(BaseModel):
    ho_ten: str
    email: EmailStr
    so_dien_thoai: str
    ngay_sinh: Optional[str] = None
    dia_chi: Optional[str] = None

class UserCreate(UserBase):
    mat_khau: str  

    class Config:
        orm_mode = True

class UserResponse(UserBase):
    ma_nguoi_dung: int
    vai_tro: str  

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    so_dien_thoai: Optional[str] = None
    vai_tro: Optional[str] = None
