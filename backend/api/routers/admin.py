from datetime import datetime, timedelta
import json
from pydoc import text
from typing import List, Optional
import os
from unittest import result
from fastapi import APIRouter, Body, Depends, Form, HTTPException, Query, UploadFile, File
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
from api.schemas import DonHangOut, DonHangOutAdmin, HinhAnhItem, HuyDonInput, KhuyenMaiAdminOut, KhuyenMaiOut, NguoiDungCreate, SanPhamDonHangOut, SanPhamKMItem, SanPhamKMItemOut, SanPhamLichSuDonHangOut, SanPhamYeuCauOut, TonKhoCreate, TonKhoManyCreate, TonKhoUpdate, TuChoiYeuCau, YeuCauNhapHangOut
from sqlalchemy import desc, func, distinct, and_, cast, Date, or_
from sqlalchemy.orm import Session, joinedload, load_only
from dateutil.relativedelta import relativedelta

from api.database import get_db, SessionLocal
from api.models import ChiNhanh, DanhGia, KhuyenMai, SanPham, DanhMucSanPham, HinhAnh, NguoiDung, SanPhamKhuyenMai, TonKho, YeuCauNhapHang, DonHang, ChiTietDonHang
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
    ten_san_pham: str | None = Query(None),
    ma_danh_muc: int | None = Query(None),
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(phan_quyen(admin))
):
    query = db.query(SanPham)

    if ten_san_pham:
        query = query.filter(SanPham.ten_san_pham.ilike(f"%{ten_san_pham}%"))

    if ma_danh_muc:
        query = query.filter(SanPham.ma_danh_muc == ma_danh_muc)

    total = query.count()

    san_phams = (
        query
        .order_by(desc(SanPham.ma_san_pham))
        .offset(offset)
        .limit(limit)
        .all()
    )
    result = []
    for sp in san_phams:
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
    sp_data = {
        "ma_san_pham": sp.ma_san_pham,
        "ten_san_pham": sp.ten_san_pham,
        "don_gia": sp.don_gia,
        "giam_gia": sp.giam_gia,
        "don_vi": sp.don_vi
    }
    db.delete(sp)
    db.commit()
    return success_response(data=jsonable_encoder(sp_data),message="Đã xóa sản phẩm và ảnh liên quan")

