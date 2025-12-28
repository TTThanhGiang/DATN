
from datetime import datetime, timedelta
from operator import or_
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.encoders import jsonable_encoder
from requests import Session

from api.database import get_db
from api.models import ChiNhanh, ChiTietDonHang, DonHang, HinhAnh, NguoiDung, SanPham
from api.routers.auth import kiem_tra_mat_khau, lay_nguoi_dung_hien_tai, ma_hoa_mat_khau, phan_quyen
from api.schemas import CapNhatProfile, DonHangOut, HuyDonInput, SanPhamDonHangOut, SanPhamLichSuDonHangOut, ThayDoiMatKhau
from api.utils.response_helpers import error_response, success_response
from api.routers.admin import tinh_khoang_so_sanh

from sqlalchemy import desc, func, distinct, and_, cast, Date
from sqlalchemy.orm import Session


router = APIRouter(prefix="/staff", tags=["Nhân viên"])
nhan_vien = "NHAN_VIEN"
UPLOAD_DIR_KHUYENMAI = "uploads/avatars"

@router.get("/chi-nhanh")
def chi_nhanh(current_user: NguoiDung = Depends(phan_quyen(nhan_vien)), db: Session = Depends(get_db)):
    chi_nhanh = db.query(ChiNhanh).filter(ChiNhanh.ma_chi_nhanh == current_user.ma_chi_nhanh).first()
    if not chi_nhanh:
        return error_response(message="Người dùng không thuộc chi nhánh nào")
    return success_response(data=jsonable_encoder(chi_nhanh), message="Đã lấy chi nhánh cho người dùng")

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


#---------------- TỔNG QUAN-----------------

def query_tong_quan(
    db: Session,
    ma_chi_nhanh: Optional[int],
    tu_ngay: Optional[datetime],
    den_ngay: Optional[datetime],
    ten_san_pham: Optional[str]
):
    query = (
        db.query(
            func.coalesce(func.sum(DonHang.tong_tien), 0).label("doanh_thu"),
            func.count(distinct(DonHang.ma_don_hang)).label("so_don"),
            func.count(distinct(DonHang.ma_nguoi_dung)).label("khach_hang")
        )
        .select_from(DonHang)
    )

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


