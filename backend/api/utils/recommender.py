from collections import defaultdict
from datetime import datetime, timedelta
import math
from api.routers.user import tat_ca_san_pham
from sqlalchemy.orm import Session
from sqlalchemy import func
from api.models import ChiTietDonHang, SanPham, DanhGia, DonHang, LichSuXem  # Import thẳng từ project

# ================== HÀM HỖ TRỢ ==================

def giam_trong_so_theo_thoi_gian(thoi_gian, he_so_giam=0.1):
    """
    Tính trọng số giảm dần theo thời gian:
    - Sản phẩm càng mới được mua/xem, trọng số càng cao
    - he_so_giam: hệ số giảm dần theo số ngày
    """
    if isinstance(thoi_gian, str):
        thoi_gian = datetime.fromisoformat(thoi_gian)
    so_ngay = (datetime.now() - thoi_gian).days
    return math.exp(-he_so_giam * so_ngay)


def tinh_do_tuong_dong_cosine(v1, v2):
    """
    Tính độ tương đồng cosine giữa hai vector (dùng cho item-based)
    - v1, v2: danh sách điểm đánh giá của hai sản phẩm
    Trả về giá trị từ 0 đến 1
    """
    tu = sum(a * b for a, b in zip(v1, v2))
    mau1 = math.sqrt(sum(a * a for a in v1))
    mau2 = math.sqrt(sum(b * b for b in v2))
    if mau1 == 0 or mau2 == 0:
        return 0
    return tu / (mau1 * mau2)


def chuan_hoa_diem(danh_sach, max_score=100):
    """
    Chuẩn hóa điểm score của các sản phẩm về khoảng [0, max_score]
    Giúp kết hợp nhiều nguồn gợi ý dễ dàng
    """
    if not danh_sach:
        return danh_sach
    diem = [r["score"] for r in danh_sach]
    mn, mx = min(diem), max(diem)
    if mn == mx:
        return danh_sach
    for r in danh_sach:
        r["score"] = ((r["score"] - mn) / (mx - mn)) * max_score
    return danh_sach

# ================== GỢI Ý NỘI DUNG ==================

def goi_y_noi_dung(id_user, db: Session):
    """
    Gợi ý sản phẩm dựa trên hành vi người dùng:
    - Đơn hàng gần đây: tăng trọng số danh mục đã mua
    - Lịch sử xem: tăng trọng số danh mục đã xem
    - Tính điểm cho tất cả sản phẩm theo danh mục
    """
    don_hang = db.query(DonHang).filter(DonHang.ma_nguoi_dung == id_user).all()
    lich_su = (db.query(LichSuXem)
        .filter(LichSuXem.ma_nguoi_dung == id_user)
        .order_by(LichSuXem.thoi_gian.desc())
        .limit(50)
        .all()
    )
    diem_danh_muc = defaultdict(float)

    #Tính điểm từ đơn hàng
    for dh in don_hang:
        for ct in dh.chi_tiet_don_hangs:
            sp = ct.san_pham
            w = giam_trong_so_theo_thoi_gian(dh.ngay_dat)
            diem_danh_muc[sp.ma_danh_muc] += 3 * w
    print(diem_danh_muc)
            
    #Tính điểm từ lịch sử xem
    for ls in lich_su:
        sp = ls.san_pham
        w = giam_trong_so_theo_thoi_gian(ls.thoi_gian)
        diem_danh_muc[sp.ma_danh_muc] += 1 * w

    #Tính điểm cho tất cả sản phẩm
    ket_qua = []
    tat_ca_sp = db.query(SanPham).all()

    for sp in tat_ca_sp:
        diem = diem_danh_muc.get(sp.ma_danh_muc, 0)
        if diem > 0:
            ket_qua.append({"san_pham": sp, "score": diem, "method":"noi_dung"})

    ket_qua.sort(key=lambda x: x["score"], reverse=True)
    return ket_qua[:5]


# ================== GỢI Ý NGƯỜI DÙNG ==================

