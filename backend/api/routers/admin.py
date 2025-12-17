from datetime import datetime
import json
from typing import List, Optional
import os
from unittest import result
from fastapi import APIRouter, Body, Depends, Form, HTTPException, Query, UploadFile, File
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
from api.schemas import HinhAnhItem, KhuyenMaiAdminOut, KhuyenMaiOut, NguoiDungCreate, SanPhamKMItem, SanPhamKMItemOut, SanPhamYeuCauOut, TonKhoCreate, TonKhoManyCreate, TonKhoUpdate, TuChoiYeuCau, YeuCauNhapHangOut
from sqlalchemy import desc
from sqlalchemy.orm import Session

from api.database import get_db, SessionLocal
from api.models import ChiNhanh, KhuyenMai, SanPham, DanhMucSanPham, HinhAnh, NguoiDung, SanPhamKhuyenMai, TonKho, YeuCauNhapHang
from api.routers.auth import lay_nguoi_dung_hien_tai, ma_hoa_mat_khau, phan_quyen
from api.utils.response_helpers import success_response, error_response

router = APIRouter(prefix="/admins", tags=["Quản trị viên"])

# Thư mục lưu ảnh
UPLOAD_DIR_SANPHAM = "uploads/sanphams"
UPLOAD_DIR_DANHMUC = "uploads/danhmucs"
UPLOAD_DIR_KHUYENMAI = "uploads/khuyenmais"

# Mount thư mục mẹ ở app chính
# app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

admin = "QUAN_TRI_VIEN"
# ------------------ SẢN PHẨM ------------------
@router.get("/danh-sach-san-pham")
def danh_sach_san_pham(
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(phan_quyen(admin))
):
    total = db.query(SanPham).count()
    items = (
        db.query(SanPham)
        .order_by(desc(SanPham.ma_san_pham))
        .offset(offset)
        .limit(limit)
        .all()
    )
    result = []
    for sp in items:
        result.append({
            "ma_san_pham": sp.ma_san_pham,
            "ten_san_pham": sp.ten_san_pham,
            "mo_ta": sp.mo_ta,
            "don_gia": sp.don_gia,
            "giam_gia": float(sp.giam_gia),
            "ma_danh_muc": sp.ma_danh_muc,
            "ten_danh_muc": sp.danh_muc.ten_danh_muc if sp.danh_muc else None,
            "don_vi": sp.don_vi,
            "hinh_anhs": [{"duong_dan": ha.duong_dan, "mo_ta": ha.mo_ta} for ha in sp.hinh_anhs]
        })
    return success_response(
        data=jsonable_encoder({
            "items": result,
            "total": total,
            "limit": limit,
            "offset": offset
        }),
        message="Thành công"
    )

@router.post("/them-san-pham")
async def them_san_pham(
    ten_san_pham: str = Form(...),
    don_gia: float = Form(...),
    giam_gia: float = Form(0),
    don_vi: str = Form(...),
    ma_danh_muc: int = Form(...),
    mo_ta: str | None = Form(None),
    hinh_anh: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(phan_quyen(admin))
):
    sp = SanPham(
        ten_san_pham=ten_san_pham,
        don_gia=don_gia,
        giam_gia=giam_gia,
        don_vi=don_vi,
        ma_danh_muc=ma_danh_muc,
        mo_ta=mo_ta
    )
    db.add(sp)
    db.commit()
    db.refresh(sp)

    if hinh_anh is not None and hinh_anh.filename:
        os.makedirs(UPLOAD_DIR_SANPHAM, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR_SANPHAM, hinh_anh.filename)
        with open(file_path, "wb") as f:
            f.write(await hinh_anh.read())
        file_url = f"http://localhost:8000/{file_path}"
        ha = HinhAnh(ma_san_pham=sp.ma_san_pham, duong_dan=file_url, mo_ta=sp.ten_san_pham)
        db.add(ha)
        db.commit()

    return success_response(data=jsonable_encoder(sp), message="Tạo sản phẩm thành công")

