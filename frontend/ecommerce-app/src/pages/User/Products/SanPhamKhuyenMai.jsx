import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Box, Container, Grid, Typography, Breadcrumbs, 
  Link, CircularProgress, Stack, Button, 
  Paper,
  Divider
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from "../../../api";
import TheSanPham from "../../../components/User/Product/TheSanPham";

export default function ChiTietKhuyenMai() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sanPhams, setSanPhams] = useState([]);
  const [khuyenMai, setKhuyenMai] = useState(null);

  useEffect(() => {
    const fetchChiTiet = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/chi-tiet-khuyen-mai/${id}`);
        if (res.data.success) {
          setSanPhams(res.data.data.san_phams);
          setKhuyenMai(res.data.data)
        }
        console.log(res.data.data)
      } catch (error) {
        console.error("Lỗi lấy chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChiTiet();
  }, [id]);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
      <CircularProgress color="success" />
    </Box>
  );

  if (!khuyenMai) return <Typography sx={{ p: 5, textAlign: 'center' }}>Không tìm thấy chương trình này.</Typography>;

  return (
    <Box sx={{ bgcolor: "#f0f2f5", minHeight: "100vh", pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 2, pb: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ color: "#555", textTransform: 'none', fontWeight: 600, "&:hover": { backgroundColor: "transparent" }, }}
        >
          Quay lại trang chủ
        </Button>
      </Container>

      <Container maxWidth="lg">
        <Paper 
          elevation={0}
          sx={{ 
            display: "flex", 
            borderRadius: "12px", 
            overflow: "hidden", 
            mb: 4,
            filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.08))",
            position: "relative"
          }}
        >
          {/* Box Trái - Giảm giá */}
          <Box sx={{
            width: { xs: 100, md: 180 },
            bgcolor: "#FF4D4F",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              right: -5,
              top: 0,
              bottom: 0,
              width: 10,
              backgroundImage: "radial-gradient(circle at 5px 10px, transparent 5px, #FF4D4F 5px)",
              backgroundSize: "10px 18px",
              zIndex: 2
            }
          }}>
            <Typography sx={{ fontSize: { xs: 12, md: 16 }, fontWeight: 500 }}>Giảm</Typography>
            <Typography sx={{ fontSize: { xs: 24, md: 40 }, fontWeight: 900, lineHeight: 1 }}>
              {khuyenMai.phan_tram_giam}{khuyenMai.phan_tram_giam <= 100 ? "%" : "₫"}
            </Typography>
            <Box sx={{
              mt: 1.5,
              bgcolor: "rgba(0,0,0,0.15)",
              fontSize: { xs: "8px", md: "11px" },
              px: 1, py: 0.2,
              borderRadius: "4px",
              whiteSpace: "nowrap"
            }}>
              Sử dụng 1 lần
            </Box>
          </Box>
          <Box sx={{ flex: 1, bgcolor: "white", p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#333", mb: 1, fontSize: { xs: 16, md: 24 } }}>
              {khuyenMai.ten_khuyen_mai}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", mb: 2, maxWidth: 600 }}>
              {khuyenMai.mo_ta}
            </Typography>
            
            <Divider sx={{ my: 1, borderStyle: "dashed" }} />
            
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mt: 1 }}>
               <Typography sx={{ fontSize: 13, color: "#d32f2f", fontWeight: 700 }}>
                 Hạn sử dụng: {khuyenMai.ngay_ket_thuc}
               </Typography>
               <Box sx={{ 
                 px: 2, py: 0.5, 
                 bgcolor: "#fdf2f2", 
                 border: "1px dashed #FF4D4F", 
                 borderRadius: 1,
                 color: "#FF4D4F",
                 fontSize: 13,
                 fontWeight: 700
               }}>
                 Mã: {khuyenMai.ma_code}
               </Box>
            </Stack>
          </Box>
        </Paper>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: "#1A4D2E", display: "flex", alignItems: "center", gap: 1 }}>
             DANH SÁCH SẢN PHẨM ÁP DỤNG
             <Box sx={{ bgcolor: "#2E7D32", color: "white", px: 1, borderRadius: 1, fontSize: 14 }}>
               {sanPhams?.length || 0}
             </Box>
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(5, 1fr)",
              },
            }}
          >
            {sanPhams.slice().map((sp) => (
              <TheSanPham 
                key={sp.ma_san_pham} 
                sanPham={sp} 
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}