def goi_y_nguoi_dung(id_user, db: Session):
    """
    Gợi ý sản phẩm dựa trên người dùng tương đồng:
    - So sánh đánh giá sản phẩm giữa user và các user khác
    - Tính tương đồng Pearson
    - Dự đoán điểm cho sản phẩm chưa đánh giá
    - Trả về các sản phẩm chưa đánh giá với score dự đoán
    """
    rating_nguoi_dung = {r.ma_san_pham: r.sao
                   for r in db.query(DanhGia).filter(DanhGia.ma_nguoi_dung == id_user)}
    
    if not rating_nguoi_dung:
        return []
    #Lấy đánh giá người dùng khác
    rating_nguoi_khac = defaultdict(dict)
    for r in db.query(DanhGia).filter(DanhGia.ma_nguoi_dung != id_user).all():
        rating_nguoi_khac[r.ma_nguoi_dung][r.ma_san_pham] = r.sao

    #Tìm người dùng tương đồng
    nguoi_tuong_dong = []
    for uid, rate in rating_nguoi_khac.items():
        chung = set(rating_nguoi_dung) & set(rate)
        if len(chung) < 2:
            continue
        v1 = [rating_nguoi_dung[p] for p in chung]
        v2 = [rate[p] for p in chung]
        tb1, tb2 = sum(v1)/len(v1), sum(v2)/len(v2)
        
        tu = sum((a - tb1) * (b - tb2) for a,b in zip(v1,v2))
        mau = math.sqrt(sum((a-tb1)**2 for a in v1)) * math.sqrt(sum((b-tb2)**2 for b in v2))
        if mau == 0:
            continue
        sim = tu / mau
        if sim > 0: #Ngưỡng tương đồng
            nguoi_tuong_dong.append((uid, sim, rate))

    if not nguoi_tuong_dong:
        return []
    
    #Dự đoán điểm cho sản phẩm chưa đánh giá
    du_doan = defaultdict(lambda: {"tu":0,"mau":0})
    for uid, sim, rate in nguoi_tuong_dong:
        for pid, sao in rate.items():
            if pid not in rating_nguoi_dung:
                du_doan[pid]["tu"] += sim * sao
                du_doan[pid]["mau"] += abs(sim)
    
    ket_qua = []
    for pid, p in du_doan.items():
        if p["mau"] == 0:
            continue
        sp = db.query(SanPham).filter(SanPham.ma_san_pham == pid).first()
        if not sp:
            continue
        ket_qua.append({
            "san_pham": sp, 
            "score": p["tu"]/p["mau"] * 20, 
            "method":"nguoi_dung"
        })

    ket_qua.sort(key=lambda x: x["score"], reverse=True)
    return ket_qua

# ================== GỢI Ý ITEM-BASED ==================

