from datetime import datetime
import json
from typing  import List
from typing import Optional
import os
from fastapi import APIRouter, Depends, Form, HTTPException, Query, UploadFile, File
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
from api.schemas import KhuyenMaiCreate, NguoiDungCreate, NhanVienCreate, SanPhamKMItem, SanPhamYeuCauOut, TonKhoCreate, TonKhoUpdate, YeuCauNhapHangCreate, YeuCauNhapHangOut, YeuCauNhapHangUpdate
from sqlalchemy import desc
from sqlalchemy.orm import Session

from api.database import get_db, SessionLocal
from api.models import ChiNhanh, KhuyenMai, SanPham, DanhMucSanPham, HinhAnh, NguoiDung, SanPhamKhuyenMai, SanPhamYeuCau, TonKho, YeuCauNhapHang
from api.routers.auth import lay_nguoi_dung_hien_tai, ma_hoa_mat_khau
from api.utils.response_helpers import success_response, error_response

UPLOAD_DIR_KHUYENMAI = "uploads/khuyenmais"

router = APIRouter(prefix="/manager", tags=["Quản lý"])

#---------------- NHÂN VIÊN -----------------
@router.get("/danh-sach-nhan-vien")
def danh_sach_nhan_vien(currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):
    ma_chi_nhanh = currents_user.ma_chi_nhanh

    nhan_viens = db.query(NguoiDung).filter(
        NguoiDung.ma_chi_nhanh == ma_chi_nhanh,
        NguoiDung.vai_tro == "NHAN_VIEN"
        ).all()
    result = []
    for nv in nhan_viens:
        nhan_vien_data = {
            "ma_nguoi_dung": nv.ma_nguoi_dung,
            "ho_ten": nv.ho_ten,
            "email": nv.email,
            "so_dien_thoai": nv.so_dien_thoai,
            "dia_chi": nv.dia_chi,
            "ngay_sinh": nv.ngay_sinh,
            "gioi_tinh": nv.gioi_tinh,
            "vai_tro": nv.vai_tro,
            "trang_thai": nv.trang_thai,
            "ma_chi_nhanh": nv.ma_chi_nhanh if nv.ma_chi_nhanh else None
        }
        result.append(nhan_vien_data)
    return success_response(
        data=jsonable_encoder(result),
        message="Lấy danh sách người dùng thành công"
    )

@router.post("/them-nhan-vien")
async def them_nhan_vien(
    nguoidung: NhanVienCreate, 
    currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai),
    db: Session = Depends(get_db)
):
    ma_chi_nhanh = currents_user.ma_chi_nhanh
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
        vai_tro = "NHAN_VIEN",
        ma_chi_nhanh= ma_chi_nhanh,
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
def khoa_tai_khoan(ma_nguoi_dung: int, currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):
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
def mo_khoa_tai_khoan(ma_nguoi_dung: int, currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):
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

#---------------- TỒN KHO -----------------

@router.get("/danh-sach-ton-kho")
def lay_danh_sach_ton_kho(
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai)
):
    ma_chi_nhanh = currents_user.ma_chi_nhanh
    query = db.query(TonKho).join(SanPham).join(ChiNhanh)
    ton_khos = query.filter(TonKho.ma_chi_nhanh == ma_chi_nhanh).all()

    total = db.query(TonKho).count()

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

@router.put("/cap-nhat-ton-kho/{ma_san_pham}")
def cap_nhat_ton_kho(ma_san_pham: int, update: TonKhoUpdate, currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):
    ma_chi_nhanh = currents_user.ma_chi_nhanh
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

#---------------- NHẬP HÀNG -----------------

# @router.post("/yeu-cau-nhap-hang")
# def yeu_cau_nhap_hang(yeucau: YeuCauNhapHangCreate,currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):
#     ma_chi_nhanh = currents_user.ma_chi_nhanh
#     ton_kho = db.query(TonKho).filter(
#         TonKho.ma_san_pham == yeucau.ma_san_pham,
#         TonKho.ma_chi_nhanh == ma_chi_nhanh
#         ).first()
#     if ton_kho:
#         return error_response(message="Đã có sản phẩm trong chi nhánh")
#     yeu_cau = YeuCauNhapHang(
#         ma_chi_nhanh = ma_chi_nhanh,
#         ma_san_pham = yeucau.ma_san_pham,
#         so_luong = yeucau.so_luong,
#         ly_do = yeucau.ly_do
#     )
#     db.add(yeu_cau)
#     db.commit()
#     db.refresh(yeu_cau)

#     return success_response(
#         data=jsonable_encoder(yeu_cau),
#         message="Gửi yêu cầu thành công"
#     )

# @router.get("/danh-sach-yeu-cau")
# def danh_sach_yeu_cau(currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):
#     ma_chi_nhanh = currents_user.ma_chi_nhanh
#     yeu_caus = db.query(YeuCauNhapHang).filter(YeuCauNhapHang.ma_chi_nhanh == ma_chi_nhanh).all()

#     result = []
#     for yc in yeu_caus:
#         yeu_cau_data = {
#             "ma_yeu_cau": yc.ma_yeu_cau,
#             "ten_san_pham": yc.san_pham.ten_san_pham,
#             "ma_san_pham": yc.ma_san_pham,
#             "hinh_anhs": [{"duong_dan": ha.duong_dan, "mo_ta": ha.mo_ta} for ha in yc.san_pham.hinh_anhs],
#             "ten_chi_nhanh": yc.chi_nhanh.ten_chi_nhanh,
#             "ma_chi_nhanh": yc.ma_chi_nhanh,
#             "so_luong": yc.so_luong,
#             "ly_do": yc.ly_do,
#             "trang_thai": yc.trang_thai,
#         }
#         result.append(yeu_cau_data)

