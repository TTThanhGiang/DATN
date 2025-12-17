from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from api.database import get_db
from api.utils.recommender import get_trending_by_category, goi_y_ket_hop, goi_y_nguoi_dung, goi_y_noi_dung, goi_y_pho_bien, goi_y_pho_bien_cho_guest, goi_y_san_pham, goi_y_trending_theo_danh_muc
from api.models import ChiTietDonHang, DanhGia, DanhMucSanPham, DonHang, LichSuXem, SanPham

router = APIRouter(prefix="/goi-y", tags=["Gợi ý"])

def format_san_pham(ds):
    """
    Chuẩn hóa output của danh sách sản phẩm gợi ý
    Bao gồm: id, tên, giá, giảm giá, đơn vị, danh mục, mô tả, hình ảnh, score, phương pháp
    """
    result = []
    for sp in ds:
        s = sp["san_pham"]
        result.append({
            "ma_san_pham": s.ma_san_pham,
            "ten_san_pham": s.ten_san_pham,
            "mo_ta": getattr(s, "mo_ta", None),
            "don_gia": getattr(s, "don_gia", None),
            "giam_gia": float(getattr(s, "giam_gia", 0)),
            "don_vi": getattr(s, "don_vi", None),
            "id_danh_muc": getattr(s, "ma_danh_muc", None),
            "hinh_anhs": [{"duong_dan": ha.duong_dan} for ha in getattr(s, "hinh_anhs", [])],
            "score": sp.get("score"),
            "method": sp.get("method") or ", ".join(sp.get("methods", []))
        })
    return result

@router.get("/goi-y/noi-dung/{ma_nguoi_dung}")
def api_goi_y_noi_dung(ma_nguoi_dung: int, db: Session = Depends(get_db)):
    ket_qua = goi_y_noi_dung(ma_nguoi_dung, db)
    if not ket_qua:
        raise HTTPException(status_code=404, detail="Không có sản phẩm gợi ý")
    return {
        "ma_nguoi_dung": ma_nguoi_dung,
        "so_luong_goi_y": len(ket_qua),
        "goi_y": format_san_pham(ket_qua)
    }

@router.get("/goi-y/nguoi-dung/{ma_nguoi_dung}")
def api_goi_y_nguoi_dung(ma_nguoi_dung: int, db: Session = Depends(get_db)):
    ket_qua = goi_y_nguoi_dung(ma_nguoi_dung, db)
    if not ket_qua:
        raise HTTPException(status_code=404, detail="Không có sản phẩm gợi ý")
    return {
        "ma_nguoi_dung": ma_nguoi_dung,
        "so_luong_goi_y": len(ket_qua),
        "goi_y": format_san_pham(ket_qua)
    }

@router.get("/goi-y/san-pham/{ma_nguoi_dung}")
def api_goi_y_san_pham(ma_nguoi_dung: int, db: Session = Depends(get_db)):
    ket_qua = goi_y_san_pham(ma_nguoi_dung, db)
    if not ket_qua:
        raise HTTPException(status_code=404, detail="Không có sản phẩm gợi ý")
    return {
        "ma_nguoi_dung": ma_nguoi_dung,
        "so_luong_goi_y": len(ket_qua),
        "goi_y": format_san_pham(ket_qua)
    }

@router.get("/goi-y/pho-bien/{ma_nguoi_dung}")
def api_goi_y_pho_bien(ma_nguoi_dung: int, db: Session = Depends(get_db)):
    ket_qua = goi_y_pho_bien(ma_nguoi_dung, db)
    if not ket_qua:
        raise HTTPException(status_code=404, detail="Không có sản phẩm gợi ý")
    return {
        "ma_nguoi_dung": ma_nguoi_dung,
        "so_luong_goi_y": len(ket_qua),
        "goi_y": format_san_pham(ket_qua)
    }

# ----------------- Endpoint tổng hợp -----------------

@router.get("/tong-hop/{ma_nguoi_dung}")
def api_goi_y_tong_hop(ma_nguoi_dung: int, db: Session = Depends(get_db), top_n: int = 10):
    ket_qua = goi_y_ket_hop(ma_nguoi_dung, db, top_n=top_n)
    if not ket_qua:
        raise HTTPException(status_code=404, detail="Không có sản phẩm gợi ý")
    return {
        "ma_nguoi_dung": ma_nguoi_dung,
        "so_luong_goi_y": len(ket_qua),
        "goi_y": format_san_pham(ket_qua)
    }

@router.get("/pho-bien-cho-guest")
def api_goi_y_tong_hop(db: Session = Depends(get_db)):
    ket_qua = goi_y_pho_bien_cho_guest(db, top_n=20)
    if not ket_qua:
        raise HTTPException(status_code=404, detail="Không có sản phẩm gợi ý")
    return {
        "so_luong_goi_y": len(ket_qua),
        "goi_y": format_san_pham(ket_qua)
    }

@router.get("/trending/danh-muc")
def api_trending_theo_danh_muc(
    db: Session = Depends(get_db),
    days: int = 7,
    top_dm: int = 3,
    top_sp: int = 20
):
    raw_result = get_trending_by_category(db, days, top_dm, top_sp)

    output = {}

    for dm_id, ds_sp in raw_result.items():

        # Lấy tên danh mục
        dm = db.query(DanhMucSanPham).filter(DanhMucSanPham.ma_danh_muc == dm_id).first()
        ten_dm = dm.ten_danh_muc if dm else "Không xác định"

        # Tính điểm của danh mục = tổng score sp
        diem_danh_muc = sum(item["score"] for item in ds_sp)

        # Format danh sách sản phẩm
        output[dm_id] = {
            "ma_danh_muc": dm_id,
            "ten_danh_muc": ten_dm,
            "score_danh_muc": diem_danh_muc,
            "san_phams": format_san_pham(ds_sp)
        }

    return output
