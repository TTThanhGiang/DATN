import random
from typing import List, Optional
from datetime import datetime
from io import BytesIO
import os
from zoneinfo import ZoneInfo
from fastapi import Query, Request, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi import APIRouter, Depends, HTTPException
import urllib.parse

from fastapi.responses import RedirectResponse
from api.routers.vnpay import create_vnpay_url, hmac_sha512
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from api.models import ChiNhanh, ChiTietDonHang, ChiTietGioHang, DanhGia, DanhMucSanPham, DonHang, GioHang, KhuyenMai, LichSuXem, NguoiDung, SanPham, HinhAnh, SanPhamKhuyenMai
from api.database import SessionLocal, get_db
from api.schemas import BulkReviewRequest, CapNhatProfile, DanhMucCreate, DanhMucSchema, DonHangOut, FormDanhGia, GioHangItemCreate, GioHangItemResponse, SanPhamDonHangOut, SanPhamLichSuDonHangOut, SanPhamSchema, HinhAnhSchema, ThanhToanSchema, ThayDoiMatKhau, UserBulkCreate
from api.utils.response_helpers import success_response, error_response
from api.routers.auth import kiem_tra_mat_khau, lay_nguoi_dung_hien_tai, ma_hoa_mat_khau, phan_quyen

from dotenv import load_dotenv

load_dotenv()
VNP_HASH_SECRET = os.getenv("VNP_HASH_SECRET")
HOST_FRONTEND = os.getenv("HOST_FRONTEND")

router = APIRouter(prefix="/users", tags=["Người dùng"]   )
khach_hang = "KHACH_HANG"


def build_danh_muc_tree(danh_muc):
    return {
        "ma_danh_muc": danh_muc.ma_danh_muc,
        "ten_danh_muc": danh_muc.ten_danh_muc,
        "mo_ta": danh_muc.mo_ta,
        "hinh_anhs": [
            {
                "ma_hinh_anh": ha.ma_hinh_anh,
                "duong_dan": ha.duong_dan,
                "mo_ta": ha.mo_ta
            }
            for ha in (danh_muc.hinh_anhs or [])
        ],
        "danh_muc_con": [
            build_danh_muc_tree(con) for con in (danh_muc.danh_muc_con or [])
        ]
    }

@router.get("/danh-muc", response_model=List[DanhMucSchema])
def get_danh_muc(db: Session = Depends(get_db)):
    try:
        # 0. Truy vấn danh mục chính cùng với danh mục con
        danh_muc_chinh = (
            db.query(DanhMucSanPham)
            .options(
                joinedload(DanhMucSanPham.danh_muc_con) 
            )
            .filter(DanhMucSanPham.danh_muc_cha == None)
            .all()
        )
        data_tree = [build_danh_muc_tree(dm) for dm in danh_muc_chinh]
        if not data_tree:
            return success_response(
                data=[], 
                message="Không tìm thấy danh mục chính nào.", 
                status_code=200
            )     
        return success_response(
            data=data_tree, 
            message="Lấy cây danh mục sản phẩm thành công.", 
            status_code=200
        )
    except Exception as e:
        print(f"Lỗi truy vấn danh mục: {e}") 
        return error_response(
            message="Lỗi hệ thống nội bộ khi truy vấn danh mục.", 
            status_code=500
        )

