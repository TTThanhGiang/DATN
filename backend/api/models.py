from datetime import datetime
from email.policy import default
from zoneinfo import ZoneInfo
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Numeric, Enum, ForeignKey,
    CheckConstraint, UniqueConstraint, Index, Boolean
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

# =========================
# ENUMS
# =========================
gioi_tinh_enum = Enum("NAM", "NU", "KHAC", name="gioi_tinh", create_type=False)
vai_tro_enum = Enum("KHACH_HANG", "NHAN_VIEN", "QUAN_LY", "QUAN_TRI_VIEN", name="vai_tro", create_type=False)
trang_thai_don_hang_enum = Enum("CHO_XU_LY", "DA_XU_LY", "DA_HUY", "HOAN_THANH", name="trang_thai_don_hang", create_type=False)
trang_thai_thanh_toan_enum = Enum("DA_THANH_TOAN", "CHUA_THANH_TOAN", name="trang_thai_don_hang", create_type=False)
trang_thai_yeu_cau_enum = Enum("CHO_XU_LY", "DA_DUYET", "DA_HUY", name="trang_thai_yeu_cau", create_type=False)
trang_thai_khuyen_mai = Enum("CHO_XU_LY", "DA_DUYET", "DA_HUY", name="trang_thai_khuyen_mai", create_type=False)

