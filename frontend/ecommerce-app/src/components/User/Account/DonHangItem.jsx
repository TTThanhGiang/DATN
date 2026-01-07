import { Box, Card, Typography, Divider, Button } from "@mui/material";
import SanPhamItem from "./SanPhamItem";
import api from "../../../api";
import { getToken } from "../../../utils/auth";

export default function DonHangItem({ donHang, suKienDanhGia }) {

  const token = getToken();

  const trangThaiMap = {
    CHO_XU_LY: { text: "Chờ xử lý", color: "orange" },
    DA_XU_LY: { text: "Đã xử lý", color: "blue" },
    DA_HUY: { text: "Đã hủy", color: "red" },
    HOAN_THANH: { text: "Hoàn thành", color: "green" },
  };

  const handleThanhToanLai = async (maDonHang) => {
    try {
      const response = await api.get(`/users/re-payment/${maDonHang}`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.data.payment_url) {
        window.location.href = response.data.data.payment_url;
      } else {
        alert("Không thể tạo link thanh toán!");
      }
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      alert("Đã có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  return (
    <Card sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography fontWeight={600} color="primary">
          Mã đơn: {donHang.ma_don_hang}
        </Typography>

        <Typography fontWeight={600} color="green">
          Trạng thái: {trangThaiMap[donHang.trang_thai]?.text || "Không xác định"}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Danh sách sản phẩm */}
      {donHang.chi_tiet.map((sp, index) => (
        <SanPhamItem
          key={index}
          sanPham={sp}
          suKienDanhGia={suKienDanhGia}
        />
      ))}

      {/* Tổng tiền */}
      <Box textAlign="right" mt={2} display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
        <Typography fontSize={15}>
          Thành tiền:
          <Typography component="span" ml={1} color="red" fontWeight={700}>
            {donHang.tong_tien.toLocaleString()}₫
          </Typography>
        </Typography>

        {donHang.trang_thai_thanh_toan === "CHUA_THANH_TOAN" ? (
          <Button variant="contained" color="primary" size="small" onClick={() => handleThanhToanLai(donHang.ma_don_hang)}>
            Thanh toán ngay
          </Button>
        ) : (
          <Typography fontSize={15} color="green" fontWeight={600}>
            (Đã thanh toán)
          </Typography>
        )}
      </Box>
    </Card>
  );
}