@router.post("/san-pham/batch")
def add_san_phams(san_pham_list: List[SanPhamSchema]):
    db: Session = SessionLocal()
    try:
        for sp_data in san_pham_list:
            san_pham = SanPham(
                ten_san_pham=sp_data.ten_san_pham,
                mo_ta=sp_data.mo_ta,
                don_gia=sp_data.don_gia,
                giam_gia=sp_data.giam_gia,
                ma_danh_muc=sp_data.ma_danh_muc,
                don_vi=sp_data.don_vi
            )
            # Thêm hình ảnh
            for ha_data in sp_data.hinh_anhs:
                hinh_anh = HinhAnh(
                    duong_dan=ha_data.duong_dan,
                    mo_ta=ha_data.mo_ta,
                    san_pham=san_pham
                )
                db.add(hinh_anh)
            db.add(san_pham)
        db.commit()
        return {"status": "success", "message": f"Đã thêm {len(san_pham_list)} sản phẩm"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.post("/them-danh-muc-hang-loat")
def them_danh_muc_hang_loat(
    ds_danh_muc: List[DanhMucCreate],
    db: Session = Depends(get_db)
):

    ket_qua = []

    for item in ds_danh_muc:
        # Kiểm tra danh mục đã tồn tại chưa
        existed = db.query(DanhMucSanPham).filter(
            DanhMucSanPham.ten_danh_muc == item.ten_danh_muc
        ).first()

        if existed:
            ket_qua.append({
                "ten_danh_muc": item.ten_danh_muc,
                "message": "Đã tồn tại, bỏ qua"
            })
            continue

        # Tạo danh mục
        dm = DanhMucSanPham(
            ten_danh_muc=item.ten_danh_muc,
            mo_ta=item.mo_ta,
            danh_muc_cha=item.danh_muc_cha
        )
        db.add(dm)
        db.commit()
        db.refresh(dm)

        # Nếu có hình ảnh
        for ha in item.hinh_anhs:
            hinh = HinhAnh(
                duong_dan=ha.duong_dan,
                mo_ta=ha.mo_ta,
                ma_danh_muc=dm.ma_danh_muc
            )
            db.add(hinh)

        db.commit()

        ket_qua.append({
            "ten_danh_muc": dm.ten_danh_muc,
            "ma_danh_muc": dm.ma_danh_muc,
            "message": "Đã thêm thành công"
        })

    return {
        "success": True,
        "data": ket_qua,
        "message": "Đã xử lý danh sách danh mục"
    }


@router.get("/san-pham/", response_model=List[SanPhamSchema])
def get_all_san_pham():
    db: Session = SessionLocal()
    try:
        san_phams = db.query(SanPham).all()
        result = []
        for sp in san_phams:
            san_pham_data = SanPhamSchema(
                ma_san_pham=sp.ma_san_pham,
                ten_san_pham=sp.ten_san_pham,
                mo_ta=sp.mo_ta,
                don_gia=sp.don_gia,
                giam_gia=float(sp.giam_gia),
                ma_danh_muc=sp.ma_danh_muc,
                ten_danh_muc=sp.danh_muc.ten_danh_muc,
                don_vi=sp.don_vi,
                hinh_anhs=[
                    HinhAnhSchema(
                        duong_dan=ha.duong_dan,
                        mo_ta=ha.mo_ta
                    ) for ha in sp.hinh_anhs
                ]
            )
            result.append(san_pham_data)
        return result
    finally:
        db.close()

@router.post("/them-gio-hang")
def them_san_pham_vao_gio_hang(item: GioHangItemCreate,currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):    
    # 1️⃣ Kiểm tra sản phẩm có tồn tại không
    
    san_pham = db.query(SanPham).filter(SanPham.ma_san_pham == item.ma_san_pham).first()
    if not san_pham:
        return error_response(
            message="Sản phẩm không tồn tại.", 
            status_code=404 
        )

    # 2️⃣ Kiểm tra người dùng đã có giỏ hàng chưa
    gio_hang = db.query(GioHang).filter(GioHang.ma_nguoi_dung == currents_user.ma_nguoi_dung).first()
    if not gio_hang:
        gio_hang = GioHang(ma_nguoi_dung=currents_user.ma_nguoi_dung)
        db.add(gio_hang)
        db.commit()
        db.refresh(gio_hang)

    # 3️⃣ Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    chi_tiet = db.query(ChiTietGioHang).filter(
        ChiTietGioHang.ma_gio_hang == gio_hang.ma_gio_hang,
        ChiTietGioHang.ma_san_pham == item.ma_san_pham
    ).first()

    if chi_tiet:
        chi_tiet.so_luong += item.so_luong
    else:
        chi_tiet = ChiTietGioHang(
            ma_gio_hang=gio_hang.ma_gio_hang,
            ma_san_pham=item.ma_san_pham,
            so_luong=item.so_luong,
            gia_tien=san_pham.don_gia 
        )
        db.add(chi_tiet)

    db.commit()
    db.refresh(chi_tiet)

    return success_response(
        data={
            "ma_gio_hang": gio_hang.ma_gio_hang,
            "ma_san_pham": chi_tiet.ma_san_pham,
            "so_luong": chi_tiet.so_luong
        },
        message="Thêm sản phẩm vào giỏ hàng thành công.",
        status_code=200
    )

