import { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Stack, 
  Skeleton 
} from "@mui/material";
import ProductCard from "../../../components/User/Product/TheSanPham";
import api from "../../../api";
import { getUser, getToken } from "../../../utils/auth";

export default function SanPhamGoiYNguoiDung() {
  const [danhSachGoiY, setDanhSachGoiY] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  const GIOI_HAN_MAC_DINH = 10;
  const [soLuongHienThi, setSoLuongHienThi] = useState(GIOI_HAN_MAC_DINH);

  useEffect(() => {
    const taiSanPhamGoiY = async () => {
      const nguoiDung = getUser();
      const token = getToken(); // Ưu tiên lấy token từ hàm helper riêng nếu có

      if (!nguoiDung) return;

      try {
        // Gọi API gợi ý tổng hợp dựa trên ID người dùng
        const phanHoi = await api.get(`/goi-y/tong-hop/${nguoiDung.ma_nguoi_dung}?top_n=20`, {
          headers: { 
            Authorization: `Bearer ${token}`,
          }
        });
        
        if (phanHoi.data && phanHoi.data.goi_y) {
          setDanhSachGoiY(phanHoi.data.goi_y);
        }
      } catch (err) {
        console.error("Lỗi khi tải gợi ý cá nhân hóa:", err);
      } finally {
        setDangTai(false);
      }
    };

    taiSanPhamGoiY();
  }, []);

  const coTheXemThem = soLuongHienThi < danhSachGoiY.length;

  if (dangTai) {
    return (
      <Box sx={{ py: 3 }}>
        <Skeleton variant="text" width={250} height={40} sx={{ mb: 2 }} />
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(5, 1fr)",
            },
          }}
        >
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          ))}
        </Box>
      </Box>
    );
  }

  // Nếu không có gợi ý nào, không render component để tránh khoảng trắng thừa
  if (danhSachGoiY.length === 0) return null;

  return (
    <Box component="section" sx={{ py: 3 }}>
      {/* Tiêu đề được cá nhân hóa */}
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <Typography variant="h5" fontWeight={700} color="secondary.main">
          ✨ Dành riêng cho bạn
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          (Dựa trên sở thích của bạn)
        </Typography>
      </Stack>

      {/* Lưới sản phẩm */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(5, 1fr)",
          },
        }}
      >
        {danhSachGoiY.slice(0, soLuongHienThi).map((sp) => (
          <ProductCard 
            key={sp.ma_san_pham} 
            sanPham={{ ...sp, quantity: 1 }} 
            onAddToCart={() => console.log("Thêm vào giỏ từ mục Gợi ý:", sp)} 
          />
        ))}
      </Box>

      {/* Nút Xem thêm */}
      {coTheXemThem && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={() => setSoLuongHienThi(prev => prev + 10)}
            sx={{ borderRadius: 8, px: 5, borderWidth: 2, fontWeight: 'bold' }}
          >
            Khám phá thêm
          </Button>
        </Box>
      )}
    </Box>
  );
}