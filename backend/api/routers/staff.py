
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.encoders import jsonable_encoder
from requests import Session

from api.database import get_db
from api.models import DonHang, HinhAnh, NguoiDung
from api.routers.auth import kiem_tra_mat_khau, lay_nguoi_dung_hien_tai, ma_hoa_mat_khau, phan_quyen
from api.schemas import CapNhatProfile, DonHangOut, HuyDonInput, SanPhamDonHangOut, ThayDoiMatKhau
from api.utils.response_helpers import error_response, success_response


router = APIRouter(prefix="/staff", tags=["Nhân viên"])
nhan_vien = "NHAN_VIEN"
UPLOAD_DIR_KHUYENMAI = "uploads/avatars"

#---------------- ĐƠN HÀNG -----------------
@router.get("/danh-sach-don-hang")
def danh_sach_don_hang(currents_user: NguoiDung = Depends(phan_quyen(nhan_vien)), db: Session = Depends(get_db)):
    ma_chi_nhanh = currents_user.ma_chi_nhanh

    don_hangs = (
        db.query(DonHang)
        .filter(DonHang.ma_chi_nhanh == ma_chi_nhanh)
        .order_by(DonHang.ngay_dat.desc())
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
                SanPhamDonHangOut(
                    ma_san_pham=ct.ma_san_pham,
                    ten_san_pham=ct.san_pham.ten_san_pham,
                    so_luong=ct.so_luong,
                    gia_tien=ct.gia_tien,
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
                ngay_dat=dh.ngay_dat,
                chi_tiet=ds_san_pham,
            )
        )
    return success_response(
        data=jsonable_encoder(result),
        message="Lấy danh sách đơn hàng thành công"
    )

@router.put("/don-hang/{ma_don_hang}/duyet")
def duyet_don_hang(
    ma_don_hang: int,
    currents_user: NguoiDung = Depends(phan_quyen(nhan_vien)),
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
    currents_user: NguoiDung = Depends(phan_quyen(nhan_vien)),
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
    currents_user: NguoiDung = Depends(phan_quyen(nhan_vien)),
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

#---------------- THÔNG TIN -----------------
@router.get("/thong-tin-ca-nhan")
def lay_thong_tin(current_user: NguoiDung = Depends(phan_quyen(nhan_vien))):
    if not current_user:
        return error_response(message="Không tìm thấy người dùng")
    return success_response(
        data={
            "ma_nguoi_dung": current_user.ma_nguoi_dung,
            "ho_ten": current_user.ho_ten,
            "email": current_user.email,
            "so_dien_thoai": current_user.so_dien_thoai,
            "dia_chi": current_user.dia_chi,
            "ngay_sinh": current_user.ngay_sinh.date().isoformat() if current_user.ngay_sinh else None,
            "gioi_tinh": current_user.gioi_tinh,
            "vai_tro": current_user.vai_tro,
            "trang_thai": current_user.trang_thai,
            "ma_chi_nhanh": current_user.ma_chi_nhanh,
            "hinh_anhs": [{"duong_dan": ha.duong_dan, "mo_ta": ha.mo_ta} for ha in current_user.hinh_anhs]
        },
        message="Lấy thông tin cá nhân thành công"
    )

@router.put("/cap-nhat-thong-tin")
def cap_nhat_thong_tin(thong_tin: CapNhatProfile , current_user: NguoiDung = Depends(phan_quyen(nhan_vien)), db: Session = Depends(get_db)):
    nhan_vien = db.query(NguoiDung).filter(NguoiDung.ma_nguoi_dung == current_user.ma_nguoi_dung).first()
    if not nhan_vien: 
        return error_response(message="Không tìm thấy người dùng")
    nhan_vien.ho_ten = thong_tin.ho_ten
    nhan_vien.email = thong_tin.email
    nhan_vien.dia_chi = thong_tin.dia_chi
    nhan_vien.ngay_sinh = thong_tin.ngay_sinh
    nhan_vien.gioi_tinh = thong_tin.gioi_tinh
    db.commit()
    db.refresh(nhan_vien)

    return success_response(
        data=jsonable_encoder(nhan_vien),
        message="Cập nhật thông tin thành công"
    )
    
@router.put("/thay-doi-mat-khau")
def thay_doi_mat_khau(mat_khau: ThayDoiMatKhau ,current_user: NguoiDung = Depends(phan_quyen(nhan_vien)), db:Session = Depends(get_db)):
    nhan_vien = db.query(NguoiDung).filter(NguoiDung.ma_nguoi_dung == current_user.ma_nguoi_dung).first()

    if not nhan_vien:
        raise HTTPException(status_code=400, detail="Nhân viên không tồn tại")
    
    if not kiem_tra_mat_khau(mat_khau.mat_khau_cu, nhan_vien.mat_khau):
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không đúng")
    
    mat_khau_da_ma_hoa = ma_hoa_mat_khau(mat_khau.mat_khau_moi)
    nhan_vien.mat_khau = mat_khau_da_ma_hoa
    db.commit()
    db.refresh(nhan_vien)

    return {"success": True, "message": "Đổi mật khẩu thành công"}

@router.put("/cap-nhat-anh")
async def cap_nhat_avatar(
    hinh_anh: UploadFile,
    current_user: NguoiDung = Depends(phan_quyen(nhan_vien)),
    db: Session = Depends(get_db)
):
    if not hinh_anh or not hinh_anh.filename:
        return {"success": False, "message": "Vui lòng chọn file ảnh"}

    UPLOAD_DIR_AVATAR = "uploads/avatars"
    os.makedirs(UPLOAD_DIR_AVATAR, exist_ok=True)

    # Lấy avatar cũ nếu có
    avatar_cu = db.query(HinhAnh).filter(HinhAnh.ma_nguoi_dung == current_user.ma_nguoi_dung).first()
    if avatar_cu:
        # Xóa file cũ trên server
        file_cu_path = avatar_cu.duong_dan.replace("http://localhost:8000/", "")
        if os.path.exists(file_cu_path):
            os.remove(file_cu_path)
        # Xóa record trong DB
        db.delete(avatar_cu)
        db.commit()

    # Lưu file mới
    file_path = os.path.join(UPLOAD_DIR_AVATAR, hinh_anh.filename)
    with open(file_path, "wb") as f:
        f.write(await hinh_anh.read())

    file_url = f"http://localhost:8000/{file_path}"

    # Thêm record mới
    avatar_moi = HinhAnh(
        ma_nguoi_dung=current_user.ma_nguoi_dung,
        duong_dan=file_url,
        mo_ta=f"Avatar {current_user.ho_ten}"
    )
    db.add(avatar_moi)
    db.commit()
    db.refresh(avatar_moi)

    return {"success": True, "message": "Cập nhật avatar thành công", "data": avatar_moi}
