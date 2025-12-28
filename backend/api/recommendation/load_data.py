from collections import defaultdict
from api.utils.redis_cache import lay_cache, luu_cache
from api.models import SanPham, DanhGia, DonHang, LichSuXem

KEY_CACHE = "goi_y:du_lieu:v1"

def nap_du_lieu(db):
    cached = lay_cache(KEY_CACHE)
    if cached:
        return cached

    du_lieu = {
        "san_pham": {},
        "danh_gia": defaultdict(dict),
        "don_hang": defaultdict(list),
        "luot_xem": defaultdict(list)
    }

    # ===== SẢN PHẨM =====
    for sp in db.query(SanPham).all():
        du_lieu["san_pham"][sp.ma_san_pham] = {
            "id": sp.ma_san_pham,
            "ma_danh_muc": sp.ma_danh_muc,
            "ten": sp.ten_san_pham
        }

    # ===== ĐÁNH GIÁ =====
    for dg in db.query(DanhGia).all():
        du_lieu["danh_gia"][dg.ma_nguoi_dung][dg.ma_san_pham] = dg.sao

    # ===== ĐƠN HÀNG =====
    for dh in db.query(DonHang).all():
        du_lieu["don_hang"][dh.ma_nguoi_dung].append({
            "ngay_dat": dh.ngay_dat,
            "san_pham": [ct.ma_san_pham for ct in dh.chi_tiet_don_hangs]
        })

    # ===== LƯỢT XEM =====
    for lx in db.query(LichSuXem).all():
        du_lieu["luot_xem"][lx.ma_nguoi_dung].append({
            "ma_san_pham": lx.ma_san_pham,
            "thoi_gian": lx.thoi_gian
        })

    luu_cache(KEY_CACHE, du_lieu, ttl=300)
    return du_lieu
