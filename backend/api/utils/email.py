
import hashlib
import os
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from dotenv import load_dotenv

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from itsdangerous import URLSafeTimedSerializer

from api.database import get_db
from api.models import DonHang, NguoiDung
import api.schemas as schemas

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Xác thực"])

# Định nghĩa schema OAuth2 cho Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/dang-nhap")

# cấu hình mã hóa mật khẩu
bo_ma_hoa = CryptContext(schemes=["bcrypt"], deprecated="auto")

# cấu hình gửi email
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

fm = FastMail(conf)

HOST_FRONTEND = os.getenv("HOST_FRONTEND")
HOST_BACKEND = os.getenv("HOST_BACKEND")

# cấu hình JWT
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

serializer = URLSafeTimedSerializer(SECRET_KEY)

async def gui_email_xac_thuc(email: schemas.EmailSchema, ho_ten: str, db: Session):
    raw_token = serializer.dumps(email, salt="email-confirm")

    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

    user = db.query(NguoiDung).filter(NguoiDung.email == email).first()
    if not user:
        return

    user.email_token = token_hash
    db.commit()

    link = f"{HOST_BACKEND}/auth/xac-thuc-email/{token_hash}"

    message = MessageSchema(
        subject="Xác thực email",
        recipients=[email],
        body=f"""
        <p>Chào {ho_ten},</p>
        <p>Nhấn vào link để xác thực email:</p>
        <a href="{link}">Xác thực email</a>
        <p>Link có hiệu lực trong 1 giờ.</p>
        """,
        subtype="html"
    )

    await fm.send_message(message)


async def gui_email_xac_nhan_don_hang(email: str, ho_ten: str, don_hang: DonHang, chi_tiet: list, phuong_thuc: str):
    """
    Gửi email xác nhận đơn hàng duy nhất một lần.
    phuong_thuc: nhận giá trị 'vnpay' hoặc 'cod' từ frontend gửi lên.
    """
    
    # 1. Tạo danh sách sản phẩm (Bảng HTML)
    items_html = ""
    for item in chi_tiet:
        # Hỗ trợ lấy tên từ object hoặc từ chi tiết gửi lên
        ten_sp = getattr(item, 'ten_san_pham', f"Sản phẩm #{item.ma_san_pham}")
        gia = item.gia_sau_giam if item.gia_sau_giam else item.gia_goc
        thanh_tien = gia * item.so_luong
        items_html += f"""
        <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">{ten_sp}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px; color: #666;">x{item.so_luong}</td>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: 500; color: #333;">{thanh_tien:,.0f}₫</td>
        </tr>
        """

    # 2. Tùy biến thông báo dựa trên phương thức thanh toán
    if phuong_thuc == "vnpay":
        status_box = """
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #166534; font-size: 15px; font-weight: bold;">✓ Xác nhận thanh toán trực tuyến</p>
            <p style="margin: 8px 0 0 0; color: #4a5568; font-size: 14px; line-height: 1.5;">
                Chúng tôi đã ghi nhận lựa chọn thanh toán qua <b>VNPay</b> của bạn. Đơn hàng sẽ được xử lý ngay sau khi giao dịch hoàn tất. 
                Bạn có thể kiểm tra trạng thái thanh toán trong mục "Lịch sử đơn hàng".
            </p>
        </div>
        """
    else:
        status_box = f"""
        <div style="background-color: #fffaf0; border: 1px solid #fbd38d; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #9c4221; font-size: 15px; font-weight: bold;">⚠️ Thanh toán khi nhận hàng (COD)</p>
            <p style="margin: 8px 0 0 0; color: #4a5568; font-size: 14px; line-height: 1.5;">
                Bạn đã lựa chọn thanh toán bằng tiền mặt khi nhận hàng. 
                Vui lòng chuẩn bị sẵn số tiền: <span style="color: #e53e3e; font-weight: bold; font-size: 16px;">{don_hang.tong_tien:,.0f}₫</span> để thanh toán cho nhân viên giao hàng.
            </p>
        </div>
        """

    # 3. Nội dung Email tổng thể
    message = MessageSchema(
        subject=f"Xác nhận đơn hàng mới #{don_hang.ma_don_hang}",
        recipients=[email],
        body=f"""
        <div style="background-color: #f4f4f4; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                
                <div style="background-color: #2d3748; padding: 30px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 20px; text-transform: uppercase;">Cảm ơn bạn đã đặt hàng</h2>
                    <p style="color: #a0aec0; margin: 8px 0 0 0;">Mã đơn hàng: #{don_hang.ma_don_hang}</p>
                </div>

                <div style="padding: 30px;">
                    <p style="font-size: 16px; color: #333;">Chào <strong>{ho_ten}</strong>,</p>
                    <p style="color: #555; line-height: 1.6;">Đơn hàng của bạn đã được tiếp nhận và đang được hệ thống xử lý.</p>
                    
                    {status_box}

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="border-bottom: 2px solid #edf2f7;">
                                <th style="text-align: left; padding: 10px 8px; font-size: 12px; color: #999; text-transform: uppercase;">Sản phẩm</th>
                                <th style="padding: 10px 8px; font-size: 12px; color: #999; text-transform: uppercase;">SL</th>
                                <th style="text-align: right; padding: 10px 8px; font-size: 12px; color: #999; text-transform: uppercase;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>{items_html}</tbody>
                    </table>

                    <div style="text-align: right; padding: 15px 0; border-top: 1px solid #eee;">
                        <p style="margin: 0; color: #718096; font-size: 14px;">Tổng số tiền cần thanh toán:</p>
                        <p style="margin: 5px 0 0 0; color: #e53e3e; font-size: 24px; font-weight: bold;">{don_hang.tong_tien:,.0f}₫</p>
                    </div>

                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin-top: 25px; border: 1px solid #e2e8f0;">
                        <h4 style="margin: 0 0 10px 0; color: #2d3748; font-size: 14px;">📍 Thông tin giao hàng</h4>
                        <p style="margin: 5px 0; font-size: 13px; color: #4a5568;"><b>Người nhận:</b> {ho_ten}</p>
                        <p style="margin: 5px 0; font-size: 13px; color: #4a5568;"><b>Điện thoại:</b> {don_hang.so_dien_thoai}</p>
                        <p style="margin: 5px 0; font-size: 13px; color: #4a5568;"><b>Địa chỉ:</b> {don_hang.dia_chi}</p>
                    </div>

                    <p style="margin-top: 25px; font-size: 12px; color: #a0aec0; text-align: center;">
                        Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ bộ phận CSKH để được hỗ trợ.
                    </p>
                </div>

                <div style="background-color: #f7fafc; padding: 15px; text-align: center; border-top: 1px solid #edf2f7;">
                    <p style="margin: 0; font-size: 11px; color: #cbd5e0;">&copy; 2026 Cửa hàng của bạn. All rights reserved.</p>
                </div>
            </div>
        </div>
        """,
        subtype="html"
    )

    await fm.send_message(message)