# ------------------ DANH MỤC ------------------
@router.get("/danh-muc")
def danh_muc(
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    ten_danh_muc: str | None = Query(None),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(DanhMucSanPham)
        if ten_danh_muc:
            query = query.filter(DanhMucSanPham.ten_danh_muc.ilike(f"%{ten_danh_muc}%"))

        total = query.count()
        danh_mucs = (
            query
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
        danh_muc_cha = danh_muc_cha if danh_muc_cha else None,
    )
    db.add(dm)
    db.commit()
    db.refresh(dm)

    if hinh_anh is not None and hinh_anh.filename:
        os.makedirs(UPLOAD_DIR_DANHMUC, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR_DANHMUC, dm.ten_danh_muc)
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

def xoa_danh_muc_recursively(ma_danh_muc: int, db: Session):
    # Lấy danh mục
    dm = db.query(DanhMucSanPham).filter(DanhMucSanPham.ma_danh_muc == ma_danh_muc).first()
    if not dm:
        return

    # Xóa tất cả danh mục con trước
    danh_muc_con_list = db.query(DanhMucSanPham).filter(DanhMucSanPham.danh_muc_cha == ma_danh_muc).all()
    for con_dm in danh_muc_con_list:
        xoa_danh_muc_recursively(con_dm.ma_danh_muc, db)

    # Xóa ảnh liên quan
    ha_list = db.query(HinhAnh).filter(HinhAnh.ma_danh_muc == dm.ma_danh_muc).all()
    for ha in ha_list:
        file_path = ha.duong_dan.replace("http://localhost:8000/", "")
        if os.path.exists(file_path):
            os.remove(file_path)
        db.delete(ha)

    dm_data = {
        "ma_danh_muc": dm.ma_danh_muc,
        "ten_danh_muc": dm.ten_danh_muc
    }

    # Xóa danh mục
    db.delete(dm)
    return dm_data

@router.delete("/xoa-danh-muc/{ma_danh_muc}")
def xoa_danh_muc(
    ma_danh_muc: int,
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(phan_quyen(admin))
):
    dm = db.query(DanhMucSanPham).filter(DanhMucSanPham.ma_danh_muc == ma_danh_muc).first()
    if not dm:
        return error_response(message="Danh mục không tồn tại")

    dm_data = xoa_danh_muc_recursively(ma_danh_muc, db)
    db.commit()
    return success_response(data=jsonable_encoder(dm_data) ,message="Đã xóa danh mục và ảnh liên quan")
    
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
            "ma_buu_dien": cn.ma_buu_dien,
            "nhan_viens": [{"ten_nhan_vien": nv.ho_ten, "ma_nhan_vien": nv.ma_nguoi_dung, "vai_tro": nv.vai_tro} for nv in cn.nguoi_dungs]
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
def danh_sach_nguoi_dung(
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    vai_tro: str | None = Query(None),
    ma_chi_nhanh: int | None = Query(None),
    currents_user: NguoiDung = Depends(phan_quyen(admin)),
    db: Session = Depends(get_db)
):
    query = db.query(NguoiDung)

    # ===== LỌC VAI TRÒ =====
    if vai_tro and vai_tro != "tatca":
        query = query.filter(NguoiDung.vai_tro == vai_tro)

    # ===== LỌC CHI NHÁNH (KHÔNG ÁP DỤNG CHO KHÁCH HÀNG) =====
    if ma_chi_nhanh:
        query = query.filter(NguoiDung.ma_chi_nhanh == ma_chi_nhanh)

    total = query.count()

    nguoi_dungs = (
        query
        .order_by(desc(NguoiDung.ma_nguoi_dung))
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []
    for nd in nguoi_dungs:
        result.append({
            "ma_nguoi_dung": nd.ma_nguoi_dung,
            "ho_ten": nd.ho_ten,
            "email": nd.email,
            "so_dien_thoai": nd.so_dien_thoai,
            "vai_tro": nd.vai_tro,
            "trang_thai": "Đang hoạt động" if nd.trang_thai else "Đã khóa",
            "ma_chi_nhanh": nd.ma_chi_nhanh,
            "ten_chi_nhanh": nd.chi_nhanh.ten_chi_nhanh if nd.ma_chi_nhanh else None
        })

    return success_response(
        data={
            "items": result,
            "total": total,
            "limit": limit,
            "offset": offset
        },
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
    tu_khoa: str = Query(None),
    currents_user: NguoiDung = Depends(phan_quyen(admin))
):
    
    query = db.query(TonKho).join(SanPham).join(ChiNhanh)

    if tu_khoa:
        query = query.filter(SanPham.ten_san_pham.ilike(f"%{tu_khoa}%" ))
    
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

#---------------- ĐƠN HÀNG -----------------
@router.get("/danh-sach-don-hang")
def danh_sach_don_hang(
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    tu_khoa: str | None = Query(None),
    ma_chi_nhanh: int = Query(None, description="Lọc theo chi nhánh"),
    trang_thai: str = Query(),
    currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), 
    db: Session = Depends(get_db)
):
    query = db.query(DonHang)
    if tu_khoa:
        query = query.filter(
            or_(
                DonHang.ho_ten.ilike(f"%{tu_khoa}%"),
                DonHang.so_dien_thoai.ilike(f"%{tu_khoa}%")
            )
    )

    if ma_chi_nhanh:
        query = query.filter(DonHang.ma_chi_nhanh == ma_chi_nhanh)  

    if trang_thai and trang_thai != "TAT_CA":
        query = query.filter(DonHang.trang_thai == trang_thai)  

    tong = query.count()
    don_hangs = (
        query
        .order_by(DonHang.ngay_dat.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )
    result = []

    for dh in don_hangs:
        ds_san_pham = []
        for ct in dh.chi_tiet_don_hangs:
            hinh_anh = None
            if hasattr(ct.san_pham, "hinh_anhs") and ct.san_pham.hinh_anhs:
                hinh_anh = ct.san_pham.hinh_anhs[0].duong_dan
            ds_san_pham.append(
                SanPhamLichSuDonHangOut(
                    ma_san_pham=ct.ma_san_pham,
                    ten_san_pham=ct.san_pham.ten_san_pham,
                    so_luong=ct.so_luong,
                    gia_goc=ct.gia_goc,
                    gia_sau_giam=ct.gia_sau_giam,
                    don_vi=ct.san_pham.don_vi,
                    hinh_anhs=hinh_anh
                )
            )
        result.append(
            DonHangOutAdmin(
                ma_don_hang=dh.ma_don_hang,
                ho_ten=dh.ho_ten,
                dia_chi=dh.dia_chi,
                so_dien_thoai=dh.so_dien_thoai,
                ma_chi_nhanh=dh.ma_chi_nhanh,
                ten_chi_nhanh=dh.chi_nhanh.ten_chi_nhanh,
                trang_thai=dh.trang_thai,
                trang_thai_thanh_toan=dh.trang_thai_thanh_toan,
                tong_tien=dh.tong_tien,
                tien_giam=dh.tien_giam,
                ngay_dat=dh.ngay_dat,
                chi_tiet=ds_san_pham,
            )
        )
    return success_response(
        data=jsonable_encoder({
            "items": result,
            "total": tong,
            "limit": limit,
            "offset": offset
        }),
        message="Thành công"
    )

@router.put("/don-hang/{ma_don_hang}/duyet")
def duyet_don_hang(
    ma_don_hang: int,
    currents_user: NguoiDung = Depends(phan_quyen(admin)),
    db: Session = Depends(get_db)
):
    don = db.query(DonHang).filter(DonHang.ma_don_hang == ma_don_hang).first()

    if not don:
        return error_response(message="Không tìm thấy đơn hàng")

    if don.trang_thai != "CHO_XU_LY":
        return error_response(message="Chỉ đơn hàng CHO_XU_LY mới được duyệt")

    don.trang_thai = "DA_XU_LY"
    db.commit()
    db.refresh(don)

    return success_response(
        data=jsonable_encoder(don),
        message="Duyệt đơn hàng thành công"
    )

@router.put("/don-hang/{ma_don_hang}/hoan-thanh")
def hoan_thanh_don_hang(
    ma_don_hang: int,
    currents_user: NguoiDung = Depends(phan_quyen(admin)),
    db: Session = Depends(get_db)
):
    print(currents_user.vai_tro)
    don = db.query(DonHang).filter(DonHang.ma_don_hang == ma_don_hang).first()

    if not don:
        return error_response(message="Không tìm thấy đơn hàng")

    if don.trang_thai != "DA_XU_LY":
        return error_response(message="Chỉ đơn hàng DA_XU_LY mới được hoàn thành")

    don.trang_thai = "HOAN_THANH"
    don.trang_thai_thanh_toan = "DA_THANH_TOAN"
    db.commit()
    db.refresh(don)

    return success_response(
        data=jsonable_encoder(don),
        message="Hoàn thành đơn hàng thành công"
    )

@router.put("/don-hang/{ma_don_hang}/huy")
def huy_don_hang(
    ma_don_hang: int,
    payload: HuyDonInput,
    currents_user: NguoiDung = Depends(phan_quyen(admin)),
    db: Session = Depends(get_db)
):
    don = db.query(DonHang).filter(DonHang.ma_don_hang == ma_don_hang).first()

    if not don:
        return error_response(message="Không tìm thấy đơn hàng")

    if don.trang_thai in ["HOAN_THANH", "DA_HUY"]:
        return error_response(message="Đơn đã kết thúc, không thể hủy")

    don.trang_thai = "DA_HUY"
    # Nếu bạn có bảng lưu lịch sử, có thể ghi lý do tại đây

    db.commit()
    db.refresh(don)

    return success_response(
        data=jsonable_encoder(don),
        message=f"Đơn hàng đã bị hủy. Lý do: {payload.ly_do}"
    )

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
def danh_sach_khuyen_mai( 
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    tu_khoa: str | None = Query(None),
    ma_chi_nhanh: int = Query(None, description="Lọc theo chi nhánh"),
    trang_thai: str = Query(None),
    db: Session = Depends(get_db), 
    current_user: NguoiDung = Depends(phan_quyen(admin))
):
    query = db.query(KhuyenMai)
    if tu_khoa:
        query = query.filter(
            or_(
                KhuyenMai.ten_khuyen_mai.ilike(f"%{tu_khoa}%"),
                KhuyenMai.mo_ta.ilike(f"%{tu_khoa}%")
            )
        )
    if ma_chi_nhanh:
        query = query.filter(KhuyenMai.ma_chi_nhanh == ma_chi_nhanh)
        
    if trang_thai and trang_thai != "TAT_CA":
        query = query.filter(KhuyenMai.trang_thai == trang_thai)
    tong = query.count()

    khuyen_mais = query.order_by(desc(KhuyenMai.ma_khuyen_mai)).limit(limit).offset(offset).all()
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
        data=jsonable_encoder({
            "items": result,
            "total": tong,
            "limit": limit,
            "offset": offset
        }),
        message="Thành công"
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
# ------------------ ĐÁNH GIÁ -------------------

@router.get("/danh-sach-danh-gia")
def danh_sach_danh_gia(
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    tu_khoa: str = Query(None),
    trang_thai: str = Query(None),
    current_user: NguoiDung = Depends(phan_quyen(admin)), 
    db: Session = Depends(get_db)
):  
    query = db.query(DanhGia).join(DanhGia.nguoi_dung).join(DanhGia.san_pham)

    if tu_khoa:
        search_filter = or_(
            NguoiDung.ho_ten.ilike(f"%{tu_khoa}%"),
            SanPham.ten_san_pham.ilike(f"%{tu_khoa}%"),
            DanhGia.binh_luan.ilike(f"%{tu_khoa}%")
        )
        query = query.filter(search_filter)

    if trang_thai and trang_thai != "TAT_CA":
        query = query.filter(DanhGia.trang_thai == trang_thai)

    tong = query.count()

    danh_gias = query.order_by(desc(DanhGia.ma_danh_gia)).limit(limit).offset(offset).all()

    result = []
    for dg in danh_gias:
        hinh_anh_sp = dg.san_pham.hinh_anhs[0].duong_dan if dg.san_pham.hinh_anhs else None
        
        danh_gia_item = {
            "ma_danh_gia": dg.ma_danh_gia,
            "ma_san_pham": dg.ma_san_pham,
            "ten_san_pham": dg.san_pham.ten_san_pham,
            "hinh_anh": hinh_anh_sp,
            "ma_nguoi_dung": dg.ma_nguoi_dung,
            "ten_nguoi_dung": dg.nguoi_dung.ho_ten,
            "so_sao": dg.sao,
            "binh_luan": dg.binh_luan,
            "ngay_danh_gia": dg.ngay_danh_gia.date().isoformat(),
            "trang_thai": dg.trang_thai,
        }
        result.append(danh_gia_item)

    return success_response(
        data=jsonable_encoder({
            "items": result,
            "total": tong,
            "limit": limit,
            "offset": offset
        }),
        message="Thành công"
    )

@router.put("/duyet-danh-gia/{ma_danh_gia}")
def duyet_danh_gia(ma_danh_gia: int, current_user: NguoiDung = Depends(phan_quyen(admin)), db: Session = Depends(get_db)):
    danh_gia = db.query(DanhGia).filter(DanhGia.ma_danh_gia == ma_danh_gia).first()
    if not danh_gia:
        return error_response(message="Đánh giá không tồn tại")
    danh_gia.trang_thai = "DA_DUYET"
    db.commit()
    return success_response(
        data=jsonable_encoder(danh_gia),
        message="Đã duyệt đánh giá thành công"  
    )

@router.put("/tu-choi-danh-gia/{ma_danh_gia}")
def duyet_danh_gia(ma_danh_gia: int, current_user: NguoiDung = Depends(phan_quyen(admin)), db: Session = Depends(get_db)):
    danh_gia = db.query(DanhGia).filter(DanhGia.ma_danh_gia == ma_danh_gia).first()
    if not danh_gia:
        return error_response(message="Đánh giá không tồn tại")
    danh_gia.trang_thai = "DA_HUY"
    db.commit()
    return success_response(
        data=jsonable_encoder(danh_gia),
        message="Đã từ chối đánh giá"
    )

# ------------------ TỔNG QUAN ------------------
def tinh_khoang_so_sanh(tu_ngay: datetime, den_ngay: datetime, kieu_so_sanh: str):
    
    label = ""
    tu_truoc, den_truoc = None, None

    # 1. So sánh tùy chỉnh (Tính theo độ dài range)
    if kieu_so_sanh == "custom" and tu_ngay and den_ngay:
        so_ngay = (den_ngay.date() - tu_ngay.date()).days + 1
        tu_truoc = tu_ngay - timedelta(days=so_ngay)
        den_truoc = tu_ngay - timedelta(days=1)
        label = f"{so_ngay} ngày trước đó ({tu_truoc.strftime('%d/%m')} - {den_truoc.strftime('%d/%m')})"

    # 2. So sánh theo Preset
    elif kieu_so_sanh == "7_ngay":
        tu_truoc, den_truoc = tu_ngay - timedelta(days=7), den_ngay - timedelta(days=7)
        label = "7 ngày trước đó"

    elif kieu_so_sanh == "30_ngay":
        tu_truoc, den_truoc = tu_ngay - timedelta(days=30), den_ngay - timedelta(days=30)
        label = "30 ngày trước đó"

    elif kieu_so_sanh == "thang_truoc":
        tu_truoc = (tu_ngay.replace(day=1) - timedelta(days=1)).replace(day=1)
        den_truoc = tu_ngay.replace(day=1) - timedelta(days=1)
        label = "Tháng trước"

    elif kieu_so_sanh == "nam_truoc":
        tu_truoc = tu_ngay.replace(year=tu_ngay.year - 1)
        den_truoc = den_ngay.replace(year=den_ngay.year - 1)
        label = "Cùng kỳ năm trước"

    return tu_truoc, den_truoc, label

# # @router.get("/don-hang")
# # def lay_danh_sach_don_hang(
# #     db: Session = Depends(get_db),
# #     # Các tham số lọc
# #     ma_chi_nhanh: Optional[int] = Query(None, description="Lọc theo mã chi nhánh"),
# #     tu_ngay: Optional[datetime] = Query(None, description="Lọc từ ngày (YYYY-MM-DD)"),
# #     den_ngay: Optional[datetime] = Query(None, description="Lọc đến ngày (YYYY-MM-DD)"),
# #     ten_khach_hang: Optional[str] = Query(None, description="Tìm theo tên khách hàng"),
# #     so_dien_thoai: Optional[str] = Query(None, description="Tìm theo số điện thoại"),
# #     ten_san_pham: Optional[str] = Query(None, description="Lọc đơn hàng có chứa sản phẩm này")
# # ):
# #     # Khởi tạo query và join các bảng cần thiết để lọc
# #     query = db.query(DonHang).join(DonHang.chi_tiet_don_hangs).join(ChiTietDonHang.san_pham)
    
# #     bo_loc = []

# #     # 1. Lọc theo chi nhánh
# #     if ma_chi_nhanh:
# #         bo_loc.append(DonHang.ma_chi_nhanh == ma_chi_nhanh)

# #     # 2. Lọc theo khoảng thời gian
# #     if tu_ngay:
# #         bo_loc.append(DonHang.ngay_dat >= tu_ngay)
# #     if den_ngay:
# #         bo_loc.append(DonHang.ngay_dat <= den_ngay)

# #     # 3. Tìm theo tên khách hàng (không dấu hoặc có dấu tùy cấu hình DB)
# #     if ten_khach_hang:
# #         bo_loc.append(DonHang.ho_ten.ilike(f"%{ten_khach_hang}%"))

# #     # 4. Tìm theo số điện thoại
# #     if so_dien_thoai:
# #         bo_loc.append(DonHang.so_dien_thoai.contains(so_dien_thoai))
# #     if ten_san_pham:
# #         bo_loc.append(SanPham.ten_san_pham.ilike(f"%{ten_san_pham}%"))

# #     # Thực thi query với bộ lọc
# #     if bo_loc:
# #         query = query.filter(and_(*bo_loc))
# #     ket_qua = (
# #         query.options(
# #             # Từ bảng Đơn Hàng chỉ lấy các cột này
# #             load_only(DonHang.ma_don_hang, DonHang.tong_tien, DonHang.ngay_dat, DonHang.ma_chi_nhanh),
            
# #             # Load sâu vào Chi Tiết và chỉ lấy Số lượng, Giá
# #             joinedload(DonHang.chi_tiet_don_hangs).options(
# #                 load_only(ChiTietDonHang.so_luong, ChiTietDonHang.gia_tien, ChiTietDonHang.ma_san_pham),
                
# #                 # Load sâu vào Sản Phẩm và chỉ lấy Tên + Hình ảnh
# #                 joinedload(ChiTietDonHang.san_pham).options(
# #                     load_only(SanPham.ten_san_pham),
# #                     joinedload(SanPham.hinh_anhs).load_only(HinhAnh.duong_dan) # Giả sử bảng hình ảnh có cột url
# #                 )
# #             ),
# #             # Load tên chi nhánh
# #             joinedload(DonHang.chi_nhanh).load_only(ChiNhanh.ten_chi_nhanh)
# #         )
# #         .distinct()
# #         .all()
# #     )

# #     return ket_qua

# def query_tong_quan(db: Session, ma_chi_nhanh, tu_ngay, den_ngay, ten_san_pham):
#     query = db.query(
#         func.coalesce(func.sum(DonHang.tong_tien), 0).label("doanh_thu"),
#         func.count(distinct(DonHang.ma_don_hang)).label("so_don"),
#         func.count(distinct(DonHang.ma_nguoi_dung)).label("khach_hang")
#     ).select_from(DonHang)

#     # Quan trọng: Sử dụng outerjoin để tránh mất dữ liệu DonHang nếu lọc theo tên SP
#     if ten_san_pham:
#         query = (
#             query
#             .outerjoin(ChiTietDonHang, ChiTietDonHang.ma_don_hang == DonHang.ma_don_hang)
#             .outerjoin(SanPham, SanPham.ma_san_pham == ChiTietDonHang.ma_san_pham)
#             .filter(SanPham.ten_san_pham.ilike(f"%{ten_san_pham}%"))
#         )

#     if ma_chi_nhanh:
#         query = query.filter(DonHang.ma_chi_nhanh == ma_chi_nhanh)
#     if tu_ngay:
#         query = query.filter(DonHang.ngay_dat >= tu_ngay)
#     if den_ngay:
#         query = query.filter(DonHang.ngay_dat <= den_ngay)

#     return query.first()

# def query_top_san_pham(db: Session, ma_chi_nhanh, tu_ngay, den_ngay, ten_san_pham, limit=None):
#     # Tính doanh thu bằng cách ưu tiên gia_sau_giam, nếu không có thì lấy gia_goc
#     doanh_thu_tinh_toan = func.sum(
#         ChiTietDonHang.so_luong * func.coalesce(ChiTietDonHang.gia_sau_giam, ChiTietDonHang.gia_goc)
#     )

#     query = (
#         db.query(
#             SanPham.ma_san_pham.label("id"),
#             SanPham.ten_san_pham.label("ten"),
#             func.coalesce(func.sum(ChiTietDonHang.so_luong), 0).label("so_luong"),
#             func.coalesce(doanh_thu_tinh_toan, 0).label("doanh_thu"),
#             func.min(HinhAnh.duong_dan).label("hinh_anh")
#         )
#         .outerjoin(ChiTietDonHang, ChiTietDonHang.ma_san_pham == SanPham.ma_san_pham)
#         .outerjoin(DonHang, DonHang.ma_don_hang == ChiTietDonHang.ma_don_hang)
#         .outerjoin(HinhAnh, HinhAnh.ma_san_pham == SanPham.ma_san_pham)
#     )

#     if tu_ngay: query = query.filter(DonHang.ngay_dat >= tu_ngay)
#     if den_ngay: query = query.filter(DonHang.ngay_dat <= den_ngay)
#     if ten_san_pham: query = query.filter(SanPham.ten_san_pham.ilike(f"%{ten_san_pham}%"))
#     if ma_chi_nhanh: query = query.filter(DonHang.ma_chi_nhanh == ma_chi_nhanh)

#     final_query = query.group_by(SanPham.ma_san_pham, SanPham.ten_san_pham).order_by(desc("doanh_thu"))
#     if limit: final_query = final_query.limit(limit)
#     return final_query.all()
# @router.get("/tong-quan")
# def dashboard_tong_quan(
#     db: Session = Depends(get_db),
#     ma_chi_nhanh: Optional[int] = Query(None),
#     tu_ngay: Optional[datetime] = Query(None),
#     den_ngay: Optional[datetime] = Query(None),
#     ten_san_pham: Optional[str]  = Query(None),
#     kieu_so_sanh: Optional[str] = Query("7_ngay")   
# ):
#     # 1. ===== XỬ LÝ KỲ TRƯỚC =====
#     # Lấy khoảng ngày và mô tả text trước khi query
#     if den_ngay:
#         den_ngay = den_ngay.replace(hour=23, minute=59, second=59, microsecond=999999)
#     tu_truoc, den_truoc, mo_ta_so_sanh = tinh_khoang_so_sanh(
#         tu_ngay, den_ngay, kieu_so_sanh
#     )

#     # 2. ===== QUERY DỮ LIỆU =====
#     # Query kỳ hiện tại
#     hien_tai = query_tong_quan(db, ma_chi_nhanh, tu_ngay, den_ngay, ten_san_pham)

#     # Query kỳ trước (nếu có)
#     ky_truoc_data = None
#     if tu_truoc and den_truoc:
#         ky_truoc_data = query_tong_quan(db, ma_chi_nhanh, tu_truoc, den_truoc, ten_san_pham)

#     # 3. ===== TÍNH TOÁN TỶ LỆ TĂNG TRƯỞNG (%) =====
#     def tinh_pct(hien_tai_val, truoc_val):
#         val_ht = hien_tai_val or 0
#         val_tr = truoc_val or 0
#         if val_tr == 0:
#             return 100 if val_ht > 0 else 0
#         return round((val_ht - val_tr) / val_tr * 100, 2)

#     # Chuẩn bị dữ liệu kỳ trước để so sánh
#     kt_doanh_thu = ky_truoc_data.doanh_thu if ky_truoc_data else 0
#     kt_so_don = ky_truoc_data.so_don if ky_truoc_data else 0
#     kt_khach_hang = ky_truoc_data.khach_hang if ky_truoc_data else 0

#     return {
#         "bo_loc": {
#             "ma_chi_nhanh": ma_chi_nhanh,
#             "tu_ngay": tu_ngay,
#             "den_ngay": den_ngay,
#             "kieu_so_sanh": kieu_so_sanh,
#             "mo_ta_so_sanh": mo_ta_so_sanh
#         },
#         "hien_tai": {
#             "doanh_thu": hien_tai.doanh_thu or 0,
#             "so_don": hien_tai.so_don or 0,
#             "khach_hang": hien_tai.khach_hang or 0
#         },
#         "so_sanh": {
#             "doanh_thu_pct": tinh_pct(hien_tai.doanh_thu, kt_doanh_thu),
#             "so_don_pct": tinh_pct(hien_tai.so_don, kt_so_don),
#             "khach_hang_pct": tinh_pct(hien_tai.khach_hang, kt_khach_hang)
#         }
#     }

# def query_top_san_pham(
#     db: Session,
#     ma_chi_nhanh: Optional[int],
#     tu_ngay: datetime,
#     den_ngay: datetime,
#     ten_san_pham: str,
#     limit: int = None 
# ):
#     query = (
#         db.query(
#             SanPham.ma_san_pham.label("id"),
#             SanPham.ten_san_pham.label("ten"),
#             func.coalesce(func.sum(ChiTietDonHang.so_luong), 0).label("so_luong"),
#             func.coalesce(func.sum(ChiTietDonHang.so_luong * func.coalesce(ChiTietDonHang.gia_sau_giam, ChiTietDonHang.gia_goc)), 0).label("doanh_thu"),
#             func.min(HinhAnh.duong_dan).label("hinh_anh")
#         )
#         .outerjoin(ChiTietDonHang, ChiTietDonHang.ma_san_pham == SanPham.ma_san_pham)
#         .outerjoin(DonHang, DonHang.ma_don_hang == ChiTietDonHang.ma_don_hang)
#         .outerjoin(HinhAnh, HinhAnh.ma_san_pham == SanPham.ma_san_pham)
#     )
#     if tu_ngay:
#         query = query.filter(DonHang.ngay_dat >= tu_ngay)

#     if den_ngay:
#         query = query.filter(DonHang.ngay_dat <= den_ngay)

#     if ten_san_pham:
#         query = query.filter(
#             SanPham.ten_san_pham.ilike(f"%{ten_san_pham}%")
#         )

#     if ma_chi_nhanh:
#         query = query.filter((DonHang.ma_chi_nhanh == ma_chi_nhanh) | (DonHang.ma_chi_nhanh == None))

#     final_query = query.group_by(SanPham.ma_san_pham, SanPham.ten_san_pham).order_by(desc("doanh_thu"))

#     if limit:
#         final_query = final_query.limit(limit)

#     return final_query.all()

# @router.get("/tong-quan/top-san-pham")
# def get_top_san_pham(
#     db: Session = Depends(get_db),
#     ma_chi_nhanh: Optional[int] = Query(None),
#     tu_ngay: Optional[datetime] = Query(None),
#     den_ngay: Optional[datetime] = Query(None),
#     kieu_so_sanh: Optional[str] = Query("7_ngay"),
#     ten_san_pham: Optional[str]  = Query(None),
# ):
#     if den_ngay:
#         den_ngay = den_ngay.replace(hour=23, minute=59, second=59, microsecond=999999)
#     tu_truoc, den_truoc, _ = tinh_khoang_so_sanh(tu_ngay, den_ngay, kieu_so_sanh)

#     top_hien_tai = query_top_san_pham(db, ma_chi_nhanh, tu_ngay, den_ngay, ten_san_pham)
#     doanh_thu_truoc_map = {}
#     if tu_truoc and den_truoc:
#         top_truoc = query_top_san_pham(db, ma_chi_nhanh, tu_truoc, den_truoc, ten_san_pham, limit=100)
#         doanh_thu_truoc_map = {item.id: item.doanh_thu for item in top_truoc}

#     ket_qua = []
#     for sp in top_hien_tai:
#         dt_ht = sp.doanh_thu or 0
#         dt_tr = doanh_thu_truoc_map.get(sp.id, 0)
        
#         if dt_tr > 0:
#             phan_tram = round((dt_ht - dt_tr) / dt_tr * 100, 2)
#         else:
#             phan_tram = 100.0 if dt_ht > 0 else 0.0

#         ket_qua.append({
#             "id": sp.id,
#             "ten": sp.ten,
#             "hinh_anh": sp.hinh_anh,
#             "doanh_thu": dt_ht,
#             "so_luong": sp.so_luong,
#             "phan_tram_tang_truong": phan_tram,
#             "ky_truoc_doanh_thu": dt_tr
#         })

#     return ket_qua

# def query_hieu_suat(
#     db: Session,
#     tu_ngay: datetime,
#     den_ngay: datetime
# ):
#     # Query cơ bản lấy thông tin chi nhánh và doanh số
#     return (
#         db.query(
#             ChiNhanh.ma_chi_nhanh.label("id"),
#             ChiNhanh.ten_chi_nhanh.label("ten"),
#             func.count(DonHang.ma_don_hang).label("so_don"),
#             func.coalesce(func.sum(DonHang.tong_tien), 0).label("doanh_thu")
#         )
#         .outerjoin(DonHang, (DonHang.ma_chi_nhanh == ChiNhanh.ma_chi_nhanh) & 
#                            (DonHang.ngay_dat >= tu_ngay) & 
#                            (DonHang.ngay_dat <= den_ngay))
#         .group_by(ChiNhanh.ma_chi_nhanh)
#         .all()
#     )

# @router.get("/tong-quan/hieu-suat-chi-nhanh")
# def hieu_suat_chi_nhanh(
#     db: Session = Depends(get_db),
#     tu_ngay: Optional[datetime] = Query(None),
#     den_ngay: Optional[datetime] = Query(None),
#     kieu_so_sanh: Optional[str] = Query(
#         "7_ngay",
#         description="1_ngay, 7_ngay, 30_ngay, 90_ngay, thang_truoc, nam_truoc"
#     )
# ):
#     # 1. Lấy dữ liệu kỳ hiện tại
#     hien_tai = query_hieu_suat(db, tu_ngay, den_ngay)

#     # 2. Tính toán kỳ trước dựa trên func của bạn
#     tu_truoc, den_truoc, _  = tinh_khoang_so_sanh(tu_ngay, den_ngay, kieu_so_sanh)
    
#     # 3. Lấy dữ liệu kỳ trước và map vào dictionary
#     doanh_thu_truoc_map = {}
#     if tu_truoc and den_truoc:
#         truoc = query_hieu_suat(db, tu_truoc, den_truoc)
#         doanh_thu_truoc_map = {item.id: item.doanh_thu for item in truoc}

#     # 4. Tổng hợp kết quả và tính % tăng trưởng
#     ket_qua = []
#     for cn in hien_tai:
#         dt_ht = cn.doanh_thu
#         dt_tr = doanh_thu_truoc_map.get(cn.id, 0)
        
#         phan_tram = None
#         if dt_tr > 0:
#             phan_tram = round((dt_ht - dt_tr) / dt_tr * 100, 2)
#         elif dt_ht > 0:
#             phan_tram = 100.0 # Tăng trưởng tuyệt đối nếu kỳ trước không có doanh thu

#         ket_qua.append({
#             "ten": cn.ten,
#             "don_hang": cn.so_don,
#             "doanh_thu": dt_ht,
#             "phan_tram_tang_truong": phan_tram
#         })

#     # Sắp xếp theo doanh thu giảm dần
#     return sorted(ket_qua, key=lambda x: x['doanh_thu'], reverse=True)

# @router.get("/tong-quan/bieu-do-so-sanh")
# def bieu_do_so_sanh(
#     db: Session = Depends(get_db),
#     ma_chi_nhanh: Optional[int] = Query(None),
#     tu_ngay: datetime = Query(...),
#     den_ngay: datetime = Query(...),
#     kieu_so_sanh: str = Query("7_ngay")
# ):
#     if den_ngay:
#         den_ngay = den_ngay.replace(hour=23, minute=59, second=59, microsecond=999999)
#     tu_truoc, den_truoc, _ = tinh_khoang_so_sanh(tu_ngay, den_ngay, kieu_so_sanh)

#     def get_full_data(start, end):
#         if not start or not end: return []
        
#         # 1. Lấy dữ liệu thực tế từ DB
#         results = db.query(
#             cast(DonHang.ngay_dat, Date).label("ngay"),
#             func.sum(DonHang.tong_tien).label("total")
#         ).filter(
#             DonHang.ngay_dat >= start, 
#             DonHang.ngay_dat <= f"{end.date()} 23:59:59"
#         )
#         if ma_chi_nhanh and ma_chi_nhanh != "Tất cả":
#             results = results.filter(DonHang.ma_chi_nhanh == ma_chi_nhanh)
        
#         db_data = {r.ngay: float(r.total or 0) for r in results.group_by(cast(DonHang.ngay_dat, Date)).all()}

#         # 2. Tạo danh sách ĐẦY ĐỦ các ngày từ start đến end
#         full_series = []
#         current_date = start.date()
#         while current_date <= end.date():
#             full_series.append({
#                 "label": current_date.strftime("%d/%m"),
#                 "value": db_data.get(current_date, 0) # Nếu DB không có ngày này, gán = 0
#             })
#             current_date += timedelta(days=1)
#         return full_series

#     hien_tai_full = get_full_data(tu_ngay, den_ngay)
    
#     # Đối với kỳ trước, chúng ta cũng cần tạo đủ số lượng điểm tương ứng với kỳ hiện tại
#     # Tuy nhiên, để biểu đồ MUI vẽ đè lên nhau được, 2 mảng data phải có ĐỘ DÀI BẰNG NHAU.
#     ky_truoc_full = get_full_data(tu_truoc, den_truoc) if tu_truoc else []

#     return {
#         "labels": [d["label"] for d in hien_tai_full],
#         "data_hien_tai": [d["value"] for d in hien_tai_full],
#         "data_ky_truoc": [d["value"] for d in ky_truoc_full][:len(hien_tai_full)] # Cắt bằng độ dài kỳ hiện tại
#     }


def query_tong_quan(db: Session, ma_chi_nhanh, tu_ngay, den_ngay, ten_san_pham):
    query = db.query(
        func.coalesce(func.sum(DonHang.tong_tien), 0).label("doanh_thu"),
        func.count(distinct(DonHang.ma_don_hang)).label("so_don"),
        func.count(distinct(DonHang.ma_nguoi_dung)).label("khach_hang")
    ).select_from(DonHang)

    # Dùng OUTER JOIN để nếu lọc SP không thấy thì vẫn trả về 0 thay vì None
    if ten_san_pham:
        query = (
            query
            .outerjoin(ChiTietDonHang, ChiTietDonHang.ma_don_hang == DonHang.ma_don_hang)
            .outerjoin(SanPham, SanPham.ma_san_pham == ChiTietDonHang.ma_san_pham)
            .filter(SanPham.ten_san_pham.ilike(f"%{ten_san_pham}%"))
        )

    if ma_chi_nhanh:
        query = query.filter(DonHang.ma_chi_nhanh == ma_chi_nhanh)
    if tu_ngay:
        query = query.filter(DonHang.ngay_dat >= tu_ngay)
    if den_ngay:
        query = query.filter(DonHang.ngay_dat <= den_ngay)

    return query.first()

def query_top_san_pham(db: Session, ma_chi_nhanh, tu_ngay, den_ngay, ten_san_pham, limit=None):
    # Tính doanh thu thực tế dựa trên giá sau giảm
    doanh_thu_thuc_te = func.sum(
        ChiTietDonHang.so_luong * func.coalesce(ChiTietDonHang.gia_sau_giam, ChiTietDonHang.gia_goc)
    )

    query = (
        db.query(
            SanPham.ma_san_pham.label("id"),
            SanPham.ten_san_pham.label("ten"),
            func.coalesce(func.sum(ChiTietDonHang.so_luong), 0).label("so_luong"),
            func.coalesce(doanh_thu_thuc_te, 0).label("doanh_thu"),
            func.min(HinhAnh.duong_dan).label("hinh_anh")
        )
        .outerjoin(ChiTietDonHang, ChiTietDonHang.ma_san_pham == SanPham.ma_san_pham)
        .outerjoin(DonHang, DonHang.ma_don_hang == ChiTietDonHang.ma_don_hang)
        .outerjoin(HinhAnh, HinhAnh.ma_san_pham == SanPham.ma_san_pham)
    )

    if tu_ngay: query = query.filter(DonHang.ngay_dat >= tu_ngay)
    if den_ngay: query = query.filter(DonHang.ngay_dat <= den_ngay)
    if ten_san_pham: query = query.filter(SanPham.ten_san_pham.ilike(f"%{ten_san_pham}%"))
    if ma_chi_nhanh: query = query.filter(DonHang.ma_chi_nhanh == ma_chi_nhanh)

    final_query = query.group_by(SanPham.ma_san_pham, SanPham.ten_san_pham).order_by(desc("doanh_thu"))
    if limit: final_query = final_query.limit(limit)
    return final_query.all()

@router.get("/tong-quan")
def dashboard_tong_quan(
    db: Session = Depends(get_db),
    ma_chi_nhanh: Optional[int] = Query(None),
    tu_ngay: Optional[datetime] = Query(None),
    den_ngay: Optional[datetime] = Query(None),
    ten_san_pham: Optional[str] = Query(None),
    kieu_so_sanh: str = "7_ngay"
):
    # CHUẨN HÓA THỜI GIAN: Quan trọng nhất để lấy được ngày cuối cùng
    if den_ngay:
        den_ngay = den_ngay.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    tu_truoc, den_truoc, mo_ta_so_sanh = tinh_khoang_so_sanh(tu_ngay, den_ngay, kieu_so_sanh)

    # 1. Lấy dữ liệu 2 kỳ
    hien_tai = query_tong_quan(db, ma_chi_nhanh, tu_ngay, den_ngay, ten_san_pham)
    ky_truoc = query_tong_quan(db, ma_chi_nhanh, tu_truoc, den_truoc, ten_san_pham) if tu_truoc else None

    # 2. Hàm tính % tăng trưởng
    def tinh_pct(val_ht, val_tr):
        ht = val_ht or 0
        tr = val_tr or 0
        if tr == 0: return 100 if ht > 0 else 0
        return round((ht - tr) / tr * 100, 2)

    return {
        "bo_loc": {"mo_ta_so_sanh": mo_ta_so_sanh, "tu_ngay": tu_ngay, "den_ngay": den_ngay},
        "hien_tai": {
            "doanh_thu": hien_tai.doanh_thu,
            "so_don": hien_tai.so_don,
            "khach_hang": hien_tai.khach_hang
        },
        "so_sanh": {
            "doanh_thu_pct": tinh_pct(hien_tai.doanh_thu, ky_truoc.doanh_thu if ky_truoc else 0),
            "so_don_pct": tinh_pct(hien_tai.so_don, ky_truoc.so_don if ky_truoc else 0),
            "khach_hang_pct": tinh_pct(hien_tai.khach_hang, ky_truoc.khach_hang if ky_truoc else 0)
        }
    }

@router.get("/tong-quan/hieu-suat-chi-nhanh")
def hieu_suat_chi_nhanh(
    db: Session = Depends(get_db),
    tu_ngay: Optional[datetime] = Query(None),
    den_ngay: Optional[datetime] = Query(None),
    kieu_so_sanh: str = "7_ngay"
):
    if den_ngay:
        den_ngay = den_ngay.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    tu_truoc, den_truoc, _ = tinh_khoang_so_sanh(tu_ngay, den_ngay, kieu_so_sanh)

    hien_tai = (
        db.query(
            ChiNhanh.ma_chi_nhanh.label("id"),
            ChiNhanh.ten_chi_nhanh.label("ten"),
            func.count(DonHang.ma_don_hang).label("so_don"),
            func.coalesce(func.sum(DonHang.tong_tien), 0).label("doanh_thu")
        )
        .outerjoin(DonHang, (DonHang.ma_chi_nhanh == ChiNhanh.ma_chi_nhanh) & 
                           (DonHang.ngay_dat >= tu_ngay) & (DonHang.ngay_dat <= den_ngay))
        .group_by(ChiNhanh.ma_chi_nhanh).all()
    )

    # Query kỳ trước để so sánh
    doanh_thu_truoc_map = {}
    if tu_truoc:
        truoc = db.query(ChiNhanh.ma_chi_nhanh.label("id"), func.sum(DonHang.tong_tien).label("dt")) \
                  .join(DonHang).filter(DonHang.ngay_dat >= tu_truoc, DonHang.ngay_dat <= den_truoc) \
                  .group_by(ChiNhanh.ma_chi_nhanh).all()
        doanh_thu_truoc_map = {item.id: item.dt for item in truoc}

    ket_qua = []
    for cn in hien_tai:
        dt_ht = cn.doanh_thu or 0
        dt_tr = doanh_thu_truoc_map.get(cn.id, 0)
        ket_qua.append({
            "ten": cn.ten,
            "don_hang": cn.so_don,
            "doanh_thu": dt_ht,
            "phan_tram_tang_truong": round((dt_ht - dt_tr) / dt_tr * 100, 2) if dt_tr > 0 else (100.0 if dt_ht > 0 else 0)
        })

    return sorted(ket_qua, key=lambda x: x['doanh_thu'], reverse=True)

@router.get("/tong-quan/top-san-pham")
def get_top_san_pham_api(
    db: Session = Depends(get_db),
    ma_chi_nhanh: Optional[int] = Query(None),
    tu_ngay: Optional[datetime] = Query(None),
    den_ngay: Optional[datetime] = Query(None),
    ten_san_pham: Optional[str] = Query(None),
    kieu_so_sanh: str = Query("7_ngay")
):
    if den_ngay:
        den_ngay = den_ngay.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # Tính khoảng thời gian kỳ trước (ví dụ: 7 ngày trước đó nữa)
    tu_truoc, den_truoc, _ = tinh_khoang_so_sanh(tu_ngay, den_ngay, kieu_so_sanh)

    # 2. Lấy Top 10 sản phẩm kỳ hiện tại
    top_hien_tai = query_top_san_pham(db, ma_chi_nhanh, tu_ngay, den_ngay, ten_san_pham, limit=10)

    # 3. Lấy dữ liệu kỳ trước để so sánh (không limit để map đúng ID sản phẩm)
    doanh_thu_truoc_map = {}
    if tu_truoc and den_truoc:
        top_truoc = query_top_san_pham(db, ma_chi_nhanh, tu_truoc, den_truoc, ten_san_pham, limit=100)
        doanh_thu_truoc_map = {item.id: item.doanh_thu for item in top_truoc}

    # 4. Tổng hợp và tính toán % tăng trưởng
    ket_qua = []
    for sp in top_hien_tai:
        dt_ht = sp.doanh_thu or 0
        dt_tr = doanh_thu_truoc_map.get(sp.id, 0)
        
        # Tính phần trăm tăng trưởng doanh thu
        if dt_tr > 0:
            phan_tram = round((dt_ht - dt_tr) / dt_tr * 100, 2)
        else:
            phan_tram = 100.0 if dt_ht > 0 else 0.0

        ket_qua.append({
            "id": sp.id,
            "ten": sp.ten,
            "hinh_anh": sp.hinh_anh,
            "doanh_thu": dt_ht,
            "so_luong": sp.so_luong,
            "phan_tram_tang_truong": phan_tram,
            "ky_truoc_doanh_thu": dt_tr
        })

    return ket_qua

@router.get("/tong-quan/bieu-do-so-sanh")
def bieu_do_so_sanh(
    db: Session = Depends(get_db),
    ma_chi_nhanh: Optional[int] = Query(None),
    tu_ngay: datetime = Query(...),
    den_ngay: datetime = Query(...),
    kieu_so_sanh: str = Query("7_ngay")
):
  
    if den_ngay:
        den_ngay = den_ngay.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    tu_truoc, den_truoc, _ = tinh_khoang_so_sanh(tu_ngay, den_ngay, kieu_so_sanh)

    def get_full_data(start, end):
        if not start or not end: 
            return []
        end_dt = end.replace(hour=23, minute=59, second=59)
        results = db.query(
            cast(DonHang.ngay_dat, Date).label("ngay"),
            func.coalesce(func.sum(DonHang.tong_tien), 0).label("total")
        ).filter(
            DonHang.ngay_dat >= start, 
            DonHang.ngay_dat <= end_dt
        )
        
        if ma_chi_nhanh:
            results = results.filter(DonHang.ma_chi_nhanh == ma_chi_nhanh)
        
        # Chuyển kết quả query thành dictionary {date: value} để lookup nhanh
        db_data = {r.ngay: float(r.total or 0) for r in results.group_by(cast(DonHang.ngay_dat, Date)).all()}

        # 2. Tạo danh sách ĐẦY ĐỦ các ngày từ start đến end để tránh đứt đoạn biểu đồ
        full_series = []
        current_date = start.date()
        while current_date <= end.date():
            full_series.append({
                "label": current_date.strftime("%d/%m"),
                "value": db_data.get(current_date, 0) # Nếu DB không có ngày này, gán = 0
            })
            current_date += timedelta(days=1)
        return full_series

    # Thực hiện lấy dữ liệu cho kỳ hiện tại và kỳ trước
    hien_tai_full = get_full_data(tu_ngay, den_ngay)
    ky_truoc_full = get_full_data(tu_truoc, den_truoc) if tu_truoc else []

    # Trả về format dữ liệu chuẩn cho Frontend
    # Lưu ý: Cắt hoặc bù mảng kỳ trước để có độ dài BẰNG mảng hiện tại giúp MUI Chart vẽ đè lên nhau
    return {
        "labels": [d["label"] for d in hien_tai_full],
        "data_hien_tai": [d["value"] for d in hien_tai_full],
        "data_ky_truoc": [d["value"] for d in ky_truoc_full][:len(hien_tai_full)] if ky_truoc_full else [0] * len(hien_tai_full)
    }