@router.put("/cap-nhat-san-pham/{ma_san_pham}")
async def cap_nhat_san_pham(
    ma_san_pham: int,
    ten_san_pham: str = Form(...),
    don_gia: float = Form(...),
    giam_gia: float = Form(0),
    don_vi: str = Form(...),
    ma_danh_muc: int = Form(...),
    mo_ta: str | None = Form(None),
    hinh_anh: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(phan_quyen(admin))
):
    sp = db.query(SanPham).filter(SanPham.ma_san_pham == ma_san_pham).first()
    if not sp:
        return error_response(message="Sản phẩm không tồn tại", success=False)

    sp.ten_san_pham = ten_san_pham
    sp.don_gia = don_gia
    sp.giam_gia = giam_gia
    sp.don_vi = don_vi
    sp.ma_danh_muc = ma_danh_muc
    sp.mo_ta = mo_ta
    db.commit()
    db.refresh(sp)

    if hinh_anh is not None and hinh_anh.filename:
        os.makedirs(UPLOAD_DIR_SANPHAM, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR_SANPHAM, hinh_anh.filename)
        with open(file_path, "wb") as f:
            f.write(await hinh_anh.read())
        file_url = f"http://localhost:8000/{file_path}"

        ha = db.query(HinhAnh).filter(HinhAnh.ma_san_pham == sp.ma_san_pham).first()
        if ha:
            ha.duong_dan = file_url
            ha.mo_ta = sp.ten_san_pham
        else:
            ha = HinhAnh(ma_san_pham=sp.ma_san_pham, duong_dan=file_url, mo_ta=sp.ten_san_pham)
            db.add(ha)
        db.commit()

    return success_response(data=jsonable_encoder(sp), message="Cập nhật sản phẩm thành công")

@router.delete("/xoa-san-pham/{ma_san_pham}")
def xoa_san_pham(   
    ma_san_pham: int,
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(phan_quyen(admin))
):
    sp = db.query(SanPham).filter(SanPham.ma_san_pham == ma_san_pham).first()
    if not sp:
        return error_response(message="Sản phẩm không tồn tại", success=False)

    # Xóa ảnh liên quan
    ha_list = db.query(HinhAnh).filter(HinhAnh.ma_san_pham == sp.ma_san_pham).all()
    for ha in ha_list:
        file_path = ha.duong_dan.replace("http://localhost:8000/", "")
        if os.path.exists(file_path):
            os.remove(file_path)
        db.delete(ha)

    db.delete(sp)
    db.commit()
    return success_response(data=jsonable_encoder(sp), message="Đã xóa sản phẩm và ảnh liên quan")

