import os
import hmac
import hashlib
from urllib.parse import quote_plus
from datetime import datetime
from io import BytesIO
import qrcode
import base64

# Lấy cấu hình từ biến môi trường
VNPAY_URL = os.getenv("VNPAY_URL", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")
TMN_CODE = os.getenv("VNPAY_TMNCODE")
HASH_SECRET = os.getenv("VNPAY_HASHSECRET")
RETURN_URL = os.getenv("VNPAY_RETURN_URL")
VNPAY_VERSION = "2.1.0"

def create_secure_hash(params: dict) -> str:
    """
    Tạo SecureHash. CHỈ sử dụng các giá trị (value) RAW (chưa được URL-encode).
    """
    # 1. Loại bỏ các tham số không cần hash (vnp_SecureHash, vnp_SecureHashType) và giá trị None/rỗng
    hash_items = sorted([
        (k, v) for k, v in params.items()
        if v is not None and v != "" and k not in ("vnp_SecureHash", "vnp_SecureHashType")
    ])
    
    # 2. Tạo chuỗi dữ liệu thô (raw data) theo format key=value&...
    # LƯU Ý QUAN TRỌNG: KHÔNG URL-ENCODE DỮ LIỆU Ở BƯỚC NÀY
    hash_data = "&".join(f"{k}={v}" for k, v in hash_items)
    
    # 3. Mã hóa HMACSHA512
    return hmac.new(HASH_SECRET.encode(), hash_data.encode(), hashlib.sha512).hexdigest()

def create_payment_url(order_id: int, amount_vnd: int, info: str, client_ip: str) -> str:
    # VNPAY expects amount*100, integer
    amount_payload = int(amount_vnd) * 100

    # 1. Chuẩn bị Dictionary chứa CÁC GIÁ TRỊ THÔ (RAW VALUES) cho việc HASH
    # Mọi giá trị phải là string, và KHÔNG được URL-encoded
    vnp_raw_params = {
        "vnp_Version": VNPAY_VERSION,
        "vnp_Command": "pay",
        "vnp_TmnCode": TMN_CODE,
        "vnp_Amount": str(amount_payload),
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": str(order_id),
        # FIX: SỬ DỤNG GIÁ TRỊ THÔ (RAW 'info') cho vnp_OrderInfo.
        "vnp_OrderInfo": info, 
        "vnp_OrderType": "other",
        "vnp_ReturnUrl": RETURN_URL,
        "vnp_IpAddr": client_ip,
        "vnp_CreateDate": datetime.utcnow().strftime("%Y%m%d%H%M%S"),
    }
    
    # 2. Tạo Secure Hash từ các giá trị thô
    secure_hash = create_secure_hash(vnp_raw_params)

    # 3. Thêm Secure Hash Type và Secure Hash vào dictionary cuối cùng
    # (Vẫn giữ dictionary này chứa giá trị thô)
    vnp_raw_params["vnp_SecureHashType"] = "HMACSHA512"
    vnp_raw_params["vnp_SecureHash"] = secure_hash

    # 4. Sắp xếp tất cả các tham số (bao gồm cả hash)
    final_items = sorted(vnp_raw_params.items(), key=lambda x: x[0])
    
    # 5. URL ENCODING TẤT CẢ CÁC GIÁ TRỊ và tạo query string
    # LƯU Ý: quote_plus sẽ tự động encode các giá trị tiếng Việt/khoảng trắng
    query = "&".join(f"{k}={quote_plus(str(vnp_raw_params[k]))}" for k, v in final_items)
    
    return f"{VNPAY_URL}?{query}"

def create_qr_base64(payment_url: str) -> str:
    img = qrcode.make(payment_url)
    bio = BytesIO()
    img.save(bio, format="PNG")
    return base64.b64encode(bio.getvalue()).decode()