@router.get("/gio-hang", response_model=List[GioHangItemResponse])
def lay_gio_hang(currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):
    gio_hang = db.query(GioHang).filter(GioHang.ma_nguoi_dung == currents_user.ma_nguoi_dung).first()
    if not gio_hang:
        return []

    chi_tiet_items = db.query(ChiTietGioHang).filter(
        ChiTietGioHang.ma_gio_hang == gio_hang.ma_gio_hang
    ).all()

    result = []
    tong_tien = 0
    for item in chi_tiet_items:
        sp = db.query(SanPham).filter(SanPham.ma_san_pham == item.ma_san_pham).first()
        if sp:
            result.append(
                GioHangItemResponse(
                    ma_san_pham=sp.ma_san_pham,
                    ten_san_pham=sp.ten_san_pham,
                    so_luong=item.so_luong,
                    gia_tien=item.gia_tien,
                    don_vi=sp.don_vi,
                    hinh_anhs=[
                        HinhAnhSchema(
                            duong_dan=ha.duong_dan,
                            mo_ta=ha.mo_ta
                        ) for ha in sp.hinh_anhs
                    ]
                )
            )
    return success_response(
        data=[item.dict() for item in result],
        message="Lấy giỏ hàng thành công.",
        status_code=200 
    )

@router.delete("/xoa-san-pham-gio-hang")
def xoa_san_pham_khoi_gio_hang(ma_san_pham: int, currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):
    gio_hang = db.query(GioHang).filter(GioHang.ma_nguoi_dung == currents_user.ma_nguoi_dung).first()
    if not gio_hang:
        return error_response(
            message="Giỏ hàng không tồn tại.", 
            status_code=404
        )
    chi_tiet = db.query(ChiTietGioHang).filter(
        ChiTietGioHang.ma_gio_hang == gio_hang.ma_gio_hang,
        ChiTietGioHang.ma_san_pham == ma_san_pham
    ).first()

    if not chi_tiet:
        return error_response(
            message="Sản phẩm không tồn tại trong giỏ hàng.", 
            status_code=404
        )

    db.delete(chi_tiet)
    db.commit()

    return success_response(
        data={
            "ma_gio_hang": gio_hang.ma_gio_hang,
            "ma_san_pham": ma_san_pham
        },
        message="Xóa sản phẩm khỏi giỏ hàng thành công.",
        status_code=200
    )

@router.put("/cap-nhat-so-luong-gio-hang")
def cap_nhat_so_luong_gio_hang(ma_san_pham: int, so_luong: int, currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):
    gio_hang = db.query(GioHang).filter(GioHang.ma_nguoi_dung == currents_user.ma_nguoi_dung).first()
    
    chi_tiet = db.query(ChiTietGioHang).filter(
        ChiTietGioHang.ma_gio_hang == gio_hang.ma_gio_hang,
        ChiTietGioHang.ma_san_pham == ma_san_pham
    ).first()

    if not chi_tiet:
        return error_response(
            message="Sản phẩm không tồn tại trong giỏ hàng.", 
            status_code=404
        )
    if so_luong <= 0:
        db.delete(chi_tiet)
        db.commit()
        return success_response(
            data={
                "ma_gio_hang": gio_hang.ma_gio_hang,
                "ma_san_pham": ma_san_pham,
                "so_luong": 0
            },
            message="Xóa sản phẩm khỏi giỏ hàng thành công do số lượng bằng 0.",
            status_code=200
        )

    chi_tiet.so_luong = so_luong
    db.commit()
    db.refresh(chi_tiet)

    return success_response(
        data={
            "ma_gio_hang": gio_hang.ma_gio_hang,
            "ma_san_pham": ma_san_pham,
            "so_luong": chi_tiet.so_luong
        },
        message="Cập nhật số lượng sản phẩm trong giỏ hàng thành công.",
        status_code=200
    )

@router.get("/danh-sach-chi-nhanh")
def lay_danh_sach_chi_nhanh(db: Session = Depends(get_db)):
    chi_nhanhs = db.query(ChiNhanh).all()
    data = [
        {
            "ma_chi_nhanh": cn.ma_chi_nhanh,
            "ten_chi_nhanh": cn.ten_chi_nhanh,
            "dia_chi": cn.dia_chi,
            "so_dien_thoai": cn.so_dien_thoai
        }
        for cn in chi_nhanhs
    ]
    return success_response(
        data=data,
        message="Lấy danh sách chi nhánh thành công.",
        status_code=200
    )