# ------------------ DANH MỤC ------------------
@router.get("/danh-muc")
def danh_muc(
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    try:
        total = db.query(DanhMucSanPham).count()
        danh_mucs = (
            db.query(DanhMucSanPham)
            .order_by(desc(DanhMucSanPham.ma_danh_muc))
            .offset(offset)
            .limit(limit)
            .all()
        )
        result = []
        for dm in danh_mucs:
            danh_muc_data = {
                "ma_danh_muc": dm.ma_danh_muc,
                "ten_danh_muc": dm.ten_danh_muc,
                "mo_ta": dm.mo_ta,
                "danh_muc_cha": dm.danh_muc_cha_obj.ten_danh_muc if dm.danh_muc_cha_obj else None ,
                "hinh_anhs": [
                    {
                        "duong_dan": ha.duong_dan,
                        "mo_ta": ha.mo_ta,
                    }
                    for ha in dm.hinh_anhs
                ]
            }
            result.append(danh_muc_data)
        return success_response(
            data=jsonable_encoder({
                "items": result,
                "total": total,
                "limit": limit,
                "offset": offset
            }),
            message="Thành công",
            status_code=200
        )

    finally:
        db.close()
        
@router.post("/them-danh-muc")
async def them_danh_muc(
    ten_danh_muc: str = Form(...),
    mo_ta: str | None = Form(None),
    danh_muc_cha: int | None = Form(None),
    hinh_anh: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(phan_quyen(admin))
):
    dm = DanhMucSanPham(
        ten_danh_muc = ten_danh_muc,
        mo_ta = mo_ta,
        danh_muc_cha = danh_muc_cha,
    )
    db.add(dm)
    db.commit()
    db.refresh(dm)

    if hinh_anh is not None and hinh_anh.filename:
        os.makedirs(UPLOAD_DIR_DANHMUC, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR_DANHMUC, hinh_anh.filename)
        with open(file_path, "wb") as f:
            f.write(await hinh_anh.read())
        file_url = f"http://localhost:8000/{file_path}"
        ha = HinhAnh(ma_danh_muc=dm.ma_danh_muc, duong_dan=file_url, mo_ta=dm.ten_danh_muc)
        db.add(ha)
        db.commit()
    return success_response(data=jsonable_encoder(dm), message="Tạo sản phẩm thành công")

@router.put("/cap-nhat-danh-muc/{ma_danh_muc}")
async def cap_nhat_danh_muc(
    ma_danh_muc: int,
    ten_danh_muc: str = Form(...),
    danh_muc_cha: int | None = Form(None),
    mo_ta: str | None = Form(None),
    hinh_anh: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai)
):
    dm = db.query(DanhMucSanPham).filter(DanhMucSanPham.ma_danh_muc == ma_danh_muc).first()
    if not dm:
        return error_response(message="Danh mục không tồn tại", success=False)

    dm.ten_danh_muc = ten_danh_muc
    dm.mo_ta = mo_ta
    dm.danh_muc_cha = danh_muc_cha
    db.commit()
    db.refresh(dm)

    if hinh_anh is not None and hinh_anh.filename:
        os.makedirs(UPLOAD_DIR_DANHMUC, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR_DANHMUC, hinh_anh.filename)
        with open(file_path, "wb") as f:
            f.write(await hinh_anh.read())
        file_url = f"http://localhost:8000/{file_path}"

        ha = db.query(HinhAnh).filter(HinhAnh.ma_danh_muc == dm.ma_danh_muc).first()
        if ha:
            ha.duong_dan = file_url
            ha.mo_ta = dm.ten_danh_muc
        else:
            ha = HinhAnh(ma_danh_muc=dm.ma_danh_muc, duong_dan=file_url, mo_ta=dm.ten_danh_muc)
            db.add(ha)
        db.commit() 

    return success_response(data=jsonable_encoder(dm), message="Cập nhật danh mục thành công")

@router.delete("/xoa-danh-muc/{ma_danh_muc}")
def xoa_danh_muc(
    ma_danh_muc: int,
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(phan_quyen(admin))
):
    dm = db.query(DanhMucSanPham).filter(SanPham.ma_danh_muc == ma_danh_muc).first()
    if not dm:
        return error_response(message="Danh mục không tồn tại", success=False)

    # Xóa ảnh liên quan
    ha_list = db.query(HinhAnh).filter(HinhAnh.ma_danh_muc == dm.ma_danh_muc).all()
    for ha in ha_list:
        file_path = ha.duong_dan.replace("http://localhost:8000/", "")
        if os.path.exists(file_path):
            os.remove(file_path)
        db.delete(ha)

    db.delete(dm)
    db.commit()
    return success_response(data=jsonable_encoder(dm), message="Đã xóa sản phẩm và ảnh liên quan")
    
# ------------------ CHI NHÁNH ------------------
@router.get("/danh-sach-chi-nhanh")
def danh_sach_chi_nhanh(currents_user: NguoiDung = Depends(phan_quyen(admin)), db: Session = Depends(get_db)):
    chi_nhanhs = db.query(ChiNhanh).order_by(desc(ChiNhanh.ma_chi_nhanh)).all()
    result = []
    for cn in chi_nhanhs:
        chi_nhanh_data = {
            "ma_chi_nhanh": cn.ma_chi_nhanh,
            "ten_chi_nhanh": cn.ten_chi_nhanh,
            "so_dien_thoai": cn.so_dien_thoai,
            "dia_chi": cn.dia_chi + ", " + cn.thanh_pho,
            "thanh_pho": cn.thanh_pho,
            "ma_buu_dien": cn.ma_buu_dien
            }
        result.append(chi_nhanh_data)
    return success_response(
        data=jsonable_encoder(result),
        message="Thành công",
        status_code=200
    )

