import { Box, Typography, Card, CardMedia, Button } from "@mui/material";

export default function SanPhamItem({ sanPham, suKienDanhGia }) {

  return (
    <Card
      sx={{
        display: "flex",
        p: 2,
        mb: 2,
        boxShadow: 1,
        borderRadius: 2,
        alignItems: "center",
      }}
    >
      {/* Hình ảnh */}
      <CardMedia
        component="img"
        image={sanPham.hinh_anhs}
        alt={sanPham.ten_san_pham}
        sx={{ width: 90, height: 90, borderRadius: 1, objectFit: "cover" }}
      />

      {/* Thông tin */}
      <Box sx={{ ml: 2, flexGrow: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          {sanPham.ten_san_pham}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Phân loại hàng: {sanPham.don_vi}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          x{sanPham.so_luong}
        </Typography>

        <Box mt={1}>
          <Typography sx={{ fontWeight: 600, color: "red", fontSize: "16px" }}>
            {sanPham.gia_tien.toLocaleString()}₫
          </Typography>
        </Box>
      </Box>

      {/* Nút đánh giá */}
      <Button
        variant="contained"
        color="warning"
        onClick={() => suKienDanhGia(sanPham)}
        sx={{
          px: { xs: 1.5, sm: 2.5 },   // padding ngang responsive
          minWidth: { xs: "auto", sm: 120 },
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          whiteSpace: "nowrap",
        }}
      >
        Đánh giá
      </Button>
    </Card>
  );
}