@router.get("/khuyen-mai/{ma_code}")
def lay_thong_tin_khuyen_mai(ma_code: str, db: Session = Depends(get_db)):
    khuyen_mai = db.query(KhuyenMai).filter(KhuyenMai.ma_code == ma_code).first()
    if not khuyen_mai:
        return error_response(
            message="Mã khuyến mãi không tồn tại.", 
            status_code=404
        )
    if khuyen_mai.ngay_ket_thuc < datetime.utcnow():
        return error_response(
            message="Mã khuyến mãi đã hết hạn.", 
            status_code=400
        )
    return success_response(
        data={
            "ma_code": khuyen_mai.ma_code,
            "giam_gia": float(khuyen_mai.giam_gia),
            "ngay_bat_dau": khuyen_mai.ngay_bat_dau.isoformat(),
            "ngay_ket_thuc": khuyen_mai.ngay_ket_thuc.isoformat(),
            "san_pham_ap_dung": [sp.ma_san_pham for sp in khuyen_mai.san_pham_khuyen_mais]
        },
        message="Lấy thông tin khuyến mãi thành công.",
        status_code=200
    )

@router.post("/thanh-toan")
async def thanh_toan(payload: ThanhToanSchema, request: Request, currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):

    gio_hang = db.query(GioHang).filter(GioHang.ma_nguoi_dung == currents_user.ma_nguoi_dung).first()

    if not gio_hang:
        return error_response({"error": "Giỏ hàng không tồn tại"}, 404)
    if not payload.chi_tiet_san_pham:
        return error_response({"error": "Không có sản phẩm trong đơn hàng"}, 404)
    
    don_hang = DonHang(
        ma_nguoi_dung=currents_user.ma_nguoi_dung,
        tien_giam=payload.tien_giam,
        tong_tien=payload.tong_tien,
        ho_ten=payload.ho_ten,
        ma_chi_nhanh=payload.ma_chi_nhanh,
        dia_chi=payload.dia_chi_giao_hang,
        so_dien_thoai=payload.so_dien_thoai
    )
    db.add(don_hang)
    db.flush()  

    for ct in payload.chi_tiet_san_pham:
        chi_tiet_don_hang = ChiTietDonHang(
            ma_don_hang=don_hang.ma_don_hang,
            ma_san_pham=ct.ma_san_pham,
            so_luong=ct.so_luong,
            gia_goc=ct.gia_goc,
            gia_sau_giam=ct.gia_sau_giam 
        )
        db.add(chi_tiet_don_hang)
    
    payment_url = None
    if payload.phuong_thuc_thanh_toan == "vnpay":
        ip_addr = request.client.host if request.client.host != "::1" else "127.0.0.1"
        payment_url = create_vnpay_url(
            ma_don_hang=don_hang.ma_don_hang,
            tong_tien=don_hang.tong_tien,
            ip_addr=ip_addr
        )

    db.query(ChiTietGioHang).filter_by(ma_gio_hang=gio_hang.ma_gio_hang).delete()
    db.commit()

    return success_response(
        data={
            "ma_don_hang": don_hang.ma_don_hang,
            "payment_url": payment_url 
        },
        message="Tạo đơn hàng thành công.",    
        status_code=200
    )

@router.get("/vnpay_return")
async def vnpay_ipn(request: Request, db: Session = Depends(get_db)):
    params = dict(request.query_params)
    vnp_secure_hash = params.get("vnp_SecureHash")
    
    data_to_hash = {k: v for k, v in params.items() if k.startswith("vnp_") and k != "vnp_SecureHash"}
    input_data = sorted(data_to_hash.items())
    hash_data = "&".join([f"{k}={urllib.parse.quote_plus(str(v))}" for k, v in input_data])
    
    if hmac_sha512(VNP_HASH_SECRET, hash_data) == vnp_secure_hash:
        ma_don_hang = params.get("vnp_TxnRef")
        response_code = params.get("vnp_ResponseCode")
        
        don_hang = db.query(DonHang).filter(DonHang.ma_don_hang == int(ma_don_hang)).first()
        
        if don_hang:
            if response_code == "00":
                don_hang.trang_thai_thanh_toan = "DA_THANH_TOAN"
                db.commit()
            return RedirectResponse(url=f"{HOST_FRONTEND}")
        else:
            return RedirectResponse(url=f"{HOST_FRONTEND}/gio-hang?status=failed")
    else:
        return RedirectResponse(url=f"{HOST_FRONTEND}/gio-hang?status=invalid_signature")