@router.post("/them-chi-nhanh")
async def them_chi_nhanh(
    ten_chi_nhanh: str = Form(...),
    so_dien_thoai: str = Form(...),
    dia_chi: str = Form(...),
    thanh_pho: str = Form(...),
    xa: str = Form(...),
    ma_buu_dien: str | None = Form(None),
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(phan_quyen(admin))
):
    chi_nhanh = ChiNhanh(
        ten_chi_nhanh = ten_chi_nhanh,
        so_dien_thoai = so_dien_thoai, 
        dia_chi = dia_chi + ", " + xa,
        thanh_pho = thanh_pho,
        ma_buu_dien = ma_buu_dien
    )

    db.add(chi_nhanh)
    db.commit()

    return success_response(
        data=jsonable_encoder(chi_nhanh),
        message="Thêm chi nhánh thành công"
        )

@router.put("/cap-nhat-chi-nhanh/{ma_chi_nhanh}")
async def cap_nhat_chi_nhanh(
    ma_chi_nhanh: int,  
    ten_chi_nhanh: str = Form(...),
    so_dien_thoai: str = Form(...),
    dia_chi: str = Form(...),
    thanh_pho: str = Form(...),
    xa: str = Form(...),
    ma_buu_dien: str | None = Form(None),
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai)
):
    chi_nhanh = db.query(ChiNhanh).filter(ChiNhanh.ma_chi_nhanh == ma_chi_nhanh).first()
    if not chi_nhanh:
        return error_response(message="Chi nhánh không tồn tại", success=False)
    chi_nhanh.ten_chi_nhanh = ten_chi_nhanh
    chi_nhanh.so_dia_thoai = so_dien_thoai
    chi_nhanh.dia_chi = dia_chi +", "+ xa
    chi_nhanh.thanh_pho = thanh_pho
    db.commit()
    db.refresh(chi_nhanh)

    return success_response(
        data=jsonable_encoder(chi_nhanh),
        message="Cập nhật chi nhánh thành công", 
    )

# ------------------ NGƯỜI DÙNG ------------------
@router.get("/danh-sach-nguoi-dung")
def danh_sach_nguoi_dung(currents_user: NguoiDung = Depends(phan_quyen(admin)), db: Session = Depends(get_db)):
    nguoi_dungs = db.query(NguoiDung).order_by(desc(NguoiDung.ma_nguoi_dung)).all()
    result = []
    for nd in nguoi_dungs:
        trang_thai = ""
        if nd.trang_thai:
            trang_thai = "Đang hoạt động"
        else:
            trang_thai = "Đã khóa"
        nguoi_dung_data = {
            "ma_nguoi_dung": nd.ma_nguoi_dung,
            "ho_ten": nd.ho_ten,
            "email": nd.email,
            "so_dien_thoai": nd.so_dien_thoai,
            "dia_chi": nd.dia_chi,
            "ngay_sinh": nd.ngay_sinh,
            "gioi_tinh": nd.gioi_tinh,
            "vai_tro": nd.vai_tro,
            "trang_thai": trang_thai,
            "ma_chi_nhanh": nd.ma_chi_nhanh if nd.ma_chi_nhanh else None
        }
        result.append(nguoi_dung_data)
    return success_response(
        data=jsonable_encoder(result),
        message="Lấy danh sách người dùng thành công"
    )

@router.post("/them-nguoi-dung")
async def them_nguoi_dung(
    nguoidung: NguoiDungCreate, 
    currents_user: NguoiDung = Depends(phan_quyen(admin)),
    db: Session = Depends(get_db)
):
    if db.query(NguoiDung).filter((NguoiDung.so_dien_thoai == nguoidung.so_dien_thoai) | (NguoiDung.email == nguoidung.email)).first():
        return error_response(
            message="Người dùng đã tồn tại"
        )
    
    mat_khau_da_ma_hoa = ma_hoa_mat_khau(nguoidung.mat_khau)
    nguoi_dung_moi = NguoiDung(
        ho_ten = nguoidung.ho_ten,
        email = nguoidung.email,
        so_dien_thoai = nguoidung.so_dien_thoai,
        mat_khau = mat_khau_da_ma_hoa,
        vai_tro = nguoidung.vai_tro,
        ma_chi_nhanh= nguoidung.ma_chi_nhanh,
        trang_thai = True
    )
    db.add(nguoi_dung_moi)
    db.commit()
    db.refresh(nguoi_dung_moi)
    return success_response(
        data=jsonable_encoder(nguoi_dung_moi),
        message="Tạo người dùng thành công"
    )

