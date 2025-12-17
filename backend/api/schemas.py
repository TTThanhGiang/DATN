from datetime import datetime
from turtle import st
from click import DateTime
from pydantic import BaseModel, EmailStr, Field, validator
from decimal import Decimal
from typing import List, Optional

class UserBase(BaseModel):
    ho_ten: str
    email: EmailStr
    so_dien_thoai: str
    ngay_sinh: Optional[str] = None
    dia_chi: Optional[str] = None

class UserCreate(BaseModel):
    ho_ten: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    so_dien_thoai: str = Field(..., pattern=r"^0\d{9}$", description="Số điện thoại gồm 10 chữ số bắt đầu bằng 0")
    mat_khau: str = Field(..., min_length=6, description="Mật khẩu ít nhất 6 ký tự")

    @validator("mat_khau")
    def kiem_tra_mat_khau(cls, v):
        if not any(ch.isdigit() for ch in v):
            raise ValueError("Mật khẩu phải chứa ít nhất một số.")
        if not any(ch.isalpha() for ch in v):
            raise ValueError("Mật khẩu phải chứa ít nhất một chữ cái.")
        return v

class UserResponse(UserBase):
    ma_nguoi_dung: int
    vai_tro: str  

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    vai_tro: str
    ma_nguoi_dung: int

class TokenData(BaseModel):
    so_dien_thoai: Optional[str] = None
    vai_tro: Optional[str] = None

class DanhMucSchema(BaseModel):
    ma_danh_muc: int
    ten_danh_muc: str
    mo_ta: Optional[str] = None
    danh_muc_con: List['DanhMucSchema'] = []  # default [] tránh lỗi None

    class Config:
        orm_mode = True

class HinhAnhSchema(BaseModel):
    duong_dan: str
    mo_ta: Optional[str] = None

class DanhMucCreate(BaseModel):
    ten_danh_muc: str
    mo_ta: Optional[str] = None
    danh_muc_cha: Optional[int] = None
    hinh_anhs: List[HinhAnhSchema] = []

class SanPhamSchema(BaseModel):
    ma_san_pham: int
    ten_san_pham: str
    mo_ta: Optional[str] = None
    don_gia: int
    giam_gia: Decimal = Field(default=0, ge=0, le=100)
    ma_danh_muc: int
    don_vi: Optional[str] = None
    hinh_anhs: List[HinhAnhSchema] = []

class SanPhamCreateSchema(BaseModel):
    ten_san_pham: str
    don_gia: float
    giam_gia: Optional[float] = 0
    don_vi : str
    ma_danh_muc: int
    mo_ta: Optional[str] = None

class GioHangItemCreate(BaseModel):
    ma_san_pham: int
    so_luong: int

class GioHangItemResponse(BaseModel):
    ma_san_pham: int
    ten_san_pham: str
    so_luong: int
    gia_tien: int
    don_vi: Optional[str] = None
    hinh_anhs: List[HinhAnhSchema] = []

    class Config:
        orm_mode = True

class ThanhToanSchema(BaseModel):
    ma_chi_nhanh: int
    ho_ten: str
    dia_chi_giao_hang: str
    so_dien_thoai: str
    tong_tien: float

class NguoiDungCreate(BaseModel):
    ho_ten: str
    email: EmailStr
    so_dien_thoai: str
    mat_khau: str = Field(..., min_length=6, description="Mật khẩu ít nhất 6 ký tự")
    nhap_lai_mat_khau: str = Field(..., min_length=6, description="Mật khẩu ít nhất 6 ký tự")
    vai_tro: str
    ma_chi_nhanh: Optional[int] = None  # cho phép null

    @validator("ma_chi_nhanh", pre=True, always=True)
    def empty_to_none(cls, v):
        if v in ("", 0):
            return None
        return v
class NhanVienCreate(BaseModel):
    ho_ten: str
    email: EmailStr
    so_dien_thoai: str
    mat_khau: str = Field(..., min_length=6, description="Mật khẩu ít nhất 6 ký tự")
    nhap_lai_mat_khau: str = Field(..., min_length=6, description="Mật khẩu ít nhất 6 ký tự")

class EmailSchema(BaseModel):
   email: EmailStr

class TonKhoCreate(BaseModel):
    ma_san_pham: int
    ma_chi_nhanh: int
    so_luong_ton: int = 0
    
class TonKhoUpdate(BaseModel):
    so_luong_ton: int