@router.get("/tong-quan")
def dashboard_tong_quan(
    db: Session = Depends(get_db),
    tu_ngay: Optional[datetime] = Query(None),
    den_ngay: Optional[datetime] = Query(None),
    ten_san_pham: Optional[str]  = Query(None),
    kieu_so_sanh: Optional[str] = Query("7_ngay"),
    curent_user: NguoiDung = Depends(phan_quyen(nhan_vien))   
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


@router.get("/tong-quan/top-san-pham")
def get_top_san_pham(
    db: Session = Depends(get_db),
    tu_ngay: Optional[datetime] = Query(None),
    den_ngay: Optional[datetime] = Query(None),
    kieu_so_sanh: Optional[str] = Query("7_ngay"),
    ten_san_pham: Optional[str]  = Query(None),
    curent_user: NguoiDung = Depends(phan_quyen(nhan_vien))
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

def query_hieu_suat(
    db: Session,
    tu_ngay: datetime,
    den_ngay: datetime,
    ma_chi_nhanh: Optional[int] = None
):
    query = (
        db.query(
            ChiNhanh.ma_chi_nhanh.label("id"),
            ChiNhanh.ten_chi_nhanh.label("ten"),
            func.count(DonHang.ma_don_hang).label("so_don"),
            func.coalesce(func.sum(DonHang.tong_tien), 0).label("doanh_thu")
        )
        .join(DonHang, DonHang.ma_chi_nhanh == ChiNhanh.ma_chi_nhanh)
        .filter(
            DonHang.ngay_dat >= tu_ngay,
            DonHang.ngay_dat <= den_ngay
        )
    )

    if ma_chi_nhanh:
        query = query.filter(ChiNhanh.ma_chi_nhanh == ma_chi_nhanh)

    return query.group_by(
        ChiNhanh.ma_chi_nhanh,
        ChiNhanh.ten_chi_nhanh
    ).all()

@router.get("/tong-quan/hieu-suat-chi-nhanh")
def hieu_suat_chi_nhanh(
    db: Session = Depends(get_db),
    tu_ngay: Optional[datetime] = Query(None),
    den_ngay: Optional[datetime] = Query(None),
    kieu_so_sanh: Optional[str] = Query(
        "7_ngay",
        description="1_ngay, 7_ngay, 30_ngay, 90_ngay, thang_truoc, nam_truoc"
    ),
    current_user: NguoiDung = Depends(phan_quyen(nhan_vien))
):
    # 1. Lấy dữ liệu kỳ hiện tại
    hien_tai = query_hieu_suat(db, tu_ngay, den_ngay, current_user.ma_chi_nhanh)

    # 2. Tính toán kỳ trước dựa trên func của bạn
    tu_truoc, den_truoc, _  = tinh_khoang_so_sanh(tu_ngay, den_ngay, kieu_so_sanh)
    
    # 3. Lấy dữ liệu kỳ trước và map vào dictionary
    doanh_thu_truoc_map = {}
    if tu_truoc and den_truoc:
        truoc = query_hieu_suat(db, tu_truoc, den_truoc, current_user.ma_chi_nhanh)
        doanh_thu_truoc_map = {item.id: item.doanh_thu for item in truoc}

    # 4. Tổng hợp kết quả và tính % tăng trưởng
    ket_qua = []
    for cn in hien_tai:
        dt_ht = cn.doanh_thu
        dt_tr = doanh_thu_truoc_map.get(cn.id, 0)
        
        phan_tram = None
        if dt_tr > 0:
            phan_tram = round((dt_ht - dt_tr) / dt_tr * 100, 2)
        elif dt_ht > 0:
            phan_tram = 100.0 # Tăng trưởng tuyệt đối nếu kỳ trước không có doanh thu

        ket_qua.append({
            "ten": cn.ten,
            "don_hang": cn.so_don,
            "doanh_thu": dt_ht,
            "phan_tram_tang_truong": phan_tram
        })

    # Sắp xếp theo doanh thu giảm dần
    return sorted(ket_qua, key=lambda x: x['doanh_thu'], reverse=True)

@router.get("/tong-quan/bieu-do-so-sanh")
def bieu_do_so_sanh(
    db: Session = Depends(get_db),
    tu_ngay: datetime = Query(...),
    den_ngay: datetime = Query(...),
    kieu_so_sanh: str = Query("7_ngay"),
    curent_user: NguoiDung = Depends(phan_quyen(nhan_vien))
):
    ma_chi_nhanh = curent_user.ma_chi_nhanh
    tu_truoc, den_truoc, _ = tinh_khoang_so_sanh(tu_ngay, den_ngay, kieu_so_sanh)
    print("Mã chi nhánh ", ma_chi_nhanh)

    def get_full_data(start, end, ma_chi_nhanh):
        if not start or not end: return []
        results = db.query(
            cast(DonHang.ngay_dat, Date).label("ngay"),
            func.sum(DonHang.tong_tien).label("total")
        ).filter(
            DonHang.ngay_dat >= start, 
            DonHang.ngay_dat <= f"{end.date()} 23:59:59"
        )
        if ma_chi_nhanh:
            results = results.filter(DonHang.ma_chi_nhanh == ma_chi_nhanh)
        
        db_data = {r.ngay: float(r.total or 0) for r in results.group_by(cast(DonHang.ngay_dat, Date)).all()}

        # 2. Tạo danh sách ĐẦY ĐỦ các ngày từ start đến end
        full_series = []
        current_date = start.date()
        while current_date <= end.date():
            full_series.append({
                "label": current_date.strftime("%d/%m"),
                "value": db_data.get(current_date, 0) # Nếu DB không có ngày này, gán = 0
            })
            current_date += timedelta(days=1)
        return full_series

    hien_tai_full = get_full_data(tu_ngay, den_ngay, ma_chi_nhanh)
    
    # Đối với kỳ trước, chúng ta cũng cần tạo đủ số lượng điểm tương ứng với kỳ hiện tại
    # Tuy nhiên, để biểu đồ MUI vẽ đè lên nhau được, 2 mảng data phải có ĐỘ DÀI BẰNG NHAU.
    ky_truoc_full = get_full_data(tu_truoc, den_truoc, ma_chi_nhanh) if tu_truoc else []

    return {
        "labels": [d["label"] for d in hien_tai_full],
        "data_hien_tai": [d["value"] for d in hien_tai_full],
        "data_ky_truoc": [d["value"] for d in ky_truoc_full][:len(hien_tai_full)] # Cắt bằng độ dài kỳ hiện tại
    }

