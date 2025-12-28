import React from "react";
import { Card, CardContent, CardMedia, Typography, Button, Box, Divider } from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import { getToken, getUser } from "../../../utils/auth";

const TheSanPham = ({ sanPham }) => {
  const {
    ma_san_pham,
    ten_san_pham,
    don_gia,
    giam_gia,
    don_vi,
    hinh_anhs,
  } = sanPham;

  const navigate = useNavigate();
  const token = getToken();

  // Mapping nội bộ để dùng trong component
  const tenSanPham = ten_san_pham;
  const gia = don_gia;
  const giamGiaPhanTram = Number(giam_gia);
  const giaCu = giamGiaPhanTram > 0 ? Math.round(don_gia / (1 - giamGiaPhanTram / 100)) : null;
  const donViTinh = don_vi;
  const hinhAnh = hinh_anhs?.[0]?.duong_dan || null;

  const dinhDangTien = (soTien) =>
    soTien?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "";

  const xuLyXemChiTiet = () => {
    try {
      if (token) {
        api.post(
          `/users/luu-lich-su-xem/${ma_san_pham}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.log("Lỗi khi lưu lịch sử xem sản phẩm", ma_san_pham);
    }
    navigate(`/san-pham/${ma_san_pham}`);
  };

  const xuLyThemVaoGio = async () => {
    if (!token) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    try {
      const res = await api.post(
        "/users/them-gio-hang",
        { ma_san_pham, so_luong: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("Đã thêm vào giỏ hàng");
      } else {
        alert(res.data.message || "Thêm thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    }
    window.dispatchEvent(new Event("cart-updated"));
  };

  return (
    <Box>
      <Card
        sx={{
          width: "100%",
          maxWidth: "100%",
          borderRadius: 3,
          overflow: "hidden",
          height: "100%",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
          },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Ảnh sản phẩm */}
        <Box sx={{ textAlign: "center", p: 2 }}>
          <CardMedia
            component="img"
            image={hinhAnh}
            alt={tenSanPham}
            sx={{
              width: "100%",
              height: 180,
              objectFit: "contain",
              borderRadius: 2,
              transition: "transform 0.3s ease",
              "&:hover": { transform: "scale(1.05)" },
              cursor: "pointer",
            }}
            onClick={xuLyXemChiTiet}
          />
        </Box>

        <Divider />

        {/* Thông tin sản phẩm */}
        <CardContent sx={{ p: 2, flex: 1 }}>
          <Typography
            variant="subtitle2"
            fontWeight="600"
            sx={{
              lineHeight: 1.3,
              color: "#333",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
            onClick={xuLyXemChiTiet}
          >
            {tenSanPham}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "baseline" }}>
            <Typography variant="h6" fontWeight="700" color="success.main">
              {dinhDangTien(gia)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              /{donViTinh}
            </Typography>
          </Box>

          {giaCu && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <Typography
                variant="body2"
                sx={{ textDecoration: "line-through", color: "#9DA7BC" }}
              >
                {dinhDangTien(giaCu)}
              </Typography>
              {giamGiaPhanTram > 0 && (
                <Box
                  sx={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#fff",
                    backgroundColor: "rgba(255,1,1,0.7)",
                    borderRadius: "4px",
                    px: 0.5,
                    py: 0.2,
                  }}
                >
                  -{giamGiaPhanTram}%
                </Box>
              )}
            </Box>
          )}
        </CardContent>

        {/* Nút mua ngay */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            sx={{
              textTransform: "uppercase",
              fontWeight: "bold",
              borderColor: "#007E42",
              color: "#007E42",
              backgroundColor: "#F0FFF3",
              "&:hover": {
                backgroundColor: "#e4f5e7",
                borderColor: "#007E42",
              },
            }}
            onClick={xuLyThemVaoGio}
          >
            Mua ngay
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default TheSanPham;
