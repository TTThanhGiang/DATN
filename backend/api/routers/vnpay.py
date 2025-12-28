import os
import hashlib
import hmac
import urllib.parse
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

VNP_TMN_CODE = os.getenv("VNP_TMN_CODE")
VNP_HASH_SECRET = os.getenv("VNP_HASH_SECRET")
VNP_URL = os.getenv("VNP_URL")
VNP_RETURN_URL = os.getenv("VNP_RETURN_URL")

class PaymentRequest(BaseModel):
    order_id: str
    total_price: float  # Giá tính bằng USD
    order_info: str

def hmac_sha512(key: str, data: str):
    return hmac.new(key.encode('utf-8'), data.encode('utf-8'), hashlib.sha512).hexdigest()

def create_vnpay_url(ma_don_hang: int, tong_tien: int, ip_addr: str):
    try:
        # 1. Quy đổi USD -> VND và nhân 100 theo yêu cầu VNPay
        total_price_vnd = int(tong_tien)
        vnp_Amount = total_price_vnd * 100
        
        vnp_params = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": VNP_TMN_CODE,
            "vnp_Amount": str(vnp_Amount),
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": ma_don_hang,
            "vnp_OrderInfo": ma_don_hang,
            "vnp_OrderType": "billpayment",
            "vnp_Locale": "vn",
            "vnp_ReturnUrl": VNP_RETURN_URL,
            "vnp_IpAddr": ip_addr,
            "vnp_CreateDate": datetime.now().strftime("%Y%m%d%H%M%S"),
        }

        # 2. Sắp xếp và tạo Sign Data (Giống logic ksort và foreach trong PHP)
        input_data = sorted(vnp_params.items())
        query_parts = []
        for key, value in input_data:
            query_parts.append(f"{urllib.parse.quote_plus(key)}={urllib.parse.quote_plus(str(value))}")
        
        hash_data = "&".join(query_parts)
        secure_hash = hmac_sha512(VNP_HASH_SECRET, hash_data)

        # 3. Trả về URL
        payment_url = f"{VNP_URL}?{hash_data}&vnp_SecureHash={secure_hash}"
        
        return payment_url

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