@router.get("/chi-tiet-san-pham/{ma_san_pham}", response_model=SanPhamSchema)
def lay_chi_tiet_san_pham(ma_san_pham: int, db: Session = Depends(get_db)):
    san_pham = db.query(SanPham).filter(SanPham.ma_san_pham == ma_san_pham).first()
    if not san_pham:
        return error_response(
            message="Sản phẩm không tồn tại.", 
            status_code=404
        )
    san_pham_data = SanPhamSchema(
        ma_san_pham=san_pham.ma_san_pham,
        ten_san_pham=san_pham.ten_san_pham,
        mo_ta=san_pham.mo_ta,
        don_gia=san_pham.don_gia,
        giam_gia=float(san_pham.giam_gia),
        ma_danh_muc=san_pham.ma_danh_muc,
        ten_danh_muc=san_pham.danh_muc.ten_danh_muc,
        don_vi=san_pham.don_vi,
        hinh_anhs=[
            HinhAnhSchema(
                duong_dan=ha.duong_dan,
                mo_ta=ha.mo_ta
            ) for ha in san_pham.hinh_anhs
        ]
    )
    return success_response(
        data=jsonable_encoder(san_pham_data),
        message="Lấy chi tiết sản phẩm thành công.",
        status_code=200
    )

@router.post("/luu-lich-su-xem/{ma_san_pham}")
def luu_lich_su_xem(ma_san_pham: int, current_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):
    ma_nguoi_dung = current_user.ma_nguoi_dung

    print("Người dùng:", current_user)

    # Kiểm tra sản phẩm tồn tại
    san_pham = db.query(SanPham).filter(SanPham.ma_san_pham == ma_san_pham).first()
    if not san_pham:
        return error_response("Sản phẩm không tồn tại", 404)

    # Kiểm tra lịch sử xem có chưa
    lich_su = db.query(LichSuXem).filter(
        LichSuXem.ma_nguoi_dung == ma_nguoi_dung,
        LichSuXem.ma_san_pham == ma_san_pham
    ).first()

    if lich_su:
        # Nếu đã có → tăng số lần xem
        lich_su.so_lan_xem += 1
        lich_su.thoi_gian = datetime.utcnow()
    else:
        # Nếu chưa có → tạo mới
        lich_su = LichSuXem(
            ma_nguoi_dung=ma_nguoi_dung,
            ma_san_pham=ma_san_pham,
            so_lan_xem=1,
            thoi_gian= datetime.utcnow(),
            tong_thoi_gian_xem=0
        )
        db.add(lich_su)

    db.commit()

    return success_response(
        message="Đã lưu lịch sử xem sản phẩm",
        data={"ma_san_pham": ma_san_pham},
        status_code=200
    )

@router.get("/tat-ca-san-pham")
def tat_ca_san_pham(db: Session = Depends(get_db)):
    san_phams = db.query(SanPham).all()
    result = []
    for sp in san_phams:
        sp_data = {
            "ma_san_pham": sp.ma_san_pham,
            "ten_san_pham": sp.ten_san_pham
        }
        result.append(sp_data)
    return success_response(
        data= jsonable_encoder(result),
        message="Lấy danh sách sản phẩm thành công"
        )

#---------------- THÔNG TIN -----------------
@router.get("/thong-tin-ca-nhan")
def thong_tin_ca_nhan(current_user: NguoiDung = Depends(phan_quyen(khach_hang)), db: Session = Depends(get_db)):
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
            "hinh_anhs": [{"duong_dan": ha.duong_dan, "mo_ta": ha.mo_ta} for ha in current_user.hinh_anhs]
        },
        message="Lấy thông tin cá nhân thành công"
    )

