from fastapi import APIRouter, Depends, HTTPException, Query
from api.recommendation.load_data import nap_du_lieu
from api.utils.redis_cache import lay_cache, luu_cache, xoa_cache_theo_pattern
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from api.database import get_db
from api.utils.recommender import get_trending_by_category
from api.models import ChiTietDonHang, DanhGia, DanhMucSanPham, DonHang, LichSuXem, SanPham

from api.recommendation.recommender import goi_y_pho_bien, goi_y_ket_hop, goi_y_pho_bien_cho_guest, goi_y_thinh_hanh_theo_danh_muc

router = APIRouter(prefix="/goi-y", tags=["Gợi ý"])

def gan_san_pham_orm(ds_goi_y, db):
    """
    ds_goi_y: output từ recommender
    return: list đúng format cho format_san_pham
    """
    if not ds_goi_y:
        return []

    # lấy danh sách id
    ds_id = [sp["ma_san_pham"] for sp in ds_goi_y]

    san_phams = (
        db.query(SanPham)
        .filter(SanPham.ma_san_pham.in_(ds_id))
        .all()
    )

    map_sp = {sp.ma_san_pham: sp for sp in san_phams}

    ket_qua = []
    for r in ds_goi_y:
        sp = map_sp.get(r["ma_san_pham"])
        if not sp:
            continue

        ket_qua.append({
            "ma_san_pham": sp.ma_san_pham,
            "ten_san_pham": sp.ten_san_pham,
            "mo_ta": getattr(sp, "mo_ta", None),
            "don_gia": getattr(sp, "don_gia", None),
            "giam_gia": float(getattr(sp, "giam_gia", 0)),
            "don_vi": getattr(sp, "don_vi", None),
            "id_danh_muc": getattr(sp, "ma_danh_muc", None),
            "hinh_anhs": [
                {"duong_dan": ha.duong_dan}
                for ha in getattr(sp, "hinh_anhs", [])
            ],
            "score": r.get("diem"),
            "method": r.get("phuong_phap")
        })

    return ket_qua

@router.get("/pho-bien-cho-guest")
def api_goi_y_pho_bien_guest(db: Session = Depends(get_db)):
    cache_key = "guest:pho_bien"

    du_lieu_cache = lay_cache(cache_key)
    if du_lieu_cache and du_lieu_cache.get("so_luong_goi_y", 0) > 0:
        return du_lieu_cache
    
    du_lieu = nap_du_lieu(db)
    ds_goi_y = goi_y_pho_bien_cho_guest(du_lieu)
    ket_qua = gan_san_pham_orm(ds_goi_y, db)

    response = {
        "so_luong_goi_y": len(ket_qua),
        "goi_y": ket_qua
    }

    if ket_qua:
        luu_cache(cache_key, response, ttl=300)

    return response

@router.get("/trending/danh-muc")
def api_trending_theo_danh_muc(
    db: Session = Depends(get_db),
    days: int = 30,
    top_dm: int = 3,
    top_sp: int = 20
):
    cache_key = f"trending:danh_muc:days={days}:topdm={top_dm}:topsp={top_sp}"

    du_lieu_cache = lay_cache(cache_key)
    if du_lieu_cache:
        return du_lieu_cache
    du_lieu = nap_du_lieu(db)
    ds_goi_y = goi_y_thinh_hanh_theo_danh_muc(
        du_lieu,
        so_ngay=days, 
        top_danh_muc=top_dm, 
        top_san_pham=top_sp
    )

    output = {}

    for dm_id, ds_sp in ds_goi_y.items():

        dm = (
            db.query(DanhMucSanPham)
            .filter(DanhMucSanPham.ma_danh_muc == int(dm_id))
            .first()
        )
        ten_dm = dm.ten_danh_muc if dm else "Không xác định"

        diem_danh_muc = sum(item["diem"] for item in ds_sp)

        output[str(dm_id)] = {
            "ma_danh_muc": dm_id,
            "ten_danh_muc": ten_dm,
            "score_danh_muc": round(diem_danh_muc, 2),
            "san_phams": gan_san_pham_orm(ds_sp, db)
        }

    if output:
        luu_cache(cache_key, output, ttl=300)

    return output

@router.get("/tong-hop/{ma_nguoi_dung}")
def api_goi_y(
    ma_nguoi_dung: int,
    db: Session = Depends(get_db)
):
    cache_key = f"goi_y:tong_hop:user:{ma_nguoi_dung}"


    du_lieu_cache = lay_cache(cache_key)
    if du_lieu_cache and du_lieu_cache.get("so_luong_goi_y", 0) > 0:
        return du_lieu_cache

    du_lieu = nap_du_lieu(db)
    ds_goi_y = goi_y_ket_hop(ma_nguoi_dung, du_lieu)
    ds_orm = gan_san_pham_orm(ds_goi_y, db)

    response = {
        "ma_nguoi_dung": ma_nguoi_dung,
        "so_luong_goi_y": len(ds_orm),
        "goi_y": ds_orm
    }
    if ds_orm:
        luu_cache(cache_key, response, ttl=120)

    return response

@router.get("/data")
def data(db: Session = Depends(get_db)):
    return nap_du_lieu(db)   
    