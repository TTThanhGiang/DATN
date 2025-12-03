import React from "react";
import { Card, CardContent, CardMedia, Typography, Button, Box, Divider } from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import api from "../../../api"
import { getUser } from "../../../utils/auth";

const ProductCard = ({ product, onAddToCart }) => {
    const {
    ma_san_pham,
    ten_san_pham,
    don_gia,
    giam_gia,
    don_vi,
    hinh_anhs,
  } = product;

  const navigate = useNavigate();

  // Mapping nội bộ để dùng trong component
  const name = ten_san_pham;
  const price = don_gia;
  const discountPercent = Number(giam_gia);
  const oldPrice = discountPercent > 0 ? Math.round(don_gia / (1 - discountPercent / 100)) : null;
  const unit = don_vi;
  const pricePerUnit = `${don_gia}/${don_vi}`;
  const image = hinh_anhs?.[0]?.duong_dan || null;

  const formatCurrency = (num) =>
    num?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "";

  const handleClick = () => {
    const user = getUser()
    const token = user.token
    try {
    api.post(
      `/users/luu-lich-su-xem/${ma_san_pham}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    }catch(error){
      console.log("Lỗi khi xem chi tiết sản phẩm", ma_san_pham)
    }
    navigate(`/products/${ma_san_pham}`);

  }

  return (
    <div >
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
            image={image}
            alt={name}
            sx={{
              width: "100%",
              height: 180,
              objectFit: "contain",
              borderRadius: 2,
              transition: "transform 0.3s ease",
              "&:hover": { transform: "scale(1.05)" },
              cursor: "pointer",
            }}
            onClick={handleClick}
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
            onClick={handleClick}
          >
            {name}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "baseline"}}>
            <Typography variant="h6" fontWeight="700" color="success.main">
              {formatCurrency(price)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              /{unit}
            </Typography>
          </Box>

          {oldPrice && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <Typography
                variant="body2"
                sx={{ textDecoration: "line-through", color: "#9DA7BC" }}
              >
                {formatCurrency(oldPrice)}
              </Typography>
              {discountPercent > 0 && (
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
                  -{discountPercent}%
                </Box>
              )}
            </Box>
          )}
        </CardContent>

        {/* Nút mua */}
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
            onClick={() => onAddToCart?.(product)}
          >
            Mua ngay
          </Button>
        </Box>
      </Card>
    </div>
  );
};

export default ProductCard;