@router.put("/cap-nhat-thong-tin")
def cap_nhat_thong_tin(thong_tin: CapNhatProfile , current_user: NguoiDung = Depends(phan_quyen(khach_hang)), db: Session = Depends(get_db)):
    khach_hang = db.query(NguoiDung).filter(NguoiDung.ma_nguoi_dung == current_user.ma_nguoi_dung).first()
    if not khach_hang: 
        return error_response(message="Không tìm thấy người dùng")
    khach_hang.ho_ten = thong_tin.ho_ten
    khach_hang.email = thong_tin.email
    khach_hang.dia_chi = thong_tin.dia_chi
    khach_hang.ngay_sinh = thong_tin.ngay_sinh
    khach_hang.gioi_tinh = thong_tin.gioi_tinh
    db.commit()
    db.refresh(khach_hang)

    return success_response(
        data=jsonable_encoder(khach_hang),
        message="Cập nhật thông tin thành công"
    )

@router.put("/thay-doi-mat-khau")
def thay_doi_mat_khau(mat_khau: ThayDoiMatKhau ,current_user: NguoiDung = Depends(phan_quyen(khach_hang)), db:Session = Depends(get_db)):
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
    current_user: NguoiDung = Depends(phan_quyen(khach_hang)),
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

#---------------- LỊCH SỬ ĐƠN HÀNG -----------------

@router.get("/lich-su-mua-hang")
def lich_su_mua_hang(
    current_user: NguoiDung = Depends(phan_quyen(khach_hang)),
    db: Session = Depends(get_db)
):
    don_hangs = db.query(DonHang).filter(DonHang.ma_nguoi_dung == current_user.ma_nguoi_dung).all()
    if not don_hangs:
        return error_response(message="Bạn chưa có đơn hàng nào")
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
        data=jsonable_encoder(result),
        message="Lấy danh sách đơn hàng thành công"
    )

@router.post("/gui-danh-gia")
def gui_danh_gia(
    payload: FormDanhGia,
    current_user: NguoiDung = Depends(phan_quyen(khach_hang)),
    db: Session = Depends(get_db)
):
    danh_gia = db.query(DanhGia).filter(
        DanhGia.ma_san_pham == payload.ma_san_pham,
        DanhGia.ma_nguoi_dung == current_user.ma_nguoi_dung 
        ).all()
    if danh_gia:
        return error_response(message="Bạn đã đánh giá sản phẩm này")
    danh_gia_moi = DanhGia(
        ma_san_pham = payload.ma_san_pham,
        ma_nguoi_dung = current_user.ma_nguoi_dung,
        sao = payload.so_sao,
        binh_luan = payload.binh_luan,
    )
    db.add(danh_gia_moi)
    db.commit()
    db.refresh(danh_gia_moi)

    return success_response(
        data=jsonable_encoder(danh_gia_moi),
        message="Đã gửi đánh giá thành công"
    )

@router.get("/so-san-pham-trong-gio-hang")
def so_san_pham_trong_gio_hang(currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):
    gio_hang = db.query(GioHang).filter(GioHang.ma_nguoi_dung == currents_user.ma_nguoi_dung).first()
    if not gio_hang:
        return success_response(
            data=0,
            message="Lấy số sản phẩm trong giỏ hàng thành công."
        )
    so_luong = db.query(ChiTietGioHang).filter(ChiTietGioHang.ma_gio_hang == gio_hang.ma_gio_hang).count()
    return success_response(
        data=so_luong,
        message="Lấy số sản phẩm trong giỏ hàng thành công."
    )

#---------------- ĐÁNH GIÁ -----------------

@router.get("/danh-gia/san-pham/{ma_san_pham}")
def lay_danh_gia_san_pham(ma_san_pham: int, db: Session = Depends(get_db)):
    danh_gias = db.query(DanhGia).filter(DanhGia.ma_san_pham == ma_san_pham).all()

    total = len(danh_gias)
    if not danh_gias:
        return error_response(
            message="Chưa có đánh giá cho sản phẩm này.", 
            status_code=404
        )
    result = []
    for dg in danh_gias:
        nguoi_dung = db.query(NguoiDung).filter(NguoiDung.ma_nguoi_dung == dg.ma_nguoi_dung).first()
        result.append({
            "ma_danh_gia": dg.ma_danh_gia,
            "ho_ten": nguoi_dung.ho_ten if nguoi_dung else "Người dùng ẩn danh",
            "sao": dg.sao,
            "binh_luan": dg.binh_luan,
            "ngay_danh_gia": dg.ngay_danh_gia.isoformat(),
        })
    return success_response(
        data=result,
        message="Lấy đánh giá sản phẩm thành công.",
    )

