import { Box, Typography, Button, CardMedia } from "@mui/material";
import { useState } from "react";
import NutLayMa from "../Home/NutLayMa";

export default function PromotionCard({ data }) {
  const [maCode, setMaCode] = useState(data.ma_code);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: 92,
        p: 1,
        borderRadius: 2,
        backgroundImage:
          "url(https://cdnv2.tgdd.vn/bhx/product-fe/cart/home/_next/public/static/images/background-special.png)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Image */}
      <Box>
        <CardMedia
            component="img"
            image={data.hinh_anhs?.[0]?.duong_dan || ""}
            alt={data.ten_khuyen_mai}
            sx={{
                width: 60,
                height: 60,
                objectFit: "contain",
                flexShrink: 0,
                }}
          />
      </Box>

      {/* Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          ml: 2,            // 👈 khoảng cách nội dung với ảnh
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Text */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.3,
            minWidth: 0,
          }}
        >
          <Typography
            fontSize={12}
            fontWeight={700}
            noWrap
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {data.ten_khuyen_mai}
          </Typography>

          <Typography
            fontSize={10}
            color="text.secondary"
            sx={{
              lineHeight: "14px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {data.mo_ta}
          </Typography>

          <Typography fontSize={10} color="text.secondary">
            HSD: {data.ngay_ket_thuc}
          </Typography>
        </Box>

        {/* Button dưới nội dung */}
        <NutLayMa maCode={maCode}/>
      </Box>
    </Box>
  );
}
