from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, DateTime, Text, ForeignKey, Numeric, Enum
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

# Bảng Danh mục sản phẩm
class DanhMucSanPham(Base):
    __tablename__ = "danh_muc_san_pham"
    ma_danh_muc = Column(Integer, primary_key=True, autoincrement=True)
    ten_danh_muc = Column(String(100), unique=True, nullable=False)
    mo_ta = Column(Text, nullable=True)

    san_phams = relationship("SanPham", back_populates="danh_muc")

# Bảng Sản phẩm
class SanPham(Base):
    __tablename__ = "san_pham"
    ma_san_pham = Column(Integer, primary_key=True, autoincrement=True)
    ten_san_pham = Column(String(200), nullable=False)
    mo_ta = Column(Text, nullable=True)
    gia = Column(Numeric(10, 2), nullable=False)
    ma_danh_muc = Column(Integer, ForeignKey("danh_muc_san_pham.ma_danh_muc"), nullable=False)

    danh_muc = relationship("DanhMucSanPham", back_populates="san_phams")
    hinh_anhs = relationship("HinhAnh", back_populates="san_pham")
    ton_kho = relationship("TonKho", back_populates="san_pham")

    chi_tiet_gio_hang = relationship("ChiTietGioHang", back_populates="san_pham")
    chi_tiet_don_hang = relationship("ChiTietDonHang", back_populates="san_pham")
    danh_gias = relationship("DanhGia", back_populates="san_pham")

# Bảng Hình ảnh sản phẩm
class HinhAnh(Base):
    __tablename__ = "hinh_anh"
    ma_hinh_anh = Column(Integer, primary_key=True, autoincrement=True)
    duong_dan = Column(String(300), nullable=False)
    mo_ta = Column(Text, nullable=True)

    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"))
    san_pham = relationship("SanPham", back_populates="hinh_anhs")

# Bảng Chi nhánh
class ChiNhanh(Base):
    __tablename__ = "chi_nhanh"
    ma_chi_nhanh = Column(Integer, primary_key=True, autoincrement=True)
    ten_chi_nhanh = Column(String(100), nullable=False)
    dia_chi = Column(Text)
    so_dien_thoai = Column(String(15))

    ton_kho = relationship("TonKho", back_populates="chi_nhanh")
    don_hangs = relationship("DonHang", back_populates="chi_nhanh")
    nguoi_dungs = relationship("NguoiDung", back_populates="chi_nhanh")

# Bảng Tồn kho
class TonKho(Base):
    __tablename__ = "ton_kho"
    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"), primary_key=True)
    ma_chi_nhanh = Column(Integer, ForeignKey("chi_nhanh.ma_chi_nhanh"), primary_key=True)
    so_luong_ton = Column(Integer, default=0)
    ngay_cap_nhat = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    san_pham = relationship("SanPham", back_populates="ton_kho")
    chi_nhanh = relationship("ChiNhanh", back_populates="ton_kho")

# Bảng User (gộp khách hàng và nhân viên)
class NguoiDung(Base):
    __tablename__ = "nguoi_dung"
    ma_nguoi_dung = Column(Integer, primary_key=True, autoincrement=True)
    ho_ten = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    so_dien_thoai = Column(String(15), unique=True, nullable=False)
    mat_khau = Column(String(200), nullable=False)
    dia_chi = Column(Text)
    ngay_sinh = Column(DateTime)
    gioi_tinh = Column(Enum("NAM", "NU", "KHAC", name="gioi_tinh"), default="KHAC")
    vai_tro = Column(Enum("KHACH_HANG", "NHAN_VIEN", "QUAN_LY", "QUAN_TRI_VIEN", name="vai_tro"), default="KHACH_HANG")

    ma_chi_nhanh = Column(Integer, ForeignKey("chi_nhanh.ma_chi_nhanh"), nullable=True)
    
    chi_nhanh = relationship("ChiNhanh", back_populates="nguoi_dungs")
    gio_hang = relationship("GioHang", back_populates="nguoi_dung")
    don_hangs = relationship("DonHang", back_populates="nguoi_dung")
    danh_gias = relationship("DanhGia", back_populates="nguoi_dung")

# Bảng Giỏ hàng
class GioHang(Base):
    __tablename__ = "gio_hang"
    ma_gio_hang = Column(Integer, primary_key=True, autoincrement=True)
    ma_nguoi_dung = Column(Integer, ForeignKey("nguoi_dung.ma_nguoi_dung"), nullable=False)
    ngay_tao = Column(DateTime, default=datetime.utcnow)

    nguoi_dung = relationship("NguoiDung", back_populates="gio_hang")
    chi_tiet_gio_hang = relationship("ChiTietGioHang", back_populates="gio_hang")

# Bảng Chi tiết giỏ hàng
class ChiTietGioHang(Base):
    __tablename__ = "chi_tiet_gio_hang"
    ma_gio_hang = Column(Integer, ForeignKey("gio_hang.ma_gio_hang"), primary_key=True)
    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"), primary_key=True)
    so_luong = Column(Integer, nullable=False)
    gia_tien = Column(Numeric(10, 2), nullable=False)

    gio_hang = relationship("GioHang", back_populates="chi_tiet_gio_hang")
    san_pham = relationship("SanPham", back_populates="chi_tiet_gio_hang")

# Bảng Đơn hàng
class DonHang(Base):
    __tablename__ = "don_hang"
    ma_don_hang = Column(Integer, primary_key=True, autoincrement=True)
    ma_nguoi_dung = Column(Integer, ForeignKey("nguoi_dung.ma_nguoi_dung"), nullable=False)
    ma_chi_nhanh = Column(Integer, ForeignKey("chi_nhanh.ma_chi_nhanh"), nullable=False)

    ngay_dat = Column(DateTime, default=datetime.utcnow)
    trang_thai = Column(Enum("CHO_XU_LY", "DA_THANH_TOAN", "DA_HUY", name="trang_thai_don_hang"), default="CHO_XU_LY")
    tong_tien = Column(Numeric(10, 2), nullable=False)

    nguoi_dung = relationship("NguoiDung", back_populates="don_hangs")
    chi_nhanh = relationship("ChiNhanh", back_populates="don_hangs")
    chi_tiet_don_hang = relationship("ChiTietDonHang", back_populates="don_hang")

# Bảng Chi tiết đơn hàng
class ChiTietDonHang(Base):
    __tablename__ = "chi_tiet_don_hang"
    ma_don_hang = Column(Integer, ForeignKey("don_hang.ma_don_hang"), primary_key=True)
    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"), primary_key=True)
    so_luong = Column(Integer, nullable=False)
    gia_tien = Column(Numeric(10, 2), nullable=False)

    don_hang = relationship("DonHang", back_populates="chi_tiet_don_hang")
    san_pham = relationship("SanPham", back_populates="chi_tiet_don_hang")

# Bảng đánh giá sản phẩm
class DanhGia(Base):
    __tablename__ = "danh_gia"
    ma_danh_gia = Column(Integer, primary_key=True, autoincrement=True)
    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"), nullable=False)
    ma_nguoi_dung = Column(Integer, ForeignKey("nguoi_dung.ma_nguoi_dung"), nullable=False)
    sao = Column(Integer, nullable=False)  # 1-5
    binh_luan = Column(Text, nullable=True)
    ngay_danh_gia = Column(DateTime, default=datetime.utcnow)

    san_pham = relationship("SanPham", back_populates="danh_gias")
    nguoi_dung = relationship("NguoiDung", back_populates="danh_gias")