@router.get("/danh-sach-khuyen-mai")
def lay_danh_sach_khuyen_mai(db: Session = Depends(get_db)):
    khuyen_mais = db.query(KhuyenMai).filter(KhuyenMai.ngay_ket_thuc > datetime.now()).all()
    result = []
    for km in khuyen_mais:
        result.append({
            "ma_khuyen_mai": km.ma_khuyen_mai,
            "ten_khuyen_mai": km.ten_khuyen_mai,
            "ma_code": km.ma_code,
            "mo_ta": km.mo_ta,
            "phan_tram_giam": km.giam_gia,
            "ngay_bat_dau": km.ngay_bat_dau.date().isoformat(),
            "ngay_ket_thuc": km.ngay_ket_thuc.date().isoformat(),
            "hinh_anhs": [{"duong_dan": ha.duong_dan, "mo_ta": ha.mo_ta} for ha in km.hinh_anhs]
        })
    return success_response(
        data=jsonable_encoder(result),    
        message="Lấy danh sách khuyến mãi thành công."
    )

#---------------- THÊM DỮ LIỆU -----------------
@router.get("/chi-tiet-khuyen-mai/{ma_khuyen_mai}")
def chi_tiet_khuyen_mai(ma_khuyen_mai: int, db: Session = Depends(get_db)):
    khuyen_mai = db.query(KhuyenMai).filter(KhuyenMai.ma_khuyen_mai == ma_khuyen_mai).first()
    if not khuyen_mai:
        return {"success": False, "message": "Không tìm thấy chương trình khuyến mãi"}
    list_san_pham = []
    for item in khuyen_mai.san_pham_khuyen_mais:
        sp = item.san_pham
        if sp:
            list_san_pham.append({
                "ma_san_pham": sp.ma_san_pham,
                "ten_san_pham": sp.ten_san_pham,
                "don_gia": float(sp.don_gia),
                "giam_gia": float(sp.giam_gia),
                "don_vi": sp.don_vi,
                "hinh_anhs": [
                    {"duong_dan": ha.duong_dan} for ha in sp.hinh_anhs
                ]
            })

    # 3. Trả về kết quả khớp với Frontend đã viết
    return {
        "success": True,
        "data": {
            "ma_khuyen_mai": khuyen_mai.ma_khuyen_mai,
            "ten_khuyen_mai": khuyen_mai.ten_khuyen_mai,
            "ma_code": khuyen_mai.ma_code,
            "mo_ta": khuyen_mai.mo_ta,
            "phan_tram_giam": float(khuyen_mai.giam_gia),
            "ngay_ket_thuc": khuyen_mai.ngay_ket_thuc.strftime("%d/%m/%Y"),
            "san_phams": list_san_pham
        }
    }

@router.post("/create/nguoi-dung")
def create_users_bulk(payload: UserBulkCreate, db: Session = Depends(get_db)):

    created_users = []
    existing_errors = []

    for u in payload.users:

        # Kiểm tra email/phone trùng
        exists = db.query(NguoiDung).filter(
            (NguoiDung.email == u.email) |
            (NguoiDung.so_dien_thoai == u.so_dien_thoai)
        ).first()

        if exists:
            existing_errors.append({
                "email": u.email,
                "so_dien_thoai": u.so_dien_thoai,
                "error": "Email hoặc số điện thoại đã tồn tại"
            })
            continue

        hashed_password = ma_hoa_mat_khau(u.mat_khau)

        new_user = NguoiDung(
            ho_ten=u.ho_ten,
            email=u.email,
            so_dien_thoai=u.so_dien_thoai,
            mat_khau=hashed_password,
            dia_chi=u.dia_chi,
            ngay_sinh=u.ngay_sinh,
            gioi_tinh=u.gioi_tinh,
            vai_tro=u.vai_tro,
            trang_thai=True,  # Active luôn
            ma_chi_nhanh=u.ma_chi_nhanh
        )

        db.add(new_user)
        created_users.append({
            "email": u.email,
            "so_dien_thoai": u.so_dien_thoai,
            "ho_ten": u.ho_ten
        })

    db.commit()

    return {
        "created": created_users,
        "skipped": existing_errors,
        "total_created": len(created_users),
        "total_skipped": len(existing_errors)
    }

