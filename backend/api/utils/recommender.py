from sqlalchemy.orm import Session
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from api.models import SanPham, DanhGia, ChiTietDonHang, LichSuXem

def recommend_products_hybrid(user_id: int, db: Session, top_k: int = 10):
    # --- 1. Lấy danh sách tất cả sản phẩm ---
    products = db.query(SanPham).all()
    if not products:
        return []

    descriptions = [p.mo_ta or "" for p in products]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(descriptions)

    # --- 2. Lấy danh sách sản phẩm đã mua ---
    bought_ids = [
        r[0] for r in db.query(ChiTietDonHang.ma_san_pham)
        .join(ChiTietDonHang.don_hang)
        .filter(ChiTietDonHang.don_hang.has(ma_khach_hang=user_id))
        .all()
    ]

    # --- 3. Lấy danh sách sản phẩm đã xem ---
    viewed_ids = [
        r[0] for r in db.query(LichSuXem.ma_san_pham)
        .filter(LichSuXem.ma_nguoi_dung == user_id)
        .all()
    ]

    # --- 4. Lấy đánh giá của người dùng ---
    rated = db.query(DanhGia).filter(DanhGia.ma_nguoi_dung == user_id).all()
    rated_ids = [r.ma_san_pham for r in rated]
    rated_scores = {r.ma_san_pham: r.so_sao for r in rated}

    # --- 5. Tạo vector hồ sơ người dùng ---
    weights = []
    product_vectors = []

    for i, p in enumerate(products):
        w = 0
        if p.ma_san_pham in bought_ids:
            w += 0.5
        if p.ma_san_pham in viewed_ids:
            w += 0.2
        if p.ma_san_pham in rated_scores:
            w += 0.3 * (rated_scores[p.ma_san_pham] / 5)  # scale theo điểm sao
        if w > 0:
            weights.append(w)
            product_vectors.append(tfidf_matrix[i])

    if not product_vectors:
        # Người dùng mới chưa có hành vi
        return db.query(SanPham).limit(top_k).all()

    user_profile = np.average(product_vectors, axis=0, weights=weights)
    similarity_scores = cosine_similarity(user_profile, tfidf_matrix).flatten()

    # --- 6. Loại bỏ sản phẩm đã mua ---
    recommendations = [
        (p, similarity_scores[i])
        for i, p in enumerate(products)
        if p.ma_san_pham not in bought_ids
    ]

    recommendations.sort(key=lambda x: x[1], reverse=True)
    return [p for p, _ in recommendations[:top_k]]
