import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Container
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules"; // Thêm module điều hướng
import "swiper/css";
import "swiper/css/navigation";
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'; // Icon lửa cho khuyến mãi
import TheKhuyenMai from "./TheKhuyenMai";
import api from "../../../api";

export default function KhuyenMaiSection() {
  const [khuyenMais, setKhuyenMais] = useState([]);

  useEffect(() => {
    fetchKhuyenMais();
  }, []);

  const fetchKhuyenMais = async () => {
    try {
      const response = await api.get("/users/danh-sach-khuyen-mai");
      if (response.data.success) {
        setKhuyenMais(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
    }
  };

return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #c6f3ceff 0%, #FFFFFF 100%)",
        py: { xs: 4, md: 2 },
        borderRadius: "24px",
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box 
                sx={{ 
                  bgcolor: "#FF4D4F", 
                  borderRadius: "8px", 
                  p: 0.5, 
                  display: "flex" 
                }}
              >
                <LocalFireDepartmentIcon sx={{ color: "#fff", fontSize: 20 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 850, color: "#1A4D2E", letterSpacing: "-0.5px" }}>
                DEAL HOT HÔM NAY
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "#666", mt: 0.5, ml: 5 }}>
              Số lượng có hạn, nhanh tay lấy mã ngay!
            </Typography>
          </Box>

          {/* <Button
            variant="contained"
            disableElevation
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              borderRadius: "10px",
              backgroundColor: "#2E7D32",
              px: 3,
              "&:hover": { backgroundColor: "#1B5E20" },
              display: { xs: "none", sm: "block" } // Ẩn trên mobile để header gọn hơn
            }}
          >
            Xem tất cả
          </Button> */}
        </Stack>

        {/* Slider Area */}
        <Box sx={{
          ".swiper": { pb: 5, px: 0.5 },
          ".swiper-pagination-bullet": { width: 8, height: 8, backgroundColor: "#ccc", opacity: 1 },
          ".swiper-pagination-bullet-active": { backgroundColor: "#2E7D32", width: 20, borderRadius: "4px" }
        }}>
          <Swiper
            modules={[Navigation, Pagination]}
            pagination={{ clickable: true }}
            slidesPerView={1.2} // Hiển thị một phần của slide tiếp theo để người dùng biết là trượt được
            spaceBetween={16}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1400: { slidesPerView: 4, spaceBetween: 24 },
            }}
          >
            {khuyenMais.length > 0 ? (
              khuyenMais.map((item) => (
                <SwiperSlide key={item.ma_khuyen_mai}>
                  <TheKhuyenMai data={item} />
                </SwiperSlide>
              ))
            ) : (
              // Skeleton giả lập
              [1, 2, 3, 4].map(i => (
                <SwiperSlide key={i}>
                  <Box sx={{ width: '100%', height: 110, bgcolor: '#eee', borderRadius: 3, animation: 'pulse 1.5s infinite' }} />
                </SwiperSlide>
              ))
            )}
          </Swiper>
        </Box>
      </Container>
    </Box>
  );
}