class TonKhoItem(BaseModel):
    ma_san_pham: int
    ma_chi_nhanh: int
    so_luong_ton: int

class TonKhoManyCreate(BaseModel):
    items: List[TonKhoItem]

class SanPhamYeuCau(BaseModel):
    ma_san_pham: int
    so_luong: int

class YeuCauNhapHangCreate(BaseModel):
    ly_do: str
    san_phams: List[SanPhamYeuCau]

class SanPhamYeuCauOut(BaseModel):
    ma_san_pham: int
    ten_san_pham: str
    so_luong: int


class YeuCauNhapHangUpdate(BaseModel):
    ly_do: str | None = None
    san_phams: list[SanPhamYeuCau]

class YeuCauNhapHangOut(BaseModel):
    ma_yeu_cau: int
    ma_chi_nhanh: int
    ten_chi_nhanh: str
    ly_do: str
    ly_do_tu_choi: Optional[str] = None
    trang_thai: str
    ngay_tao: str
    san_pham_yeu_caus: List[SanPhamYeuCauOut]

class SanPhamKMItem(BaseModel):
    ma_san_pham: int
    so_luong: int

class KhuyenMaiCreate(BaseModel):
    ten_khuyen_mai: str
    ma_code: str
    mo_ta: str | None = None
    giam_gia: float
    ngay_bat_dau: datetime
    ngay_ket_thuc: datetime
    ma_chi_nhanh: int | None = None
    san_phams: list[SanPhamKMItem] | None = None   # ❗ Có thể None

class SanPhamKMItemOut(SanPhamKMItem):
    ten_san_pham: str

class HinhAnhItem(BaseModel):
    duong_dan: str
    mo_ta: Optional[str] = None

class KhuyenMaiOut(BaseModel):
    ma_khuyen_mai: int
    ten_khuyen_mai: str
    ma_code: str
    mo_ta: Optional[str]
    giam_gia: float
    ngay_bat_dau: datetime
    ngay_ket_thuc: datetime
    ma_chi_nhanh: Optional[int]
    trang_thai: str
    san_phams: List[SanPhamKMItemOut] = []
    hinh_anhs: List[HinhAnhItem] = []

class SanPhamDonHangOut(BaseModel):
    ma_san_pham: int
    ten_san_pham: str
    so_luong: int
    gia_tien: int
    don_vi: str
    hinh_anhs:  str | None = None

    class Config:
        orm_mode = True


class DonHangOut(BaseModel):
    ma_don_hang: int
    ho_ten: str
    dia_chi: str
    so_dien_thoai: str
    trang_thai: str
    trang_thai_thanh_toan: str
    tong_tien: int
    ngay_dat: datetime
    chi_tiet: list[SanPhamDonHangOut]

    class Config:
        orm_mode = True

class HuyDonInput(BaseModel):
    ly_do: str

class CapNhatProfile(BaseModel):
    ho_ten: str
    email: EmailStr
    dia_chi: str
    ngay_sinh: datetime
    gioi_tinh: str

class ThayDoiMatKhau(BaseModel):
    mat_khau_cu: str
    mat_khau_moi: str

class TuChoiYeuCau(BaseModel):
    ly_do: str

class KhuyenMaiAdminOut(BaseModel):
    ma_khuyen_mai: int
    ten_khuyen_mai: str
    ma_code: str
    mo_ta: Optional[str]
    giam_gia: float
    ngay_bat_dau: datetime
    ngay_ket_thuc: datetime
    ma_chi_nhanh: Optional[int]
    ten_chi_nhanh: Optional[str] | None = None
    trang_thai: str
    san_phams: List[SanPhamKMItemOut] = []
    hinh_anhs: List[HinhAnhItem] = []

class FormDanhGia(BaseModel):
    ma_san_pham: int
    so_sao: int
    binh_luan: str

class UserCreate(BaseModel):
    ho_ten: str
    email: EmailStr
    so_dien_thoai: str
    mat_khau: str
    dia_chi: Optional[str] = None
    ngay_sinh: Optional[datetime] = None
    gioi_tinh: Optional[str] = "KHAC"
    vai_tro: Optional[str] = "KHACH_HANG"
    ma_chi_nhanh: Optional[int] = None

class UserBulkCreate(BaseModel):
    users: List[UserCreate]

class BulkReviewRequest(BaseModel):
    so_danh_gia_moi_nguoi: int = 3