@router.put("/khoa-tai-khoan/{ma_nguoi_dung}")
def khoa_tai_khoan(ma_nguoi_dung: int, currents_user: NguoiDung = Depends(phan_quyen(admin)), db: Session = Depends(get_db)):
    nguoi_dung = db.query(NguoiDung).filter(NguoiDung.ma_nguoi_dung == ma_nguoi_dung).first()
    if not nguoi_dung:
        return error_response(message="Không tìm thấy người dùng")
    nguoi_dung.trang_thai = False
    db.commit()
    db.refresh(nguoi_dung)

    return success_response(
        data=jsonable_encoder(nguoi_dung),
        message="Đã khóa tài khoản người dùng"
    )

@router.put("/mo-khoa-tai-khoan/{ma_nguoi_dung}")
def mo_khoa_tai_khoan(ma_nguoi_dung: int, currents_user: NguoiDung = Depends(phan_quyen(admin)), db: Session = Depends(get_db)):
    nguoi_dung = db.query(NguoiDung).filter(NguoiDung.ma_nguoi_dung == ma_nguoi_dung).first()
    if not nguoi_dung:
        return error_response(message="Không tìm thấy người dùng")

    nguoi_dung.trang_thai = True
    db.commit()
    db.refresh(nguoi_dung)

    return success_response(
        data=jsonable_encoder(nguoi_dung),
        message="Đã mở khóa tài khoản người dùng"
    )

# ------------------ TỒN KHO ------------------
@router.get("/danh-sach-ton-kho")
def lay_danh_sach_ton_kho(
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    ma_chi_nhanh: int = Query(None, description="Lọc theo chi nhánh"),
    currents_user: NguoiDung = Depends(phan_quyen(admin))
):
    
    query = db.query(TonKho).join(SanPham).join(ChiNhanh)

    # Nếu có chi nhánh, filter
    if ma_chi_nhanh:
        query = query.filter(TonKho.ma_chi_nhanh == ma_chi_nhanh)

    total = query.count()  # tổng theo filter

    ton_khos = query.offset(offset).limit(limit).all()

    if not ton_khos:
        error_response(message="Lỗi khi lấy danh sách tồn kho")

    result = []
    for tk in ton_khos:
        ton_kho_data = {
            "ma_san_pham": tk.ma_san_pham,
            "ten_san_pham": tk.san_pham.ten_san_pham,
            "ma_chi_nhanh": tk.ma_chi_nhanh,
            "ten_chi_nhanh": tk.chi_nhanh.ten_chi_nhanh,
            "so_luong_ton": tk.so_luong_ton,
            "ngay_cap_nhat": tk.ngay_cap_nhat.isoformat(),
            "hinh_anhs": [{"duong_dan": ha.duong_dan, "mo_ta": ha.mo_ta} for ha in tk.san_pham.hinh_anhs]
        }
        result.append(ton_kho_data)

    return success_response(
        data=jsonable_encoder({
            "items": result,
            "total": total,
            "limit": limit,
            "offset": offset
        }),
        message="Thành công"
    )