def goi_y_san_pham(id_user, db: Session):
    """
    Gợi ý sản phẩm dựa trên các sản phẩm người dùng đã thích:
    - Các sản phẩm đánh giá cao hoặc mua gần đây
    - Tính độ tương đồng cosine giữa các sản phẩm
    - Cộng điểm các sản phẩm tương tự
    """
    # Các sản phẩm người dùng thích (đã đánh giá cao)
    danh_gia_cua_user = set(r.ma_san_pham for r in db.query(DanhGia)
                            .filter(DanhGia.ma_nguoi_dung == id_user, DanhGia.sao >= 4).all())
    #Lấy 5 đơn hàng gần nhất
    don_hang_gan_nhat = (db.query(DonHang)
        .filter(DonHang.ma_nguoi_dung == id_user)
        .order_by(DonHang.ngay_dat.desc())
        .limit(5)
        .all()
    )

    # Lấy tất cả sản phẩm trong đơn hàng
    danh_gia_cua_user.update(
        chi_tiet.ma_san_pham 
        for dh in don_hang_gan_nhat
        for chi_tiet in dh.chi_tiet_don_hangs
    )
    # Tạo ma trận đánh giá
    matrix = defaultdict(dict)
    for r in db.query(DanhGia).all():
        matrix[r.ma_nguoi_dung][r.ma_san_pham] = r.sao

    # Danh sách sản phẩm
    tat_ca_san_pham = [p.ma_san_pham for p in db.query(SanPham).all()]

    # Tính tương đông giữa sản phẩm đánh giá cao và các sản phẩm khác
    diem_tuong_dong = defaultdict(dict)
    for sp_yeu_thich in danh_gia_cua_user:
        for sp_khac in tat_ca_san_pham:
            if sp_khac == sp_yeu_thich or sp_khac in danh_gia_cua_user:
                continue
            v1, v2 = [],[]
            for uid, rates in matrix.items():
                if sp_yeu_thich in rates and sp_khac in rates:
                    v1.append(rates[sp_yeu_thich])
                    v2.append(rates[sp_khac])
            if len(v1) >= 2:
                diem_tuong_dong[sp_yeu_thich][sp_khac] = tinh_do_tuong_dong_cosine(v1, v2)

    # Tính tổng điểm dựa trên các sản phẩm đánh giá cao
    diem = defaultdict(float)
    for sp_yeu_thich, orthers in diem_tuong_dong.items():
        for sp_khac, s in orthers.items():
            diem[sp_khac] += s
    
    # Chuẩn bị kết quả
    ket_qua = []
    for pid, diem_sp in diem.items():
        sp = db.query(SanPham).filter(SanPham.ma_san_pham == pid).first()
        if sp:
            ket_qua.append({
                "san_pham": sp,
                "score": diem_sp * 100,
                "method":"san_pham"
            })
    
    ket_qua.sort(key=lambda x:x["score"], reverse=True)
    return ket_qua

# ================== GỢI Ý PHỔ BIẾN ==================

def goi_y_pho_bien(id_user, db: Session, days=30):
    """
    Gợi ý sản phẩm phổ biến dựa trên:
    - số lượt xem trong 30 ngày gần đây
    - số lượt mua trong 30 ngày gần đây
    - điểm đánh giá trung bình
    Loại bỏ sản phẩm đã mua nếu cần.
    """
    da_mua = set()
    don_hang_user = db.query(DonHang).filter(DonHang.ma_nguoi_dung == id_user).all()
    for dh in don_hang_user:
        for chi_tiet in dh.chi_tiet_don_hangs:
            da_mua.add(chi_tiet.ma_san_pham)
    
    moc = datetime.now() - timedelta(days=days)
    # Thống kê lượt xem, lượt mua, đánh giá
    thong_ke = defaultdict(lambda: {"views": 0, "purchases": 0, "rating_sum": 0, "rating_count": 0})

    # Lượt xem trong khoảng thời gian
    for ls in db.query(LichSuXem).filter(LichSuXem.thoi_gian >= moc).all():
        thong_ke[ls.ma_san_pham]["views"] += 1
    
    # Lượt mua trong khoảng thời gian
    don_hang_moi = db.query(DonHang).filter(DonHang.ngay_dat >= moc).all()
    for dh in don_hang_moi:
        for chi_tiet in dh.chi_tiet_don_hangs:
            thong_ke[chi_tiet.ma_san_pham]["purchases"] += 1

    # Điểm đánh giá
    for r in db.query(DanhGia).all():
        thong_ke[r.ma_san_pham]["rating_sum"] += r.sao
        thong_ke[r.ma_san_pham]["rating_count"] += 1
    
    # Tính điểm 
    ket_qua = []
    for pid, st in thong_ke.items():
        if pid in da_mua:
            continue
        avg = st["rating_sum"] / st["rating_count"] if st["rating_count"] > 0 else 3
        sp = db.query(SanPham).filter(SanPham.ma_san_pham == pid).first()

        if sp:
            diem = (st["views"] * 0.1 + st["purchases"] * 2) * (avg / 5)
            ket_qua.append({
                "san_pham": sp,
                "score": diem,
                "method":"pho_bien"
            })
    ket_qua.sort(key=lambda x: x["score"], reverse=True)
    return ket_qua