@router.post("/create/don-hang")
def create_bulk_orders(payload: dict, db: Session = Depends(get_db)):
    orders_data = payload.get("orders", [])
    if not orders_data:
        raise HTTPException(status_code=400, detail="Danh sách đơn hàng trống")

    created_orders = []

    for order in orders_data:

        # --- Kiểm tra người dùng ---
        nguoi_dung = db.query(NguoiDung).filter(
            NguoiDung.ma_nguoi_dung == order["ma_nguoi_dung"]
        ).first()
        if not nguoi_dung:
            raise HTTPException(
                status_code=404, 
                detail=f"Người dùng {order['ma_nguoi_dung']} không tồn tại"
            )

        # --- Tính tổng tiền ---
        tong_tien = 0
        order_items = []

        for item in order["items"]:
            san_pham = db.query(SanPham).filter(
                SanPham.ma_san_pham == item["ma_san_pham"]
            ).first()

            if not san_pham:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Sản phẩm {item['ma_san_pham']} không tồn tại"
                )

            tong_tien += san_pham.don_gia * item["so_luong"]

            order_items.append(
                ChiTietDonHang(
                    ma_san_pham=item["ma_san_pham"],
                    so_luong=item["so_luong"],
                    gia_tien=san_pham.don_gia
                )
            )

        # --- Tạo đơn hàng ---
        new_order = DonHang(
            ma_nguoi_dung=order["ma_nguoi_dung"],
            ho_ten=order["ho_ten"],
            dia_chi=order["dia_chi"],
            so_dien_thoai=order["so_dien_thoai"],
            ma_chi_nhanh=order["ma_chi_nhanh"],
            tong_tien=tong_tien
        )

        db.add(new_order)
        db.flush()  # Lấy ma_don_hang sau khi insert

        # Gắn chi tiết đơn vào
        for item in order_items:
            item.ma_don_hang = new_order.ma_don_hang
            db.add(item)

        created_orders.append({
            "ma_don_hang": new_order.ma_don_hang,
            "tong_tien": tong_tien
        })

    db.commit()

    return {
        "message": "Tạo hàng loạt đơn hàng thành công",
        "created_orders": created_orders
    }

sample_comments = [
    "Sản phẩm rất tốt!",
    "Chất lượng ổn so với giá.",
    "Đóng gói đẹp, giao nhanh.",
    "Hơi thất vọng một chút.",
    "Sẽ ủng hộ tiếp!",
    "Rất đáng tiền!",
    "Không như mong đợi.",
    "Tôi thích sản phẩm này.",
    "Sản phẩm hoạt động tốt.",
    "Khá hài lòng."
]

def generate_bulk_reviews(db: Session, so_danh_gia_moi_nguoi: int = 3):
    users = db.query(NguoiDung).all()
    total_created = 0

    for user in users:
        # Lấy danh sách sản phẩm user đã mua
        products = (
            db.query(ChiTietDonHang.ma_san_pham)
            .join(DonHang, DonHang.ma_don_hang == ChiTietDonHang.ma_don_hang)
            .filter(DonHang.ma_nguoi_dung == user.ma_nguoi_dung)
            .all()
        )

        product_ids = list({p.ma_san_pham for p in products})  # tránh duplicate

        if not product_ids:
            continue  # user chưa mua hàng -> bỏ qua

        created_for_user = 0

        random.shuffle(product_ids)

        for sp_id in product_ids:
            if created_for_user >= so_danh_gia_moi_nguoi:
                break

            # kiểm tra trùng đánh giá
            existed = db.query(DanhGia).filter(
                DanhGia.ma_nguoi_dung == user.ma_nguoi_dung,
                DanhGia.ma_san_pham == sp_id
            ).first()

            if existed:
                continue

            review = DanhGia(
                ma_san_pham=sp_id,
                ma_nguoi_dung=user.ma_nguoi_dung,
                sao=random.randint(3, 5),
                binh_luan=random.choice(sample_comments),
                trang_thai="DA_DUYET",
            )

            db.add(review)
            created_for_user += 1
            total_created += 1

    db.commit()

    return {"message": f"Đã tạo {total_created} đánh giá mới."}

@router.post("/generate/danh-gia")
def tao_danh_gia_hang_loat(request: BulkReviewRequest, db: Session = Depends(get_db)):
    return generate_bulk_reviews(db, request.so_danh_gia_moi_nguoi)