@router.post("/them-ton-kho")
def them_ton_kho(ton_kho_in: TonKhoCreate, currents_user: NguoiDung = Depends(phan_quyen(admin)), db: Session = Depends(get_db)):
    san_pham = db.query(SanPham).filter(SanPham.ma_san_pham == ton_kho_in.ma_san_pham).first()
    chi_nhanh = db.query(ChiNhanh).filter(ChiNhanh.ma_chi_nhanh == ton_kho_in.ma_chi_nhanh).first()

    if not san_pham:
        return error_response(
            message="Sản phẩm không tồn tại"
        )
    if not chi_nhanh:
        return error_response(
            message="Chi nhánh không tồn tại"
        )
    ton_kho = db.query(TonKho).filter(
        TonKho.ma_san_pham == ton_kho_in.ma_san_pham,
        TonKho.ma_chi_nhanh == ton_kho_in.ma_chi_nhanh
    ).first()

    if ton_kho:
        return error_response(
            message="Sản phẩm đã tồn tại trong chi nhánh này"
        )
    ton_kho_moi = TonKho(
        ma_san_pham = ton_kho_in.ma_san_pham,
        ma_chi_nhanh = ton_kho_in.ma_chi_nhanh,
        so_luong_ton = ton_kho_in.so_luong_ton
    )

    db.add(ton_kho_moi)
    db.commit()
    db.refresh(ton_kho_moi)

    return success_response(
        data=jsonable_encoder(ton_kho_moi),
        message="Thêm sản phẩm vào kho chi nhánh thành công"
    )

@router.put("/cap-nhat-ton-kho/{ma_san_pham}/{ma_chi_nhanh}")
def cap_nhat_ton_kho(ma_san_pham: int, ma_chi_nhanh: int, update: TonKhoUpdate, currents_user: NguoiDung = Depends(phan_quyen(admin)), db: Session = Depends(get_db)):
    ton_kho = db.query(TonKho).filter(
        TonKho.ma_san_pham == ma_san_pham,
        TonKho.ma_chi_nhanh == ma_chi_nhanh
    ).first()

    if not ton_kho:
        return error_response(
            message="Không tồn tại"
        )
    if update.so_luong_ton < 0:
        return error_response(
            message="Số lượng không được âm"
        )
    ton_kho.so_luong_ton = update.so_luong_ton
    db.commit()
    db.refresh(ton_kho)

    return success_response(
        data=jsonable_encoder(ton_kho),
        message="Cập nhật thành công"
    )

@router.post("/them-nhieu-ton-kho")
def them_nhieu_ton_kho(
    ton_kho_in: TonKhoManyCreate,
    currents_user: NguoiDung = Depends(phan_quyen(admin)),
    db: Session = Depends(get_db)
):
    added_items = []
    errors = []

    for item in ton_kho_in.items:
        san_pham = db.query(SanPham).filter(SanPham.ma_san_pham == item.ma_san_pham).first()
        chi_nhanh = db.query(ChiNhanh).filter(ChiNhanh.ma_chi_nhanh == item.ma_chi_nhanh).first()

        if not san_pham:
            errors.append(f"Sản phẩm {item.ma_san_pham} không tồn tại")
            continue
        if not chi_nhanh:
            errors.append(f"Chi nhánh {item.ma_chi_nhanh} không tồn tại")
            continue

        ton_kho = db.query(TonKho).filter(
            TonKho.ma_san_pham == item.ma_san_pham,
            TonKho.ma_chi_nhanh == item.ma_chi_nhanh
        ).first()

        if ton_kho:
            errors.append(f"Sản phẩm {item.ma_san_pham} đã tồn tại tại chi nhánh {item.ma_chi_nhanh}")
            continue

        ton_kho_moi = TonKho(
            ma_san_pham=item.ma_san_pham,
            ma_chi_nhanh=item.ma_chi_nhanh,
            so_luong_ton=item.so_luong_ton
        )
        db.add(ton_kho_moi)
        db.commit()
        db.refresh(ton_kho_moi)
        added_items.append(jsonable_encoder(ton_kho_moi))

    return {
        "success": True,
        "data": added_items,
        "errors": errors,
        "message": f"Thêm {len(added_items)} sản phẩm thành công, {len(errors)} lỗi"
    }