# ================== HYBRID ==================

def goi_y_ket_hop(id_user, db: Session, top_n=10):
    """
    Gợi ý tổng hợp (Hybrid) dựa trên:
    - Nội dung (danh mục)
    - Người dùng tương đồng
    - Sản phẩm tương tự (item-based)
    - Sản phẩm phổ biến
    Kết hợp điểm với trọng số W và hệ số giảm dần theo thứ hạng
    """
    W = {"noi_dung":0.3, "nguoi_dung":0.3, "san_pham":0.25, "pho_bien":0.15}

    g1=chuan_hoa_diem(goi_y_noi_dung(id_user, db))
    g2=chuan_hoa_diem(goi_y_nguoi_dung(id_user, db))
    g3=chuan_hoa_diem(goi_y_san_pham(id_user, db))
    g4=chuan_hoa_diem(goi_y_pho_bien(id_user, db))

    combined=defaultdict(lambda: {"san_pham":None,"score":0,"methods":[]})

    def cong_diem(ds, method, w):
        for i,r in enumerate(ds[:20]):
            pid=r["san_pham"].ma_san_pham
            if combined[pid]["san_pham"] is None:
                combined[pid]["san_pham"]=r["san_pham"]
            he_so_rank=max(1-i*0.02,0.5)
            combined[pid]["score"] += r["score"]*w*he_so_rank
            combined[pid]["methods"].append(method)

    cong_diem(g1,"noi_dung",W["noi_dung"])
    cong_diem(g2,"nguoi_dung",W["nguoi_dung"])
    cong_diem(g3,"san_pham",W["san_pham"])
    cong_diem(g4,"pho_bien",W["pho_bien"])

    danh_sach=[{"san_pham":d["san_pham"],"score":round(d["score"],2),"methods":list(set(d["methods"]))} for d in combined.values()]
    danh_sach.sort(key=lambda x:x["score"],reverse=True)
    return danh_sach[:top_n]

def goi_y_pho_bien_cho_guest(db: Session, days=30, top_n=20):
    """
    Gợi ý sản phẩm phổ biến cho user chưa đăng nhập:
    - dựa trên lượt xem, lượt mua, điểm đánh giá
    """
    moc = datetime.now() - timedelta(days=days)
    thong_ke = defaultdict(lambda: {"views": 0, "purchases": 0, "rating_sum": 0, "rating_count": 0})

    # Lượt xem
    for ls in db.query(LichSuXem).filter(LichSuXem.thoi_gian >= moc).all():
        thong_ke[ls.ma_san_pham]["views"] += 1

    # Lượt mua
    don_hang_moi = db.query(DonHang).filter(DonHang.ngay_dat >= moc).all()
    for dh in don_hang_moi:
        for ct in dh.chi_tiet_don_hangs:
            thong_ke[ct.ma_san_pham]["purchases"] += 1

    # Điểm đánh giá
    for r in db.query(DanhGia).all():
        thong_ke[r.ma_san_pham]["rating_sum"] += r.sao
        thong_ke[r.ma_san_pham]["rating_count"] += 1

    # Tính score và sắp xếp
    ket_qua = []
    for pid, st in thong_ke.items():
        avg = st["rating_sum"] / st["rating_count"] if st["rating_count"] > 0 else 3
        sp = db.query(SanPham).filter(SanPham.ma_san_pham == pid).first()
        if sp:
            diem = (st["views"]*0.1 + st["purchases"]*2)*(avg/5)
            ket_qua.append({"san_pham": sp, "score": diem})

    ket_qua.sort(key=lambda x: x["score"], reverse=True)
    return ket_qua[:top_n]


