from datetime import datetime, timedelta 
import json
from typing  import List
from typing import Optional
import os
from fastapi import APIRouter, Depends, Form, HTTPException, Query, UploadFile, File
from fastapi.encoders import jsonable_encoder
from api.schemas import DonHangOut, DonHangOutAdmin, HinhAnhItem, HuyDonInput, KhuyenMaiCreate, KhuyenMaiOut, NguoiDungCreate, NhanVienCreate, SanPhamDonHangOut, SanPhamKMItem, SanPhamKMItemOut, SanPhamLichSuDonHangOut, SanPhamYeuCauOut, TonKhoCreate, TonKhoUpdate, YeuCauNhapHangCreate, YeuCauNhapHangOut, YeuCauNhapHangUpdate
from api.routers.admin import tinh_khoang_so_sanh
from sqlalchemy import desc, func, distinct, cast, Date, or_
from sqlalchemy.orm import Session

from api.database import get_db, SessionLocal
from api.models import ChiNhanh, ChiTietDonHang, DonHang, KhuyenMai, SanPham, DanhMucSanPham, HinhAnh, NguoiDung, SanPhamKhuyenMai, SanPhamYeuCau, TonKho, YeuCauNhapHang
from api.routers.auth import lay_nguoi_dung_hien_tai, ma_hoa_mat_khau, phan_quyen
from api.utils.response_helpers import success_response, error_response

UPLOAD_DIR_KHUYENMAI = "uploads/khuyenmais"

router = APIRouter(prefix="/manager", tags=["Quản lý"])
manager = "QUAN_LY"

@router.get("/chi-nhanh")
def chi_nhanh(current_user: NguoiDung = Depends(phan_quyen(manager)), db: Session = Depends(get_db)):
    chi_nhanh = db.query(ChiNhanh).filter(ChiNhanh.ma_chi_nhanh == current_user.ma_chi_nhanh).first()
    if not chi_nhanh:
        return error_response(message="Người dùng không thuộc chi nhánh nào")
    return success_response(data=jsonable_encoder(chi_nhanh), message="Đã lấy chi nhánh cho người dùng")

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
    ton_tai = db.query(NguoiDung).filter(
        (NguoiDung.so_dien_thoai == nguoidung.so_dien_thoai) | 
        (NguoiDung.email == nguoidung.email)
    ).first()
    if ton_tai:
        raise HTTPException(
            status_code=400, 
            detail="Số điện thoại hoặc Email đã tồn tại trên hệ thống"
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
    tu_khoa: str = Query(None),
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai)
):
    ma_chi_nhanh = currents_user.ma_chi_nhanh
    query = db.query(TonKho).join(SanPham).join(ChiNhanh)
    
    if tu_khoa:
        query = query.filter(SanPham.ten_san_pham.ilike(f"%{tu_khoa}%"))

    ton_khos = query.filter(TonKho.ma_chi_nhanh == ma_chi_nhanh).offset(offset).limit(limit).all()

    total = query.filter(TonKho.ma_chi_nhanh == ma_chi_nhanh).count()

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
            ten_chi_nhanh=yc.chi_nhanh.ten_chi_nhanh,
            ly_do=yc.ly_do,
            ly_do_tu_choi=yc.ly_do_tu_choi,
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