# ------------------ NHẬP HÀNG ------------------
@router.get("/danh-sach-yeu-cau")
def lay_danh_sach_yeu_cau(
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    current_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai),
    db: Session = Depends(get_db)
):
    total = db.query(YeuCauNhapHang).count()
    yeu_caus = db.query(YeuCauNhapHang).order_by(desc(YeuCauNhapHang.ngay_tao)).limit(limit).offset(offset).all()
    result = []

    for yc in yeu_caus:
        san_phams = []
        for sp_yc in yc.san_pham_yeu_caus:
            san_phams.append(SanPhamYeuCauOut(
                ma_san_pham=sp_yc.ma_san_pham,
                ten_san_pham=sp_yc.san_pham.ten_san_pham,
                so_luong=sp_yc.so_luong
            ))
        result.append(YeuCauNhapHangOut(
            ma_yeu_cau=yc.ma_yeu_cau,
            ma_chi_nhanh=yc.ma_chi_nhanh,
            ten_chi_nhanh=yc.chi_nhanh.ten_chi_nhanh,
            ly_do=yc.ly_do,
            ly_do_tu_choi=yc.ly_do_tu_choi,
            trang_thai=yc.trang_thai,
            ngay_tao=yc.ngay_tao.date().isoformat(),
            san_pham_yeu_caus=san_phams
        ))
    return success_response(
        data=jsonable_encoder({
            "items": result,
            "total": total,
            "limit": limit,
            "offset": offset
        }),
        message="Thành công"
    )

@router.put("/duyet-yeu-cau/{ma_yeu_cau}")
def duyet_yeu_cau(ma_yeu_cau: int, current_user: NguoiDung = Depends(phan_quyen(admin)), db: Session = Depends(get_db)):
    yeu_cau = db.query(YeuCauNhapHang).filter(YeuCauNhapHang.ma_yeu_cau == ma_yeu_cau).first()
    if not yeu_cau:
        raise HTTPException(status_code=400, detail="Không tồn tại yêu cầu")
    yeu_cau.trang_thai = "DA_DUYET"
    db.commit()
    db.refresh(yeu_cau)

    return {"success": True, "message": "Đã duyệt yêu cầu"}

@router.put("/tu-choi-yeu-cau/{ma_yeu_cau}")
def tu_choi_yeu_cau(
    ma_yeu_cau: int, 
    payload: TuChoiYeuCau,
    current_user: NguoiDung = Depends(phan_quyen(admin)), 
    db: Session = Depends(get_db)
):
    yeu_cau = db.query(YeuCauNhapHang).filter(YeuCauNhapHang.ma_yeu_cau == ma_yeu_cau).first()
    if not yeu_cau:
        raise HTTPException(status_code=400, detail="Không tồn tại yêu cầu")
    yeu_cau.trang_thai = "DA_HUY"
    yeu_cau.ly_do_tu_choi = payload.ly_do
    db.commit()
    db.refresh(yeu_cau)

    return {"success": True, "message": "Đã từ chối yêu cầu"}

# ------------------ KHUYẾN MÃI ------------------
@router.post("/tao-khuyen-mai")
async def tao_khuyen_mai(
    ten_khuyen_mai: str = Form(...),
    ma_code: str = Form(...),
    mo_ta: str | None = Form(None),
    giam_gia: float = Form(...),
    ngay_bat_dau: datetime = Form(...),
    ngay_ket_thuc: datetime = Form(...),
    ma_chi_nhanh: int | None = Form(None),
    san_phams: str | None = Form(None),  # JSON string
    hinh_anh: Optional[UploadFile] = File(None),
    currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai),
    db: Session = Depends(get_db)
):
    exits_ma_code = db.query(KhuyenMai).filter(KhuyenMai.ma_code == ma_code).first()
    if exits_ma_code:
        return error_response(message="Mã khuyến mãi đã tồn tại")
    
    if ngay_ket_thuc < ngay_bat_dau:
        return error_response(message="ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu")
    
    khuyen_mai = KhuyenMai(
        ten_khuyen_mai = ten_khuyen_mai,
        ma_code = ma_code,
        mo_ta = mo_ta,
        giam_gia = giam_gia,
        ngay_bat_dau = ngay_bat_dau,
        ngay_ket_thuc = ngay_ket_thuc,
        trang_thai = "DA_DUYET",
        ma_chi_nhanh = ma_chi_nhanh if ma_chi_nhanh else None
    )

    db.add(khuyen_mai)
    db.commit()
    db.refresh(khuyen_mai)

    if hinh_anh is not None and hinh_anh.filename:
        os.makedirs(UPLOAD_DIR_KHUYENMAI, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR_KHUYENMAI, hinh_anh.filename)
        with open(file_path, "wb") as f:
            f.write(await hinh_anh.read())
        file_url = f"http://localhost:8000/{file_path}"
        ha = HinhAnh(ma_khuyen_mai=khuyen_mai.ma_khuyen_mai, duong_dan=file_url, mo_ta=khuyen_mai.ten_khuyen_mai)
        db.add(ha)
        db.commit()

    san_phams_list = []
    if san_phams:
        san_phams_list = [SanPhamKMItem(**item) for item in json.loads(san_phams)]
        for sp in san_phams_list:
            san_pham = SanPhamKhuyenMai(
                ma_khuyen_mai = khuyen_mai.ma_khuyen_mai,
                ma_san_pham = sp.ma_san_pham,
                so_luong = sp.so_luong
            )
            db.add(san_pham)
        db.commit()
    return success_response(
        data=jsonable_encoder(khuyen_mai),
        message="Tại khuyến mãi thành công"
    )