def get_trending_by_category(db: Session, days: int = 30, top_dm: int = 5, top_sp: int = 10):
    """
    Trả về:
    {
        ma_danh_muc_1: [sp1, sp2, ...],
        ma_danh_muc_2: [sp3, sp4, ...]
    }
    """
    moc = datetime.now() - timedelta(days=days)

    sp_stats = defaultdict(lambda: {"views": 0, "purchases": 0})
    dm_stats = defaultdict(int)

    # ===================== THỐNG KÊ VIEW =====================
    for ls in db.query(LichSuXem).filter(LichSuXem.thoi_gian >= moc).all():
        sp = db.query(SanPham).get(ls.ma_san_pham)
        if not sp:
            continue

        sp_stats[sp.ma_san_pham]["views"] += 1
        dm_stats[sp.ma_danh_muc] += 1

    # ===================== THỐNG KÊ PURCHASE =====================
    don_hang_moi = db.query(DonHang).filter(DonHang.ngay_dat >= moc).all()
    for dh in don_hang_moi:
        for ct in dh.chi_tiet_don_hangs:
            sp = db.query(SanPham).get(ct.ma_san_pham)
            if not sp:
                continue

            sp_stats[sp.ma_san_pham]["purchases"] += 1
            dm_stats[sp.ma_danh_muc] += 1

    # ===================== TOP DANH MỤC =====================
    top_dm_ids = sorted(dm_stats, key=lambda k: dm_stats[k], reverse=True)[:top_dm]

    # ===================== GROUP THEO DANH MỤC =====================
    result = defaultdict(list)

    for pid, st in sp_stats.items():
        sp = db.query(SanPham).get(pid)
        if not sp or sp.ma_danh_muc not in top_dm_ids:
            continue

        score = st["views"] * 0.2 + st["purchases"] * 1.5

        result[sp.ma_danh_muc].append({
            "san_pham": sp,
            "score": score,
            "method": "trending_category"
        })

    # ===================== SORT & FORMAT =====================
    for dm_id in result:
        result[dm_id] = sorted(result[dm_id], key=lambda x: x["score"], reverse=True)[:top_sp]

    return result


def lay_top_san_pham_tot_nhat_theo_danh_muc(
    db: Session,
    ma_danh_muc: int,
    so_luong: int = 10,
    diem_danh_gia_toi_thieu: float = 3.5
):
    """
    Lấy TOP sản phẩm tốt nhất theo danh mục

    Tiêu chí:
    - Ưu tiên số lượng bán
    - Kết hợp điểm đánh giá trung bình

    Return:
    [
        {
            "san_pham": SanPham,
            "diem_trung_binh": float,
            "tong_da_ban": int,
            "diem_xep_hang": float,
            "phuong_phap": "top_theo_danh_muc"
        }
    ]
    """

    # ===================== LẤY SẢN PHẨM TRONG DANH MỤC =====================
    danh_sach_san_pham = (
        db.query(SanPham)
        .filter(SanPham.ma_danh_muc == ma_danh_muc)
        .all()
    )

    ket_qua = []

    for san_pham in danh_sach_san_pham:

        # ===================== TỔNG ĐÃ BÁN =====================
        tong_da_ban = (
            db.query(func.sum(ChiTietDonHang.so_luong))
            .filter(ChiTietDonHang.ma_san_pham == san_pham.ma_san_pham)
            .scalar()
        ) or 0

        # ===================== ĐIỂM ĐÁNH GIÁ TRUNG BÌNH =====================
        diem_trung_binh = (
            db.query(func.avg(DanhGia.sao))
            .filter(DanhGia.ma_san_pham == san_pham.ma_san_pham)
            .scalar()
        )

        diem_trung_binh = float(diem_trung_binh) if diem_trung_binh else 3.5

        diem_xep_hang = tong_da_ban * 1.2 + diem_trung_binh * 2

        ket_qua.append({
            "san_pham": san_pham,
            "diem_trung_binh": diem_trung_binh,
            "tong_da_ban": tong_da_ban,
            "diem_xep_hang": diem_xep_hang,
            "phuong_phap": "top_theo_danh_muc"
        })

    # ===================== SẮP XẾP =====================
    ket_qua = sorted(
        ket_qua,
        key=lambda x: x["diem_xep_hang"],
        reverse=True
    )

    return ket_qua[:so_luong]


