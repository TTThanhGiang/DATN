import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import PromotionCard from "./PromotionCard";
import api from "../../../api";

export default function KhuyenMaiSection() {
  const [khuyenMais, setKhuyenMais] = useState([]);
  
  useEffect(() => {
    fetchKhuyenMais();
  },[]);
  const fetchKhuyenMais = async () => {
    try {
      const response = await api.get("/users/danh-sach-khuyen-mai");
      if (response.data.success){
        setKhuyenMais(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
    }
  }
  return (
    <Box
      sx={{
        backgroundImage:
          "url(https://cdnv2.tgdd.vn/bhx/product-fe/cart/home/_next/public/static/images/bg-special-desktop.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: 2,
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Chip
          label="ƯU ĐÃI ĐANG DIỄN RA"
          sx={{
            fontWeight: "bold",
            background:
              "linear-gradient(90deg, #F9EFA2, #FFEA2C, #FFF8B4)",
            border: "1px solid #30CF20",
          }}
        />

        <Button
          size="small"
          sx={{
            textTransform: "none",
            color: "#0095FF",
            backgroundColor: "#fff",
            borderRadius: 2,
          }}
        >
          Xem tất cả →
        </Button>
      </Stack>

      {/* Slider */}
      <Swiper
        slidesPerView="auto"
        spaceBetween={8}
      >
        {khuyenMais.map((item) => (
          <SwiperSlide key={item.ma_khuyen_mai} style={{ width: 210 }}>
            <PromotionCard data={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