#     return success_response(
#         data=jsonable_encoder(result),
#         message="Lấy danh sách thành công"
#     )

@router.post("/gui-yeu-cau-nhap-hang")
def gui_yeu_cau_nhap_hang(
    yeu_cau_in: YeuCauNhapHangCreate,
    currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai),
    db: Session = Depends(get_db)
):
    ma_chi_nhanh = currents_user.ma_chi_nhanh
    yeu_cau = YeuCauNhapHang(
        ma_chi_nhanh = ma_chi_nhanh,
        ly_do = yeu_cau_in.ly_do,
    )
    db.add(yeu_cau)
    db.flush()

    for sp in yeu_cau_in.san_phams:
        san_pham = db.query(SanPham).filter(SanPham.ma_san_pham == sp.ma_san_pham).first()
        if not san_pham:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Sản phẩm {sp.ma_san_pham} không tồn tại")
        san_pham_yeu_cau = SanPhamYeuCau(
            ma_yeu_cau = yeu_cau.ma_yeu_cau,
            ma_san_pham = sp.ma_san_pham,
            so_luong = sp.so_luong
        )
        db.add(san_pham_yeu_cau)
    db.commit()
    db.refresh(yeu_cau)

    return {
        "success": True,
        "message": "Tạo yêu cầu nhập hàng thành công",
        "data": {
            "ma_yeu_cau": yeu_cau.ma_yeu_cau,
            "ma_chi_nhanh": yeu_cau.ma_chi_nhanh,
            "trang_thai": yeu_cau.trang_thai,
            "ngay_tao": yeu_cau.ngay_tao
        }
    }

@router.put("/cap-nhat-yeu-cau/{ma_yeu_cau}")
def cap_nhat_yeu_cau(
    ma_yeu_cau: int,
    payload: YeuCauNhapHangUpdate,
    current_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai),
    db: Session = Depends(get_db)
):
    ma_chi_nhanh = current_user.ma_chi_nhanh

    # Lấy yêu cầu cần cập nhật
    yeu_cau = db.query(YeuCauNhapHang).filter(
        YeuCauNhapHang.ma_yeu_cau == ma_yeu_cau,
        YeuCauNhapHang.ma_chi_nhanh == ma_chi_nhanh
    ).first()

    if not yeu_cau:
        return error_response(message="Không tìm thấy yêu cầu")

    if yeu_cau.trang_thai != "CHO_XU_LY":
        return error_response(message="Yêu cầu đã xử lý, không thể cập nhật")

    # CẬP NHẬT LÝ DO
    if payload.ly_do:
        yeu_cau.ly_do = payload.ly_do

    data_success = []
    error_list = []

    if payload.san_phams:
        # XÓA SẢN PHẨM CŨ
        db.query(SanPhamYeuCau).filter(
            SanPhamYeuCau.ma_yeu_cau == ma_yeu_cau
        ).delete()

        # THÊM LẠI SẢN PHẨM MỚI
        for sp in payload.san_phams:
            new_item = SanPhamYeuCau(
                ma_yeu_cau=ma_yeu_cau,
                ma_san_pham=sp.ma_san_pham,
                so_luong=sp.so_luong
            )
            db.add(new_item)
            data_success.append({
                "ma_san_pham": sp.ma_san_pham,
                "so_luong": sp.so_luong
            })

    db.commit()
    db.refresh(yeu_cau)

    return {
        "success": True,
        "message": "Cập nhật yêu cầu hoàn tất",
        "data": data_success,
        "errors": error_list,
        "yeu_cau": jsonable_encoder(yeu_cau)
    }

@router.get("/danh-sach-yeu-cau")
def lay_danh_sach_yeu_cau(
    current_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai),
    db: Session = Depends(get_db)
):
    ma_chi_nhanh = current_user.ma_chi_nhanh
    yeu_caus = db.query(YeuCauNhapHang).filter(YeuCauNhapHang.ma_chi_nhanh == ma_chi_nhanh).order_by(desc(YeuCauNhapHang.ngay_tao)).all()
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
            ly_do=yc.ly_do,
            trang_thai=yc.trang_thai,
            ngay_tao=yc.ngay_tao.isoformat(),
            san_pham_yeu_caus=san_phams
        ))
    return {
        "success": True,
        "message": "Tạo yêu cầu nhập hàng thành công",
        "data": result
    }

#---------------- KHUYẾN MÃI -----------------
@router.post("/tao-khuyen-mai")
async def tao_khuyen_mai(
    ten_khuyen_mai: str = Form(...),
    ma_code: str = Form(...),
    mo_ta: str | None = Form(None),
    giam_gia: float = Form(...),
    ngay_bat_dau: datetime = Form(...),
    ngay_ket_thuc: datetime = Form(...),
    san_phams: str | None = Form(None),  # JSON string
    hinh_anh: Optional[UploadFile] = File(None),
    currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai),
    db: Session = Depends(get_db)
):
    
    ma_chi_nhanh = currents_user.ma_chi_nhanh
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
        ma_chi_nhanh = ma_chi_nhanh
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
    print(ten_khuyen_mai)
    print(ma_code)
    print(khuyen_mai)
    print(san_phams)
    print(hinh_anh)

    return success_response(
        data=jsonable_encoder(khuyen_mai),
        message="Tại khuyến mãi thành công"
    )

