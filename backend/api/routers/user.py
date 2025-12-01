
import base64
import datetime
from io import BytesIO
from fastapi import Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict
from api.models import ChiNhanh, ChiTietDonHang, ChiTietGioHang, DanhGia, DanhMucSanPham, DonHang, GioHang, LichSuXem, NguoiDung, SanPham, HinhAnh
from api.database import SessionLocal, get_db
from api.schemas import DanhMucCreate, DanhMucSchema, GioHangItemCreate, GioHangItemResponse, SanPhamSchema, HinhAnhSchema, ThanhToanSchema
from api.utils.response_helpers import success_response, error_response
from api.routers.auth import lay_nguoi_dung_hien_tai

router = APIRouter(prefix="/users", tags=["Người dùng"]   )

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
        gio_hang = GioHang(ma_nguoi_dung=item.ma_nguoi_dung)
        db.add(gio_hang)
        db.commit()
        db.refresh(gio_hang)

    # 3️⃣ Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    chi_tiet = db.query(ChiTietGioHang).filter(
        ChiTietGioHang.ma_gio_hang == gio_hang.ma_gio_hang,
        ChiTietGioHang.ma_san_pham == item.ma_san_pham
    ).first()

    if chi_tiet:
        # Nếu có rồi thì tăng số lượng
        chi_tiet.so_luong += item.so_luong
    else:
        # Nếu chưa thì thêm mới
        chi_tiet = ChiTietGioHang(
            ma_gio_hang=gio_hang.ma_gio_hang,
            ma_san_pham=item.ma_san_pham,
            so_luong=item.so_luong,
            gia_tien=san_pham.don_gia  # giả định cột này có trong bảng SanPham
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

from typing import List

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

@router.post("/thanh-toan")
async def thanh_toan(payload: ThanhToanSchema, request: Request, currents_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):

    gio_hang = db.query(GioHang).filter(GioHang.ma_nguoi_dung == currents_user.ma_nguoi_dung).first()

    if not gio_hang:
        return error_response({"error": "Giỏ hàng không tồn tại"}, 404)
    
    # Load giỏ hàng + chi tiết
    gio = (
        db.query(GioHang)
        .options(joinedload(GioHang.chi_tiet_gio_hangs))
        .filter_by(ma_gio_hang=gio_hang.ma_gio_hang)
        .first()
    )

    if not gio:
        return error_response({"error": "Giỏ hàng không tồn tại"}, 404)

    # Tính tổng tiền
    tong_tien = sum(
        (ct.so_luong or 0) * (ct.gia_tien or 0)
        for ct in gio.chi_tiet_gio_hangs
    )

    if tong_tien <= 0:
        return error_response({"error": "Tổng tiền không hợp lệ"}, 400)

    # 1) Tạo đơn hàng
    don = DonHang(
        ma_nguoi_dung=gio.ma_nguoi_dung,
        tong_tien=tong_tien,
        ho_ten=payload.ho_ten,
        ma_chi_nhanh=payload.ma_chi_nhanh,
        dia_chi=payload.dia_chi_giao_hang,
        so_dien_thoai=payload.so_dien_thoai
    )
    db.add(don)
    db.flush()  # Lấy ma_don_hang ngay tại đây

    ma_don_hang = don.ma_don_hang

    # 2) Lưu chi tiết đơn hàng
    for ct in gio.chi_tiet_gio_hangs:
        db.add(
            ChiTietDonHang(
                ma_don_hang=ma_don_hang,
                ma_san_pham=ct.ma_san_pham,
                so_luong=ct.so_luong,
                gia_tien=ct.gia_tien,
            )
        )
    db.commit()

    # Xóa chi tiết giỏ hàng
    db.query(ChiTietGioHang).filter_by(ma_gio_hang=gio_hang.ma_gio_hang).delete()
    db.commit()

    return success_response(
        data={"ma_don_hang": ma_don_hang},
        message="Tạo đơn hàng thành công.",    
        status_code=200
    )

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

@router.get("/danh-gia-san-pham/{ma_san_pham}")
def lay_danh_gia_san_pham(ma_san_pham: int, db: Session = Depends(get_db)):
    # Giả sử có bảng DanhGia với các cột ma_san_pham, diem_danh_gia, binh_luan
    danh_gias = db.query(DanhGia).filter(DanhGia.ma_san_pham == ma_san_pham).all()
    if not danh_gias:
        return error_response(
            message="Chưa có đánh giá cho sản phẩm này.", 
            status_code=404
        )
    data = [
        {
            "ma_nguoi_dung": dg.ma_nguoi_dung,
            "diem_danh_gia": dg.diem_danh_gia,
            "binh_luan": dg.binh_luan,
            "ngay_danh_gia": dg.ngay_danh_gia.isoformat()
        }
        for dg in danh_gias
    ]
    return success_response(
        data=data,
        message="Lấy đánh giá sản phẩm thành công.",
        status_code=200
    )

@router.post("/luu-lich-su-xem/{ma_san_pham}")
def luu_lich_su_xem(ma_san_pham: int, current_user: NguoiDung = Depends(lay_nguoi_dung_hien_tai), db: Session = Depends(get_db)):
    # Lấy ID người dùng từ token
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
        lich_su.thoi_gian = datetime.datetime.utcnow()
    else:
        # Nếu chưa có → tạo mới
        lich_su = LichSuXem(
            ma_nguoi_dung=ma_nguoi_dung,
            ma_san_pham=ma_san_pham,
            so_lan_xem=1,
            thoi_gian=datetime.datetime.utcnow(),
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