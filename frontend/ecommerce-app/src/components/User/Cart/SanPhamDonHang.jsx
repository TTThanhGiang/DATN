import React from "react";
import { Box, Typography } from "@mui/material";

export default function SanPhamDonHang({
  ten_san_pham,
  gia_goc,
  gia_sau_giam,
  don_vi,
  hinh_anh,
  so_luong,
}) {
  // 1. Tính toán giá trị
  const tong_tien = gia_sau_giam * so_luong;
  const tong_gia_goc = gia_goc * so_luong;
  
  // 2. Tính % giảm giá (nếu có)
  const phan_tram_giam = gia_goc > gia_sau_giam 
    ? Math.round(((gia_goc - gia_sau_giam) / gia_goc) * 100) 
    : 0;

  return (
    <Box
      sx={{
        bgcolor: "white",
        p: 2,
        borderRadius: 2,
        mb: 2,
        boxShadow: 1,
        transition: "0.2s",
        "&:hover": { boxShadow: 3 },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={2}>
          {/* Hình ảnh sản phẩm */}
          <Box
            component="img"
            src={hinh_anh}
            alt={ten_san_pham}
            sx={{ width: 60, height: 60, objectFit: "cover", borderRadius: 1, border: "1px solid #eee" }}
          />
          
          <Box>
            <Typography fontWeight="bold" variant="body1">
              {so_luong} x {ten_san_pham}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Đơn giá: {gia_goc.toLocaleString()}đ/{don_vi}
            </Typography>
          </Box>
        </Box>

        {/* Khu vực hiển thị giá */}
        <Box sx={{ textAlign: "right" }}>
          {gia_sau_giam < gia_goc && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "flex-end", mb: 0.5 }}>
              {/* Phần trăm giảm giá */}
              <Typography
                sx={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#fff",
                  backgroundColor: "#ff4d4f",
                  borderRadius: "4px",
                  px: 0.5,
                }}
              >
                -{phan_tram_giam}%
              </Typography>
              
              {/* Giá cũ gạch ngang */}
              <Typography
                variant="body2"
                sx={{ textDecoration: "line-through", color: "#9DA7BC" }}
              >
                {tong_gia_goc.toLocaleString()}đ
              </Typography>
            </Box>
          )}

          {/* Giá tổng cuối cùng */}
          <Typography fontWeight="bold" fontSize="18px" color="primary.main">
            {tong_tien.toLocaleString()}đ
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}