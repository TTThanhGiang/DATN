// ĐÃ CHUYỂN SANG MUI – GIỮ NGUYÊN UI / BỐ CỤC / MÀU SẮC
// Không dùng lucide-react

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  IconButton,
  Paper,
  Stack,
  Chip,
  Divider,
  Avatar,
  Rating,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  ShareOutlined,
  ChevronLeft,
  ChevronRight,
  ShoppingCartOutlined,
  AccessTime,
  Phone,
  CheckCircle
} from "@mui/icons-material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from "../../../api";
import SanPhamLienQuan from "./SanPhamLienQuan";
import { getToken } from "../../../utils/auth";

export default function ChiTietSanPham() {
  const [sanPham, setSanPham] = useState(null);
  const {ma_san_pham } = useParams();
  const [tabHienTai, setTabHienTai] = useState(0); 
  const [danhGia, setDanhGia] = useState([]); 
  const [dangTai, setDangTai] = useState(true);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigate = useNavigate();
  const token = getToken();

  const taiDuLieu = async () => { 
    try { 
      setDangTai(true); 
      const [resChiTiet, resDanhGia] = await Promise.all([ 
        api.get(`/users/chi-tiet-san-pham/${ma_san_pham}`), 
        api.get(`/users/danh-gia/san-pham/${ma_san_pham}`) 
      ]); 
      if (resChiTiet.data.success) 
        setSanPham(resChiTiet.data.data); 
      if (resDanhGia.status === 200) 
        setDanhGia(resDanhGia.data.data); 
      } catch (error) { 
        console.error("Lỗi tải dữ liệu:", error); 
      } 
      finally { 
        setDangTai(false); 
      } 
  }; 

  const handleTabChange = (_, newValue) => {
    setTabHienTai(newValue);
  };

  useEffect(() => { 
    taiDuLieu(); 
  }, [ma_san_pham]);

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

  const dinhDangTien = (so) => new Intl.NumberFormat("vi-VN").format(so) + " đ"; 
  const tinhTrungBinhSao = (ds) => { 
    if (!ds || ds.length === 0) 
      return 0; 
    const tong = ds.reduce((acc, r) => acc + Number(r.sao || 0), 0); 
    return (tong / ds.length).toFixed(1); 
  }; 
  
  const ngayThang = (chuoiIso) => { 
    if (!chuoiIso) 
      return "N/A"; 
    return new Date(chuoiIso).toLocaleDateString("vi-VN"); 
  };
    
  if (!sanPham) 
    return ( 
      <Box sx={{ py: 15, textAlign: "center" }}> 
        <Typography variant="h5" color="text.secondary"> Không tìm thấy sản phẩm. </Typography> 
      </Box> ); 
    
  const diemTrungBinh = tinhTrungBinhSao(danhGia);

  return (
    <Box  bgcolor="#fff" minHeight="100vh">
      {/* Header */}
      <Container maxWidth="lg" sx={{ pt: 2, pb: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ color: "#555", textTransform: 'none', fontWeight: 600, "&:hover": { backgroundColor: "transparent" }, }}
        >
          {sanPham.ten_danh_muc}
        </Button>
      </Container>
      <Container maxWidth="lg" sx={{ mt: 2, mb: 6 }}>
        <Box
          width="100%"
          display="flex"
          flexWrap="wrap"
          gap={2}
        >
          {/* LEFT – IMAGE (6/12) */}
          <Box
            sx={{
              width: { xs: "100%", lg: "60%" }, // ~6/12
            }}
          >
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Box
                position="relative"
                height={380}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <img  
                  src={sanPham.hinh_anhs[currentImageIndex].duong_dan}
                  alt={sanPham.ten_san_pham}
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain"
                  }}
                />

                <IconButton
                  onClick={() =>
                    setCurrentImageIndex(
                      (i) => (i - 1 + sanPham.hinh_anhs.length) % sanPham.hinh_anhs.length
                    )
                  }
                  sx={{
                    position: "absolute",
                    left: 12,
                    bgcolor: "rgba(0,0,0,.4)",
                    color: "#fff"
                  }}
                >
                  <ChevronLeft />
                </IconButton>

                <IconButton
                  onClick={() =>
                    setCurrentImageIndex((i) => (i + 1) % sanPham.hinh_anhs.length)
                  }
                  sx={{
                    position: "absolute",
                    right: 12,
                    bgcolor: "rgba(0,0,0,.4)",
                    color: "#fff"
                  }}
                >
                  <ChevronRight />
                </IconButton>

                <Box
                  position="absolute"
                  bottom={16}
                  right={16}
                  bgcolor="rgba(0,0,0,.6)"
                  px={1.5}
                  py={0.5}
                  borderRadius={1}
                >
                  <Typography fontSize={12} color="#fff">
                    {currentImageIndex + 1}/{sanPham.hinh_anhs.length}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* RIGHT – INFO (4/12) */}
          <Box
            sx={{
              width: { xs: "100%", lg: "38%" }, // ~4/12 (chừa gap)
            }}
          >
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                position: "sticky",
                top: 16
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="start">
                  <Typography fontSize={20} fontWeight={700}>
                    {sanPham.ten_san_pham} ({sanPham.don_vi})
                  </Typography>
                  <Button startIcon={<ShareOutlined />} size="small">
                    Chia sẻ
                  </Button>
                </Stack>

                <Box>
                  <Box sx={{ display: "flex", alignItems: "baseline" }}>
                    <Typography variant="h5" fontWeight="700" color="success.main">
                      {dinhDangTien(
                        sanPham.don_gia - (sanPham.don_gia * (sanPham.giam_gia / 100))
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      /{sanPham.don_vi}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      fontSize={14}
                      sx={{ textDecoration: "line-through" }}
                      color="text.secondary"
                    >
                      {dinhDangTien(sanPham.don_gia)}
                    </Typography>
                    <Chip label={`-${sanPham.giam_gia}%`} color="error" size="small" />
                  </Stack>
                </Box>

                <Button
                  fullWidth
                  size="large"
                  startIcon={<ShoppingCartOutlined />}
                  sx={{
                    py: 1.5,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#fff",
                    background: "linear-gradient(90deg,#22c55e,#16a34a)",
                    "&:hover": {
                      background: "linear-gradient(90deg,#16a34a,#15803d)"
                    }
                  }}
                  onClick={() => xuLyThemVaoGio()}
                >
                  MUA
                </Button>

                <Divider />

                <Stack direction="row" justifyContent="center" spacing={1} alignItems="center">
                  <CheckCircle color="success" />
                  <Typography fontWeight={700}>KHÔNG HÀI LÒNG, 1 ĐỔI 2</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </Box>

        {/* MÔ TẢ & ĐÁNH GIÁ */}
        <Paper sx={{ mt: 3, borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabHienTai} onChange={handleTabChange} variant="fullWidth" centered>
              <Tab label="Mô tả" />
              <Tab label="Đánh giá"/>
            </Tabs>
          </Box>

          <Box p={3}>
            {tabHienTai === 0 && (
              <Typography fontSize={14} lineHeight={1.8} color="text.secondary">
                {sanPham.mo_ta}
              </Typography>
            )}

            {tabHienTai === 1 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 4,
                  flexDirection: { xs: "column", md: "row" }  

                }}
              >
                {/* LEFT – ĐIỂM TRUNG BÌNH */}
                <Box
                  sx={{
                    flex: { md: "0 0 35%" },
                    textAlign: "center",
                    p: 4,
                    bgcolor: "#f1f8e9",
                    borderRadius: 5,
                    alignSelf: "flex-start" 
                  }}
                >
                  <Typography
                    fontSize={40}
                    fontWeight={800}
                    color="#2e7d32"
                    lineHeight={1}
                  >
                    {diemTrungBinh}
                  </Typography>

                  <Rating
                    value={Number(diemTrungBinh)}
                    readOnly
                    precision={0.5}
                    size="medium"
                    sx={{ my: 1 }}
                  />

                  <Typography fontSize={13} color="text.secondary">
                    Trung bình dựa trên trải nghiệm thật
                  </Typography>
                </Box>

                {/* RIGHT – DANH SÁCH ĐÁNH GIÁ */}
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={3}>
                    {danhGia.length === 0 ? (
                      <Typography
                        color="text.secondary"
                        fontStyle="italic"
                        fontSize={14}
                      >
                        Chưa có đánh giá nào cho mặt hàng này.
                      </Typography>
                    ) : (
                      danhGia.map((r, i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 2,
                            borderBottom: "1px solid #f0f0f0"
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 1
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: "#81c784",
                                fontWeight: 700,
                                width: 40,
                                height: 40
                              }}
                            >
                              {r.ho_ten?.[0] || "K"}
                            </Avatar>

                            <Box>
                              <Typography fontWeight={600} fontSize={14}>
                                {r.ho_ten || "Khách hàng"}
                              </Typography>
                              <Rating value={r.sao} readOnly size="small" />
                              {r.binh_luan && (
                                <Typography fontSize={14} mb={0.5}>
                                  {r.binh_luan}
                                </Typography>
                              )}
                            </Box>

                            <Typography
                              fontSize={12}
                              sx={{ ml: "auto", color: "text.secondary" }}
                            >
                              {r.ngay_danh_gia
                                ? new Date(r.ngay_danh_gia).toLocaleDateString("vi-VN")
                                : ""}
                            </Typography>
                          </Box>

                        </Box>
                      ))
                    )}
                  </Stack>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
        {/* SẢN PHẨM LIÊN QUAN */}
        <Paper sx={{ mt: 3, p: 2, borderRadius: 2 }}>
          <Typography fontSize={18} fontWeight={700} mb={2}>
            Sản phẩm liên quan
          </Typography>
            <SanPhamLienQuan maDanhMuc={sanPham.ma_danh_muc}/>
        </Paper>

      </Container>

      {/* Footer */}
      <Box bgcolor="#15803d" color="#fff" py={2}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Typography fontSize={13}>Bán hàng 7:30 - 21:00</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Phone fontSize="small" />
                <Typography fontWeight={700}>1900 1908</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography fontWeight={700} color="#fde047">Cam kết:</Typography>
              <Typography fontSize={13}>15.000 sản phẩm • Giao 2h</Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
