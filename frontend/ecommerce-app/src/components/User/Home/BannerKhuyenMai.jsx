import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function BannerKhuyenMai({ danhSachKM, maKMDangChon }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4, borderRadius: 3, overflow: "hidden", boxShadow: 2 }}>
      <Swiper
        modules={[Pagination, Autoplay, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        initialSlide={danhSachKM.findIndex(km => km.ma_khuyen_mai === parseInt(maKMDangChon))}
        onSlideChange={(swiper) => {
          const newKM = danhSachKM[swiper.activeIndex];
          if (newKM) {
            navigate(`/khuyen-mai/${newKM.ma_khuyen_mai}`);
          }
        }}
        style={{ cursor: "grab" }}
      >
        {danhSachKM.map((km) => (
          <SwiperSlide key={km.ma_khuyen_mai}>
            <Box
              sx={{
                height: { xs: 180, md: 300 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                p: 5,
                color: "#fff",
                background: km.hinh_anh 
                  ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${km.hinh_anh})` 
                  : "linear-gradient(90deg, #FF416C 0%, #FF4B2B 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", md: "2.5rem" } }}>
                {km.ten_khuyen_mai}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1, opacity: 0.9 }}>
                {km.mo_ta}
              </Typography>
              <Stack direction="row" spacing={2} mt={2}>
                <Box sx={{ bgcolor: "rgba(255,255,255,0.2)", px: 2, py: 0.5, borderRadius: 1, backdropFilter: "blur(5px)" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Giảm ngay {km.giam_gia}%
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}