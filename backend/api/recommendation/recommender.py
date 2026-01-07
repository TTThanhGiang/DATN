from collections import defaultdict
from datetime import datetime, timedelta
import math

# ================== UTIL ==================

def chuyen_sang_datetime(tg):
    if isinstance(tg, datetime):
        return tg
    if isinstance(tg, str):
        return datetime.fromisoformat(tg)
    return None


def giam_trong_so_theo_thoi_gian(thoi_gian, he_so=0.1):
    tg = chuyen_sang_datetime(thoi_gian)
    if not tg:
        return 0
    so_ngay = (datetime.now() - tg).days
    return math.exp(-he_so * so_ngay)


def cosine(v1, v2):
    tu = sum(a * b for a, b in zip(v1, v2))
    mau = math.sqrt(sum(a*a for a in v1)) * math.sqrt(sum(b*b for b in v2))
    return tu / mau if mau else 0

# ================== Nội dung ==================

def goi_y_theo_noi_dung(ma_nguoi_dung, du_lieu):
    ma_nguoi_dung = str(ma_nguoi_dung)
    diem_danh_muc = defaultdict(float)

    for dh in du_lieu["don_hang"].get(ma_nguoi_dung, []):
        w = giam_trong_so_theo_thoi_gian(dh["ngay_dat"])
        for pid in dh["san_pham"]:
            pid = str(pid)
            dm = du_lieu["san_pham"][pid]["ma_danh_muc"]
            diem_danh_muc[dm] += 3 * w

    for lx in du_lieu.get("luot_xem", {}).get(ma_nguoi_dung, [])[:50]:
        w = giam_trong_so_theo_thoi_gian(lx["thoi_gian"])
        pid = str(lx["ma_san_pham"])
        dm = du_lieu["san_pham"][pid]["ma_danh_muc"]
        diem_danh_muc[dm] += w

    ket_qua = []
    for pid, sp in du_lieu["san_pham"].items():
        diem = diem_danh_muc.get(sp["ma_danh_muc"], 0)
        if diem > 0:
            ket_qua.append({
                "ma_san_pham": int(pid),
                "ten": sp["ten"],
                "diem": round(diem, 2),
                "phuong_phap": "noi_dung"
            })

    return sorted(ket_qua, key=lambda x: x["diem"], reverse=True)[:5]

# ================== Người dùng ==================

def goi_y_theo_nguoi_dung(ma_nguoi_dung, du_lieu):
    ma_nguoi_dung = str(ma_nguoi_dung)
    danh_gia_user = du_lieu["danh_gia"].get(ma_nguoi_dung)
    if not danh_gia_user:
        return []

    ket_qua = []

    for uid, danh_gia in du_lieu["danh_gia"].items():
        if uid == ma_nguoi_dung:
            continue

        chung = set(danh_gia_user) & set(danh_gia)
        if len(chung) < 2:
            continue

        v1 = [danh_gia_user[p] for p in chung]
        v2 = [danh_gia[p] for p in chung]
        sim = cosine(v1, v2)

        if sim <= 0:
            continue

        for pid, sao in danh_gia.items():
            if pid not in danh_gia_user:
                sp = du_lieu["san_pham"].get(pid)
                if sp:
                    ket_qua.append({
                        "ma_san_pham": int(pid),
                        "ten": sp["ten"],
                        "diem": round(sim * sao * 10, 2),
                        "phuong_phap": "nguoi_dung"
                    })

    return sorted(ket_qua, key=lambda x: x["diem"], reverse=True)

# ================== Phổ biến ==================

def goi_y_pho_bien(du_lieu, so_ngay=30):
    moc = datetime.now() - timedelta(days=so_ngay)
    thong_ke = defaultdict(lambda: {"xem": 0, "mua": 0})

    for ds in du_lieu.get("luot_xem", {}).values():
        for lx in ds:
            tg = chuyen_sang_datetime(lx.get("thoi_gian"))
            if tg and tg >= moc:
                pid = str(lx["ma_san_pham"])
                thong_ke[pid]["xem"] += 1

    for ds in du_lieu.get("don_hang", {}).values():
        for dh in ds:
            tg = chuyen_sang_datetime(dh.get("ngay_dat"))
            if tg and tg >= moc:
                for pid in dh["san_pham"]:
                    thong_ke[str(pid)]["mua"] += 1

    ket_qua = []
    for pid, st in thong_ke.items():
        sp = du_lieu["san_pham"].get(pid)
        if sp:
            diem = st["xem"] * 0.2 + st["mua"] * 1.5
            if diem > 0:
                ket_qua.append({
                    "ma_san_pham": int(pid),
                    "ten": sp["ten"],
                    "diem": round(diem, 2),
                    "phuong_phap": "pho_bien"
                })

    return sorted(ket_qua, key=lambda x: x["diem"], reverse=True)

# ================== HYBRID ==================

def goi_y_ket_hop(ma_nguoi_dung, du_lieu, top_n=10):
    ds = (
        goi_y_theo_noi_dung(ma_nguoi_dung, du_lieu) +
        goi_y_theo_nguoi_dung(ma_nguoi_dung, du_lieu) +
        goi_y_pho_bien(du_lieu)
    )

    tong = defaultdict(float)
    ten_sp = {}

    for i, r in enumerate(ds):
        pid = r["ma_san_pham"]
        he_so = max(1 - i * 0.02, 0.6)
        tong[pid] += r["diem"] * he_so
        ten_sp[pid] = r["ten"]

    return sorted(
        [
            {"ma_san_pham": pid, "ten": ten_sp[pid], "diem": round(diem, 2)}
            for pid, diem in tong.items()
        ],
        key=lambda x: x["diem"],
        reverse=True
    )[:top_n]