@router.get("/danh-sach-khuyen-mai", response_model=List[KhuyenMaiOut])
def danh_sach_khuyen_mai( 
    tu_khoa: str = Query(None),
    trang_thai: str = Query(),
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db), 
    current_user: NguoiDung = Depends(phan_quyen(manager))):

    query = db.query(KhuyenMai)
    ma_chi_nhanh = current_user.ma_chi_nhanh

    if tu_khoa:
        query = query.filter(
            or_(
                KhuyenMai.ten_khuyen_mai.ilike(f"%{tu_khoa}%"),
                KhuyenMai.mo_ta.ilike(f"%{tu_khoa}%")
            )
    )
    
    if trang_thai and trang_thai != "TAT_CA": 
        query = query.filter(KhuyenMai.trang_thai == trang_thai)

    khuyen_mais = (
        query
        .filter(KhuyenMai.ma_chi_nhanh == ma_chi_nhanh)
        .order_by(KhuyenMai.ma_khuyen_mai)
        .limit(limit)
        .offset(offset)
        .all()
    )
    tong = query.filter(KhuyenMai.ma_chi_nhanh == ma_chi_nhanh).count()
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
        result.append(KhuyenMaiOut(
            ma_khuyen_mai=km.ma_khuyen_mai,
            ten_khuyen_mai=km.ten_khuyen_mai,
            ma_code=km.ma_code,
            mo_ta=km.mo_ta,
            giam_gia=float(km.giam_gia),
            ngay_bat_dau=km.ngay_bat_dau,
            ngay_ket_thuc=km.ngay_ket_thuc,
            ma_chi_nhanh=km.ma_chi_nhanh,
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

@router.put("/cap-nhat-khuyen-mai/{ma_khuyen_mai}")
async def cap_nhat_khuyen_mai(
    ma_khuyen_mai: int,
    ten_khuyen_mai: Optional[str] = Form(None),
    ma_code: Optional[str] = Form(None),
    mo_ta: Optional[str] = Form(None),
    giam_gia: Optional[float] = Form(None),
    ngay_bat_dau: Optional[datetime] = Form(None),
    ngay_ket_thuc: Optional[datetime] = Form(None),
    san_phams: Optional[str] = Form(None),  # JSON string
    hinh_anh: Optional[UploadFile] = File(None),
    currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai),
    db: Session = Depends(get_db)
):
    km = db.query(KhuyenMai).filter(
        KhuyenMai.ma_khuyen_mai == ma_khuyen_mai
    ).first()

    if not km:
        return error_response(message="Không tìm thấy khuyến mãi")

    # Kiểm tra mã code trùng (nếu gửi lên)
    if ma_code and ma_code != km.ma_code:
        exists = db.query(KhuyenMai).filter(KhuyenMai.ma_code == ma_code).first()
        if exists:
            return error_response(message="Mã khuyến mãi đã tồn tại")

    # Kiểm tra ngày
    if ngay_bat_dau and ngay_ket_thuc:
        if ngay_ket_thuc < ngay_bat_dau:
            return error_response(message="Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu")

    # --- Cập nhật field đơn ---
    if ten_khuyen_mai is not None:
        km.ten_khuyen_mai = ten_khuyen_mai
    if ma_code is not None:
        km.ma_code = ma_code
    if mo_ta is not None:
        km.mo_ta = mo_ta
    if giam_gia is not None:
        km.giam_gia = giam_gia
    if ngay_bat_dau is not None:
        km.ngay_bat_dau = ngay_bat_dau
    if ngay_ket_thuc is not None:
        km.ngay_ket_thuc = ngay_ket_thuc

    # --- Update hình ảnh mới ---
    if hinh_anh is not None and hinh_anh.filename:
        os.makedirs(UPLOAD_DIR_KHUYENMAI, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR_KHUYENMAI, hinh_anh.filename)

        with open(file_path, "wb") as f:
            f.write(await hinh_anh.read())

        file_url = f"http://localhost:8000/{file_path}"

        # Xóa ảnh cũ
        db.query(HinhAnh).filter(HinhAnh.ma_khuyen_mai == ma_khuyen_mai).delete()

        # Thêm ảnh mới
        ha = HinhAnh(
            ma_khuyen_mai=ma_khuyen_mai,
            duong_dan=file_url,
            mo_ta=km.ten_khuyen_mai
        )
        db.add(ha)

    # --- Update danh sách sản phẩm ---
    if san_phams is not None:
        # Xóa danh sách cũ
        db.query(SanPhamKhuyenMai).filter(
            SanPhamKhuyenMai.ma_khuyen_mai == ma_khuyen_mai
        ).delete()

        # Parse JSON string
        try:
            san_pham_list = [SanPhamKMItem(**item) for item in json.loads(san_phams)]
        except:
            return error_response(message="Danh sách sản phẩm không hợp lệ")

        # Thêm lại danh sách mới
        for sp in san_pham_list:
            db.add(
                SanPhamKhuyenMai(
                    ma_khuyen_mai=ma_khuyen_mai,
                    ma_san_pham=sp.ma_san_pham,
                    so_luong=sp.so_luong
                )
            )

    db.commit()
    db.refresh(km)

    return success_response(
        data=jsonable_encoder(km),
        message="Cập nhật khuyến mãi thành công"
    )

#---------------- ĐƠN HÀNG -----------------
@router.get("/danh-sach-don-hang")
def danh_sach_don_hang(
    tu_khoa: str = Query(None),
    trang_thai: str = Query(),
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), 
    db: Session = Depends(get_db)
):
    ma_chi_nhanh = currents_user.ma_chi_nhanh
    query = db.query(DonHang)
    if tu_khoa:
        query = query.filter(
            or_(
                DonHang.ho_ten.ilike(f"%{tu_khoa}%"),
                DonHang.so_dien_thoai.ilike(f"%{tu_khoa}%")
            )
    )
    if trang_thai and trang_thai != "TAT_CA": 
        query = query.filter(DonHang.trang_thai == trang_thai)
        
    don_hangs = (
        query
        .filter(DonHang.ma_chi_nhanh == ma_chi_nhanh)
        .order_by(DonHang.ngay_dat.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )
    tong = query.filter(DonHang.ma_chi_nhanh == ma_chi_nhanh).count()
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
            DonHangOut(
                ma_don_hang=dh.ma_don_hang,
                ho_ten=dh.ho_ten,
                dia_chi=dh.dia_chi,
                so_dien_thoai=dh.so_dien_thoai,
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
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(phan_quyen(manager)),
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
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(phan_quyen(manager)),
):
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
    db: Session = Depends(get_db),
    currents_user: NguoiDung = Depends(phan_quyen(manager)),
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

#---------------- TỔNG QUAN-----------------

def query_tong_quan(db: Session, ma_chi_nhanh, tu_ngay, den_ngay, ten_san_pham):
    if den_ngay:
        den_ngay = den_ngay.replace(hour=23, minute=59, second=59, microsecond=999999)

    query = db.query(
        func.coalesce(func.sum(DonHang.tong_tien), 0).label("doanh_thu"),
        func.count(distinct(DonHang.ma_don_hang)).label("so_don"),
        func.count(distinct(DonHang.ma_nguoi_dung)).label("khach_hang")
    ).select_from(DonHang)

    if ten_san_pham:
        query = (
            query
            .join(ChiTietDonHang, ChiTietDonHang.ma_don_hang == DonHang.ma_don_hang)
            .join(SanPham, SanPham.ma_san_pham == ChiTietDonHang.ma_san_pham)
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
    if den_ngay:
        den_ngay = den_ngay.replace(hour=23, minute=59, second=59, microsecond=999999)

    doanh_thu_thuc = func.sum(
        ChiTietDonHang.so_luong * func.coalesce(ChiTietDonHang.gia_sau_giam, ChiTietDonHang.gia_goc)
    )

    query = (
        db.query(
            SanPham.ma_san_pham.label("id"),
            SanPham.ten_san_pham.label("ten"),
            func.coalesce(func.sum(ChiTietDonHang.so_luong), 0).label("so_luong"),
            func.coalesce(doanh_thu_thuc, 0).label("doanh_thu"),
            func.min(HinhAnh.duong_dan).label("hinh_anh")
        )
        .outerjoin(ChiTietDonHang, ChiTietDonHang.ma_san_pham == SanPham.ma_san_pham)
        .outerjoin(DonHang, (DonHang.ma_don_hang == ChiTietDonHang.ma_don_hang))
        .outerjoin(HinhAnh, HinhAnh.ma_san_pham == SanPham.ma_san_pham)
    )

    if tu_ngay: query = query.filter(DonHang.ngay_dat >= tu_ngay)
    if den_ngay: query = query.filter(DonHang.ngay_dat <= den_ngay)
    if ten_san_pham: query = query.filter(SanPham.ten_san_pham.ilike(f"%{ten_san_pham}%"))
    if ma_chi_nhanh: query = query.filter((DonHang.ma_chi_nhanh == ma_chi_nhanh) | (DonHang.ma_chi_nhanh == None))

    final_query = query.group_by(SanPham.ma_san_pham, SanPham.ten_san_pham).order_by(desc("doanh_thu"))
    if limit: final_query = final_query.limit(limit)
    return final_query.all()

def query_hieu_suat(db: Session, tu_ngay, den_ngay, ma_chi_nhanh=None):
    if den_ngay:
        den_ngay = den_ngay.replace(hour=23, minute=59, second=59, microsecond=999999)

    query = (
        db.query(
            ChiNhanh.ma_chi_nhanh.label("id"),
            ChiNhanh.ten_chi_nhanh.label("ten"),
            func.count(DonHang.ma_don_hang).label("so_don"),
            func.coalesce(func.sum(DonHang.tong_tien), 0).label("doanh_thu")
        )
        # Sử dụng Outer Join để không mất chi nhánh nếu chưa có đơn hàng
        .outerjoin(DonHang, (DonHang.ma_chi_nhanh == ChiNhanh.ma_chi_nhanh) & 
                           (DonHang.ngay_dat >= tu_ngay) & 
                           (DonHang.ngay_dat <= den_ngay))
    )

    if ma_chi_nhanh:
        query = query.filter(ChiNhanh.ma_chi_nhanh == ma_chi_nhanh)

    return query.group_by(ChiNhanh.ma_chi_nhanh, ChiNhanh.ten_chi_nhanh).all()

@router.get("/tong-quan")
def dashboard_tong_quan(
    db: Session = Depends(get_db),
    tu_ngay: Optional[datetime] = Query(None),
    den_ngay: Optional[datetime] = Query(None),
    ten_san_pham: Optional[str]  = Query(None),
    kieu_so_sanh: Optional[str] = Query("7_ngay"),
    curent_user: NguoiDung = Depends(phan_quyen(manager))   
):
    ma_chi_nhanh = curent_user.ma_chi_nhanh
    tu_truoc, den_truoc, mo_ta_so_sanh = tinh_khoang_so_sanh(
        tu_ngay, den_ngay, kieu_so_sanh
    )
    hien_tai = query_tong_quan(db, ma_chi_nhanh, tu_ngay, den_ngay, ten_san_pham)

    ky_truoc_data = None
    if tu_truoc and den_truoc:
        ky_truoc_data = query_tong_quan(db, ma_chi_nhanh, tu_truoc, den_truoc, ten_san_pham)

    def tinh_pct(hien_tai_val, truoc_val):
        val_ht = hien_tai_val or 0
        val_tr = truoc_val or 0
        if val_tr == 0:
            return 100 if val_ht > 0 else 0
        return round((val_ht - val_tr) / val_tr * 100, 2)

    kt_doanh_thu = ky_truoc_data.doanh_thu if ky_truoc_data else 0
    kt_so_don = ky_truoc_data.so_don if ky_truoc_data else 0
    kt_khach_hang = ky_truoc_data.khach_hang if ky_truoc_data else 0

    return {
        "bo_loc": {
            "ma_chi_nhanh": ma_chi_nhanh,
            "tu_ngay": tu_ngay,
            "den_ngay": den_ngay,
            "kieu_so_sanh": kieu_so_sanh,
            "mo_ta_so_sanh": mo_ta_so_sanh
        },
        "hien_tai": {
            "doanh_thu": hien_tai.doanh_thu or 0,
            "so_don": hien_tai.so_don or 0,
            "khach_hang": hien_tai.khach_hang or 0
        },
        "so_sanh": {
            "doanh_thu_pct": tinh_pct(hien_tai.doanh_thu, kt_doanh_thu),
            "so_don_pct": tinh_pct(hien_tai.so_don, kt_so_don),
            "khach_hang_pct": tinh_pct(hien_tai.khach_hang, kt_khach_hang)
        }
    }

@router.get("/tong-quan/top-san-pham")
def get_top_san_pham(
    db: Session = Depends(get_db),
    tu_ngay: Optional[datetime] = Query(None),
    den_ngay: Optional[datetime] = Query(None),
    kieu_so_sanh: Optional[str] = Query("7_ngay"),
    ten_san_pham: Optional[str]  = Query(None),
    curent_user: NguoiDung = Depends(phan_quyen(manager))
):
    ma_chi_nhanh = curent_user.ma_chi_nhanh
    tu_truoc, den_truoc, _ = tinh_khoang_so_sanh(tu_ngay, den_ngay, kieu_so_sanh)

    top_hien_tai = query_top_san_pham(db, ma_chi_nhanh, tu_ngay, den_ngay, ten_san_pham)
    doanh_thu_truoc_map = {}
    if tu_truoc and den_truoc:
        top_truoc = query_top_san_pham(db, ma_chi_nhanh, tu_truoc, den_truoc, ten_san_pham, limit=100)
        doanh_thu_truoc_map = {item.id: item.doanh_thu for item in top_truoc}

    ket_qua = []
    for sp in top_hien_tai:
        dt_ht = sp.doanh_thu or 0
        dt_tr = doanh_thu_truoc_map.get(sp.id, 0)
        
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

@router.get("/tong-quan/hieu-suat-chi-nhanh")
def hieu_suat_chi_nhanh(
    db: Session = Depends(get_db),
    tu_ngay: Optional[datetime] = Query(None),
    den_ngay: Optional[datetime] = Query(None),
    kieu_so_sanh: Optional[str] = Query(
        "7_ngay",
        description="1_ngay, 7_ngay, 30_ngay, 90_ngay, thang_truoc, nam_truoc"
    ),
    current_user: NguoiDung = Depends(phan_quyen(manager))
):

    if den_ngay:
        den_ngay = den_ngay.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    hien_tai = query_hieu_suat(db, tu_ngay, den_ngay, current_user.ma_chi_nhanh)
    tu_truoc, den_truoc, _  = tinh_khoang_so_sanh(tu_ngay, den_ngay, kieu_so_sanh)
    
    doanh_thu_truoc_map = {}
    if tu_truoc and den_truoc:
        truoc = query_hieu_suat(db, tu_truoc, den_truoc, current_user.ma_chi_nhanh)
        doanh_thu_truoc_map = {item.id: item.doanh_thu for item in truoc}

    ket_qua = []
    for cn in hien_tai:
        dt_ht = cn.doanh_thu
        dt_tr = doanh_thu_truoc_map.get(cn.id, 0)
        
        phan_tram = None
        if dt_tr > 0:
            phan_tram = round((dt_ht - dt_tr) / dt_tr * 100, 2)
        elif dt_ht > 0:
            phan_tram = 100.0

        ket_qua.append({
            "ten": cn.ten,
            "don_hang": cn.so_don,
            "doanh_thu": dt_ht,
            "phan_tram_tang_truong": phan_tram
        })

    return sorted(ket_qua, key=lambda x: x['doanh_thu'], reverse=True)

@router.get("/tong-quan/bieu-do-so-sanh")
def bieu_do_so_sanh(
    db: Session = Depends(get_db),
    ma_chi_nhanh: Optional[int] = Query(None),
    tu_ngay: datetime = Query(...),
    den_ngay: datetime = Query(...),
    kieu_so_sanh: str = Query("7_ngay"),
    curent_user: NguoiDung = Depends(phan_quyen(manager))
):
  
    if den_ngay:
        den_ngay = den_ngay.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    tu_truoc, den_truoc, _ = tinh_khoang_so_sanh(tu_ngay, den_ngay, kieu_so_sanh)

    def get_full_data(start, end, ma_chi_nhanh):
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
    hien_tai_full = get_full_data(tu_ngay, den_ngay, curent_user.ma_chi_nhanh)
    ky_truoc_full = get_full_data(tu_truoc, den_truoc, curent_user.ma_chi_nhanh) if tu_truoc else []

    # Trả về format dữ liệu chuẩn cho Frontend
    # Lưu ý: Cắt hoặc bù mảng kỳ trước để có độ dài BẰNG mảng hiện tại giúp MUI Chart vẽ đè lên nhau
    return {
        "labels": [d["label"] for d in hien_tai_full],
        "data_hien_tai": [d["value"] for d in hien_tai_full],
        "data_ky_truoc": [d["value"] for d in ky_truoc_full][:len(hien_tai_full)] if ky_truoc_full else [0] * len(hien_tai_full)
    }