# =========================
# DANH MỤC SẢN PHẨM
# =========================
class DanhMucSanPham(Base):
    __tablename__ = "danh_muc_san_pham"

    ma_danh_muc = Column(Integer, primary_key=True, autoincrement=True)
    ten_danh_muc = Column(String(100), nullable=False, unique=True, index=True)
    mo_ta = Column(Text)
    danh_muc_cha = Column(Integer, ForeignKey("danh_muc_san_pham.ma_danh_muc"))

    # 1. Mối quan hệ trỏ đến Danh mục Cha (Chỉ 1 đối tượng)
    # primaryjoin: Khóa ngoại của hàng hiện tại (danh_muc_cha) = khóa chính của đối tượng cha (ma_danh_muc)
    danh_muc_cha_obj = relationship(
        "DanhMucSanPham",
        remote_side=[ma_danh_muc], 
        primaryjoin=danh_muc_cha == ma_danh_muc, # Định nghĩa rõ ràng
        uselist=False # Chỉ có một đối tượng cha
    )

    # 2. Mối quan hệ trỏ đến Danh sách Danh mục Con (Nhiều đối tượng)
    # primaryjoin: Khóa ngoại của đối tượng con (danh_muc_cha) = khóa chính của đối tượng hiện tại (ma_danh_muc)
    danh_muc_con = relationship(
        "DanhMucSanPham",
        remote_side=[danh_muc_cha], # <-- SỬA ĐIỂM NÀY
        primaryjoin=ma_danh_muc == danh_muc_cha, # Định nghĩa rõ ràng
        uselist=True, # Luôn là một list
        lazy="joined"
        # BỎ backref="danh_muc_cha_rel" để tránh xung đột
    )
    san_phams = relationship("SanPham", back_populates="danh_muc", cascade="all, delete-orphan")
    hinh_anhs = relationship("HinhAnh", back_populates="danh_muc", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<DanhMucSanPham(ma={self.ma_danh_muc}, ten='{self.ten_danh_muc}')>"


# =========================
# SẢN PHẨM
# =========================
class SanPham(Base):
    __tablename__ = "san_pham"

    ma_san_pham = Column(Integer, primary_key=True, autoincrement=True)
    ten_san_pham = Column(String(200), nullable=False)
    mo_ta = Column(Text)
    # ĐÃ CHUYỂN SANG INTEGER
    don_gia = Column(Integer, nullable=False, comment="Đơn vị: Đồng") 
    # ĐÃ CHUYỂN SANG INTEGER (Lưu ý: Giảm giá VẪN LÀ TỈ LỆ % nên dùng Numeric(5, 2) giữ nguyên)
    giam_gia = Column(Numeric(5, 2), nullable=False, comment="Tỉ lệ giảm giá (%)") 
    ma_danh_muc = Column(Integer, ForeignKey("danh_muc_san_pham.ma_danh_muc"), nullable=False)
    don_vi = Column(String(50))

    danh_muc = relationship("DanhMucSanPham", back_populates="san_phams")
    hinh_anhs = relationship("HinhAnh", back_populates="san_pham", cascade="all, delete-orphan")
    ton_khos = relationship("TonKho", back_populates="san_pham", cascade="all, delete-orphan")
    chi_tiet_gio_hangs = relationship("ChiTietGioHang", back_populates="san_pham", cascade="all, delete-orphan")
    chi_tiet_don_hangs = relationship("ChiTietDonHang", back_populates="san_pham", cascade="all, delete-orphan")
    danh_gias = relationship("DanhGia", back_populates="san_pham", cascade="all, delete-orphan")
    lich_su_xems = relationship("LichSuXem", back_populates="san_pham", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<SanPham(ma={self.ma_san_pham}, ten='{self.ten_san_pham}')>"


# =========================
# HÌNH ẢNH
# =========================
class HinhAnh(Base):
    __tablename__ = "hinh_anh"

    ma_hinh_anh = Column(Integer, primary_key=True, autoincrement=True)
    duong_dan = Column(String(300), nullable=False)
    mo_ta = Column(Text)
    
    # 1. Các khóa ngoại
    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"))
    ma_danh_muc = Column(Integer, ForeignKey("danh_muc_san_pham.ma_danh_muc"))
    ma_khuyen_mai = Column(Integer, ForeignKey("khuyen_mai.ma_khuyen_mai"))
    ma_nguoi_dung =  Column(Integer, ForeignKey("nguoi_dung.ma_nguoi_dung"))

    san_pham = relationship("SanPham", back_populates="hinh_anhs")
    danh_muc = relationship("DanhMucSanPham", back_populates="hinh_anhs")
    khuyen_mai = relationship("KhuyenMai", back_populates="hinh_anhs")
    nguoi_dung = relationship("NguoiDung", back_populates="hinh_anhs")

    # 2. Ràng buộc XOR (Độc quyền HOẶC)
    __table_args__ = (
         CheckConstraint(
        "((ma_san_pham IS NOT NULL)::int + "
        "(ma_danh_muc IS NOT NULL)::int + "
        "(ma_khuyen_mai IS NOT NULL)::int + "
        "(ma_nguoi_dung IS NOT NULL)::int) = 1",
        name="ck_hinh_anh_xor_association"
        ),
    )


# =========================
# CHI NHÁNH
# =========================
class ChiNhanh(Base):
    __tablename__ = "chi_nhanh"

    ma_chi_nhanh = Column(Integer, primary_key=True, autoincrement=True)
    ten_chi_nhanh = Column(String(100), nullable=False)
    dia_chi = Column(Text)
    so_dien_thoai = Column(String(15))
    thanh_pho = Column(String(100))
    ma_buu_dien = Column(String(10))

    ton_khos = relationship("TonKho", back_populates="chi_nhanh", cascade="all, delete-orphan")
    nguoi_dungs = relationship("NguoiDung", back_populates="chi_nhanh", cascade="all, delete-orphan")
    don_hangs = relationship("DonHang", back_populates="chi_nhanh", cascade="all, delete-orphan")
    yeu_cau_nhap_hangs = relationship(
        "YeuCauNhapHang",
        back_populates="chi_nhanh",
        cascade="all, delete-orphan"
    )
    khuyen_mai = relationship(
        "KhuyenMai",
        back_populates="chi_nhanh",
        cascade="all, delete-orphan"
    )


# =========================
# TỒN KHO
# =========================
class TonKho(Base):
    __tablename__ = "ton_kho"

    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"), primary_key=True)
    ma_chi_nhanh = Column(Integer, ForeignKey("chi_nhanh.ma_chi_nhanh"), primary_key=True)
    so_luong_ton = Column(Integer, default=0)
    ngay_cap_nhat = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    san_pham = relationship("SanPham", back_populates="ton_khos")
    chi_nhanh = relationship("ChiNhanh", back_populates="ton_khos")

    __table_args__ = (CheckConstraint("so_luong_ton >= 0", name="ck_ton_kho_non_negative"),)

# =========================
# NGƯỜI DÙNG
# =========================
class NguoiDung(Base):
    __tablename__ = "nguoi_dung"

    ma_nguoi_dung = Column(Integer, primary_key=True, autoincrement=True)
    ho_ten = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True, index=True)
    so_dien_thoai = Column(String(15), nullable=False, unique=True, index=True)
    mat_khau = Column(String(200), nullable=False)
    dia_chi = Column(Text)
    ngay_sinh = Column(DateTime)
    gioi_tinh = Column(gioi_tinh_enum, default="KHAC")
    vai_tro = Column(vai_tro_enum, default="KHACH_HANG")
    trang_thai = Column(Boolean, default=False)
    email_token = Column(String(200))
    ma_chi_nhanh = Column(Integer, ForeignKey("chi_nhanh.ma_chi_nhanh"))

    chi_nhanh = relationship("ChiNhanh", back_populates="nguoi_dungs")
    gio_hang = relationship("GioHang", back_populates="nguoi_dung", uselist=False, cascade="all, delete-orphan")
    don_hangs = relationship("DonHang", back_populates="nguoi_dung", cascade="all, delete-orphan")
    danh_gias = relationship("DanhGia", back_populates="nguoi_dung", cascade="all, delete-orphan")
    lich_su_xems = relationship("LichSuXem", back_populates="nguoi_dung", cascade="all, delete-orphan")
    hinh_anhs = relationship("HinhAnh", back_populates="nguoi_dung", cascade="all, delete-orphan")


# =========================
# GIỎ HÀNG
# =========================
class GioHang(Base):
    __tablename__ = "gio_hang"

    ma_gio_hang = Column(Integer, primary_key=True, autoincrement=True)
    ma_nguoi_dung = Column(Integer, ForeignKey("nguoi_dung.ma_nguoi_dung"), nullable=False)
    ngay_tao = Column(DateTime, default=datetime.utcnow)

    nguoi_dung = relationship("NguoiDung", back_populates="gio_hang")
    chi_tiet_gio_hangs = relationship("ChiTietGioHang", back_populates="gio_hang", cascade="all, delete-orphan")


class ChiTietGioHang(Base):
    __tablename__ = "chi_tiet_gio_hang"

    ma_gio_hang = Column(Integer, ForeignKey("gio_hang.ma_gio_hang"), primary_key=True)
    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"), primary_key=True)
    so_luong = Column(Integer, nullable=False)
    # ĐÃ CHUYỂN SANG INTEGER
    gia_tien = Column(Integer, nullable=False, comment="Đơn vị: Đồng") 

    gio_hang = relationship("GioHang", back_populates="chi_tiet_gio_hangs")
    san_pham = relationship("SanPham", back_populates="chi_tiet_gio_hangs")


# =========================
# ĐƠN HÀNG
# =========================
class DonHang(Base):
    __tablename__ = "don_hang"

    ma_don_hang = Column(Integer, primary_key=True, autoincrement=True)
    ma_nguoi_dung = Column(Integer, ForeignKey("nguoi_dung.ma_nguoi_dung"), nullable=False)
    ho_ten = Column(String(100), nullable=False)
    dia_chi = Column(Text, nullable=False)
    so_dien_thoai = Column(String(11), nullable=False)
    ma_chi_nhanh = Column(Integer, ForeignKey("chi_nhanh.ma_chi_nhanh"), nullable=False)
    ngay_dat = Column(DateTime,default=lambda: datetime.now(ZoneInfo("Asia/Ho_Chi_Minh")))
    trang_thai = Column(trang_thai_don_hang_enum, default="CHO_XU_LY")
    trang_thai_thanh_toan = Column(trang_thai_thanh_toan_enum, default="CHUA_THANH_TOAN")
    # ĐÃ CHUYỂN SANG INTEGER
    tien_giam = Column(Integer, nullable=False, comment="Đơn vị: Đồng") 
    tong_tien = Column(Integer, nullable=False, comment="Đơn vị: Đồng") 
    nguoi_dung = relationship("NguoiDung", back_populates="don_hangs")
    chi_nhanh = relationship("ChiNhanh", back_populates="don_hangs")
    chi_tiet_don_hangs = relationship("ChiTietDonHang", back_populates="don_hang", cascade="all, delete-orphan")


class ChiTietDonHang(Base):
    __tablename__ = "chi_tiet_don_hang"

    ma_don_hang = Column(Integer, ForeignKey("don_hang.ma_don_hang"), primary_key=True)
    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"), primary_key=True)
    so_luong = Column(Integer, nullable=False)
    # ĐÃ CHUYỂN SANG INTEGER
    gia_goc = Column(Integer, nullable=False, comment="Đơn vị: Đồng") 
    gia_sau_giam = Column(Integer, nullable=False, comment="Đơn vị: Đồng") 

    don_hang = relationship("DonHang", back_populates="chi_tiet_don_hangs")
    san_pham = relationship("SanPham", back_populates="chi_tiet_don_hangs")


# =========================
# ĐÁNH GIÁ
# =========================
class DanhGia(Base):
    __tablename__ = "danh_gia"

    ma_danh_gia = Column(Integer, primary_key=True, autoincrement=True)
    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"), nullable=False)
    ma_nguoi_dung = Column(Integer, ForeignKey("nguoi_dung.ma_nguoi_dung"), nullable=False)
    sao = Column(Integer, CheckConstraint("sao BETWEEN 1 AND 5", name="ck_sao_1_5"), nullable=False)
    binh_luan = Column(Text)
    trang_thai = Column(trang_thai_yeu_cau_enum, default="CHO_XU_LY")
    ngay_danh_gia = Column(DateTime, default=datetime.utcnow)

    san_pham = relationship("SanPham", back_populates="danh_gias")
    nguoi_dung = relationship("NguoiDung", back_populates="danh_gias")


# =========================
# LỊCH SỬ XEM
# =========================
class LichSuXem(Base):
    __tablename__ = "lich_su_xem"

    ma_nguoi_dung = Column(Integer, ForeignKey("nguoi_dung.ma_nguoi_dung"), primary_key=True)
    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"), primary_key=True)
    thoi_gian = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    so_lan_xem = Column(Integer, default=1)
    tong_thoi_gian_xem = Column(Integer, default=0) # Tính bằng giây

    san_pham = relationship("SanPham", back_populates="lich_su_xems")
    nguoi_dung = relationship("NguoiDung", back_populates="lich_su_xems")


# =========================
# NHÀ CUNG CẤP
# =========================
class NhaCungCap(Base):
    __tablename__ = "nha_cung_cap"

    ma_nha_cung_cap = Column(Integer, primary_key=True, autoincrement=True)
    ten_nha_cung_cap = Column(String(200), nullable=False)
    dia_chi = Column(Text)
    so_dien_thoai = Column(String(15))
    email = Column(String(100))

    san_pham_nccs = relationship("SanPhamNhaCungCap", back_populates="nha_cung_cap", cascade="all, delete-orphan")


class SanPhamNhaCungCap(Base):
    __tablename__ = "san_pham_nha_cung_cap"

    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"), primary_key=True)
    ma_nha_cung_cap = Column(Integer, ForeignKey("nha_cung_cap.ma_nha_cung_cap"), primary_key=True)
    gia_nhap = Column(Integer, nullable=False, comment="Đơn vị: Đồng") 

    san_pham = relationship("SanPham")
    nha_cung_cap = relationship("NhaCungCap", back_populates="san_pham_nccs")


# =========================
# YÊU CẦU NHẬP HÀNG
# =========================
class YeuCauNhapHang(Base):
    __tablename__ = "yeu_cau_nhap_hang"

    ma_yeu_cau = Column(Integer, primary_key=True, autoincrement=True)
    ma_chi_nhanh = Column(Integer, ForeignKey("chi_nhanh.ma_chi_nhanh"), nullable=False)
    ly_do = Column(Text)
    trang_thai = Column(trang_thai_yeu_cau_enum, default="CHO_XU_LY")
    ngay_tao = Column(DateTime, default=datetime.utcnow)
    ly_do_tu_choi = Column(Text)

    chi_nhanh = relationship("ChiNhanh", back_populates="yeu_cau_nhap_hangs")
    san_pham_yeu_caus = relationship(
        "SanPhamYeuCau",
        back_populates="yeu_cau",
        cascade="all, delete-orphan"
    )


# =========================
# SẢN PHẨM YÊU CẦU NHẬP HÀNG
# =========================
class SanPhamYeuCau(Base):
    __tablename__ = "san_pham_yeu_cau"

    ma_yeu_cau = Column(Integer, ForeignKey("yeu_cau_nhap_hang.ma_yeu_cau"), primary_key=True)
    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"), primary_key=True)
    so_luong = Column(Integer, nullable=False)

    yeu_cau = relationship("YeuCauNhapHang", back_populates="san_pham_yeu_caus")
    san_pham = relationship("SanPham")

# =========================
# KHUYẾN MÃI
# =========================
class KhuyenMai(Base):
    __tablename__ = "khuyen_mai"

    ma_khuyen_mai = Column(Integer, primary_key=True, autoincrement=True)
    ten_khuyen_mai = Column(String(200), nullable=False)
    ma_code = Column(String(50), nullable=False, unique=True, index=True)
    mo_ta = Column(Text)
    giam_gia = Column(Numeric(5, 2), nullable=False)
    ngay_bat_dau = Column(DateTime, nullable=False)
    ngay_ket_thuc = Column(DateTime, nullable=False)
    ma_chi_nhanh = Column(Integer, ForeignKey("chi_nhanh.ma_chi_nhanh"), nullable=True)
    trang_thai = Column(trang_thai_yeu_cau_enum, default="CHO_XU_LY")

    san_pham_khuyen_mais = relationship("SanPhamKhuyenMai", back_populates="khuyen_mai", cascade="all, delete-orphan")
    hinh_anhs = relationship("HinhAnh", back_populates="khuyen_mai", cascade="all, delete-orphan")
    chi_nhanh = relationship("ChiNhanh", back_populates="khuyen_mai")
    
    # THÊM RÀNG BUỘC KIỂM TRA NGÀY KẾT THÚC PHẢI SAU NGÀY BẮT ĐẦU
    __table_args__ = (
        CheckConstraint("ngay_ket_thuc >= ngay_bat_dau", name="ck_ngay_khuyen_mai_hop_le"),
    )

class SanPhamKhuyenMai(Base):
    __tablename__ = "san_pham_khuyen_mai"
    ma_san_pham = Column(Integer, ForeignKey("san_pham.ma_san_pham"), primary_key=True) 
    ma_khuyen_mai = Column(Integer, ForeignKey("khuyen_mai.ma_khuyen_mai"), primary_key=True)
    so_luong = Column(Integer, nullable=False)

    san_pham = relationship("SanPham")
    khuyen_mai = relationship("KhuyenMai", back_populates="san_pham_khuyen_mais")