def goi_y_pho_bien_cho_guest(du_lieu, so_ngay=30, top_n=20):
    moc_thoi_gian = datetime.now() - timedelta(days=so_ngay)

    thong_ke = defaultdict(lambda: {
        "luot_xem": 0,
        "luot_mua": 0,
        "tong_sao": 0,
        "so_luot_danh_gia": 0
    })

    # ===== LƯỢT XEM =====
    for danh_sach_xem in du_lieu["luot_xem"].values():
        for luot_xem in danh_sach_xem:
            thoi_gian = chuyen_sang_datetime(luot_xem.get("thoi_gian"))
            if thoi_gian and thoi_gian >= moc_thoi_gian:
                ma_sp = str(luot_xem["ma_san_pham"])
                thong_ke[ma_sp]["luot_xem"] += 1

    # ===== LƯỢT MUA =====
    for danh_sach_don in du_lieu["don_hang"].values():
        for don_hang in danh_sach_don:
            thoi_gian = chuyen_sang_datetime(don_hang.get("ngay_dat"))
            if thoi_gian and thoi_gian >= moc_thoi_gian:
                for ma_sp in don_hang["san_pham"]:
                    ma_sp = str(ma_sp)
                    thong_ke[ma_sp]["luot_mua"] += 1

    # ===== ĐÁNH GIÁ =====
    for danh_gia_user in du_lieu["danh_gia"].values():
        for ma_sp, so_sao in danh_gia_user.items():
            ma_sp = str(ma_sp)
            thong_ke[ma_sp]["tong_sao"] += so_sao
            thong_ke[ma_sp]["so_luot_danh_gia"] += 1

    # ===== TÍNH ĐIỂM =====
    ket_qua = []

    for ma_sp, so_lieu in thong_ke.items():
        san_pham = du_lieu["san_pham"].get(ma_sp)
        if not san_pham:
            continue

        diem_trung_binh = (
            so_lieu["tong_sao"] / so_lieu["so_luot_danh_gia"]
            if so_lieu["so_luot_danh_gia"] > 0 else 3
        )

        diem = (
            so_lieu["luot_xem"] * 0.1 +
            so_lieu["luot_mua"] * 2
        ) * (diem_trung_binh / 5)

        if diem > 0:
            ket_qua.append({
                "ma_san_pham": int(ma_sp), 
                "ten": san_pham["ten"],
                "diem": round(diem, 2),
                "phuong_phap": "pho_bien_guest"
            })

    return sorted(ket_qua, key=lambda x: x["diem"], reverse=True)[:top_n]

def goi_y_thinh_hanh_theo_danh_muc(du_lieu, so_ngay=30, top_danh_muc=3, top_san_pham=10):
    """
    Trả về sản phẩm trending theo danh mục:
    {
        ma_danh_muc_1: [sp1, sp2, ...],
        ma_danh_muc_2: [sp3, sp4, ...]
    }
    """

    moc_thoi_gian = datetime.now() - timedelta(days=so_ngay)

    thong_ke_san_pham = defaultdict(lambda: {
        "luot_xem": 0,
        "luot_mua": 0
    })

    thong_ke_danh_muc = defaultdict(int)

    # ===================== LƯỢT XEM =====================
    for danh_sach_xem in du_lieu["luot_xem"].values():
        for luot_xem in danh_sach_xem:
            thoi_gian = chuyen_sang_datetime(luot_xem.get("thoi_gian"))
            if not thoi_gian or thoi_gian < moc_thoi_gian:
                continue

            ma_sp = str(luot_xem["ma_san_pham"])
            san_pham = du_lieu["san_pham"].get(ma_sp)
            if not san_pham:
                continue

            thong_ke_san_pham[ma_sp]["luot_xem"] += 1
            thong_ke_danh_muc[san_pham["ma_danh_muc"]] += 1

    # ===================== LƯỢT MUA =====================
    for danh_sach_don in du_lieu["don_hang"].values():
        for don_hang in danh_sach_don:
            thoi_gian = chuyen_sang_datetime(don_hang.get("ngay_dat"))
            if not thoi_gian or thoi_gian < moc_thoi_gian:
                continue

            for ma_sp in don_hang["san_pham"]:
                ma_sp = str(ma_sp)
                san_pham = du_lieu["san_pham"].get(ma_sp)
                if not san_pham:
                    continue

                thong_ke_san_pham[ma_sp]["luot_mua"] += 1
                thong_ke_danh_muc[san_pham["ma_danh_muc"]] += 1

    # ===================== TOP DANH MỤC =====================
    top_danh_muc_ids = sorted(
        thong_ke_danh_muc,
        key=lambda ma_dm: thong_ke_danh_muc[ma_dm],
        reverse=True
    )[:top_danh_muc]

    # ===================== GROUP THEO DANH MỤC =====================
    ket_qua = defaultdict(list)

    for ma_sp, so_lieu in thong_ke_san_pham.items():
        san_pham = du_lieu["san_pham"].get(ma_sp)
        if not san_pham:
            continue

        ma_danh_muc = san_pham["ma_danh_muc"]
        if ma_danh_muc not in top_danh_muc_ids:
            continue

        diem = so_lieu["luot_xem"] * 0.2 + so_lieu["luot_mua"] * 1.5
        if diem <= 0:
            continue

        ket_qua[int(ma_danh_muc)].append({
            "ma_san_pham": int(ma_sp),   # giữ str
            "ten": san_pham["ten"],
            "diem": round(diem, 2),
            "phuong_phap": "trending_category"
        })

    # ===================== SORT & CẮT TOP =====================
    for ma_dm in ket_qua:
        ket_qua[ma_dm] = sorted(
            ket_qua[ma_dm],
            key=lambda x: x["diem"],
            reverse=True
        )[:top_san_pham]

    return ket_qua

