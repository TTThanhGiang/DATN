import { Box, Card, Typography, Divider } from "@mui/material";
import SanPhamItem from "./SanPhamItem";

export default function DonHangItem({ donHang, suKienDanhGia }) {
  return (
    <Card sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography fontWeight={600} color="primary">
          Mã đơn: {donHang.ma_don_hang}
        </Typography>

        <Typography fontWeight={600} color="green">
          {donHang.trang_thai}
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
      <Box textAlign="right" mt={2}>
        <Typography fontSize={15}>
          Thành tiền:
          <Typography component="span" ml={1} color="red" fontWeight={700}>
            {donHang.tong_tien.toLocaleString()}₫
          </Typography>
        </Typography>
      </Box>
    </Card>
  );
}