@router.get("/danh-sach-khuyen-mai", response_model=List[KhuyenMaiOut])
def danh_sach_khuyen_mai( db: Session = Depends(get_db), current_user: NguoiDung = Depends(phan_quyen(admin))):
    khuyen_mais = db.query(KhuyenMai).order_by(desc(KhuyenMai.ma_khuyen_mai)).all()
    result = []
    for km in khuyen_mais:
        san_phams = [
            SanPhamKMItemOut(ma_san_pham=sp.ma_san_pham, so_luong=sp.so_luong, ten_san_pham=sp.san_pham.ten_san_pham)
            for sp in km.san_pham_khuyen_mais
        ]
        hinh_anhs = [
            HinhAnhItem(duong_dan=ha.duong_dan, mo_ta=ha.mo_ta)
            for ha in km.hinh_anhs
        ]
        result.append(KhuyenMaiAdminOut(
            ma_khuyen_mai=km.ma_khuyen_mai,
            ten_khuyen_mai=km.ten_khuyen_mai,
            ma_code=km.ma_code,
            mo_ta=km.mo_ta,
            giam_gia=float(km.giam_gia),
            ngay_bat_dau=km.ngay_bat_dau,
            ngay_ket_thuc=km.ngay_ket_thuc,
            ma_chi_nhanh=km.ma_chi_nhanh,
            ten_chi_nhanh=km.chi_nhanh.ten_chi_nhanh if km.chi_nhanh else None,
            trang_thai=km.trang_thai,
            san_phams=san_phams,
            hinh_anhs=hinh_anhs
        ))
    return success_response(
        data=jsonable_encoder(result),
        message="Lấy danh sách thành công"
    )

@router.put("/duyet-khuyen-mai/{ma_khuyen_mai}")
def duyet_khuyen_mai(
    ma_khuyen_mai: int,
    current_user: NguoiDung = Depends(phan_quyen(admin)),
    db: Session = Depends(get_db)
):
    khuyen_mai = db.query(KhuyenMai).filter(KhuyenMai.ma_khuyen_mai == ma_khuyen_mai).first()
    if not khuyen_mai:
        raise HTTPException(status_code=400, detail="Không tồn tại khuyến mãi")
    khuyen_mai.trang_thai = "DA_DUYET"
    db.commit()
    db.refresh(khuyen_mai)

    return {"success": True, "message": "Đã duyệt khuyến mãi"}

@router.put("/tu-choi-khuyen-mai/{ma_khuyen_mai}")
def tu_choi_khuyen_mai(
    ma_khuyen_mai: int,
    current_user: NguoiDung = Depends(phan_quyen(admin)),
    db: Session = Depends(get_db)
):
    khuyen_mai = db.query(KhuyenMai).filter(KhuyenMai.ma_khuyen_mai == ma_khuyen_mai).first()
    if not khuyen_mai:
        raise HTTPException(status_code=400, detail="Không tồn tại khuyến mãi")
    khuyen_mai.trang_thai = "DA_HUY"
    db.commit()
    db.refresh(khuyen_mai)

    return {"success": True, "message": "Đã từ chối khuyến mãi"}
