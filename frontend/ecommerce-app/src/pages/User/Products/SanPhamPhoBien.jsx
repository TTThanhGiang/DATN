import { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Stack, 
  Container 
} from "@mui/material";
import ProductCard from "../../../components/User/Product/TheSanPham";
import api from "../../../api";

export default function SanPhamPhoBien() {
  const [danhSachSanPham, setDanhSachSanPham] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  const GIOI_HAN_MAC_DINH = 10;
  const [soLuongHienThi, setSoLuongHienThi] = useState(GIOI_HAN_MAC_DINH);

  useEffect(() => {
    const taiSanPhamPhoBien = async () => {
      try {
        // Gọi API lấy sản phẩm phổ biến dành cho khách (Guest)
        const phanHoi = await api.get("/goi-y/pho-bien-cho-guest");
        
        // Kiểm tra cấu trúc dữ liệu trả về từ res.data.goi_y
        if (phanHoi.data && phanHoi.data.goi_y) {
          setDanhSachSanPham(phanHoi.data.goi_y);
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm phổ biến:", err);
      } finally {
        setDangTai(false);
      }
    };

    taiSanPhamPhoBien();
  }, []);

  const coTheXemThem = soLuongHienThi < danhSachSanPham.length;

  if (dangTai) {
    return (
      <Stack alignItems="center" py={5}>
        <CircularProgress size={30} />
        <Typography variant="body2" mt={1} color="text.secondary">
          Đang tìm sản phẩm phổ biến...
        </Typography>
      </Stack>
    );
  }

  return (
    <Box component="section" sx={{ py: 3 }}>
      {/* Tiêu đề mục */}
      <Box sx={{ borderBottom: "2px solid", borderColor: "primary.light", mb: 3, width: "fit-content" }}>
        <Typography variant="h5" fontWeight={700} sx={{ pb: 1 }}>
          🔥 Sản phẩm phổ biến
        </Typography>
      </Box>

      {/* Lưới sản phẩm */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",      // 2 cột trên di động
            sm: "repeat(3, 1fr)",      // 3 cột trên tablet
            md: "repeat(4, 1fr)",      // 4 cột trên laptop
            lg: "repeat(5, 1fr)",      // 5 cột trên màn hình lớn
          },
        }}
      >
        {danhSachSanPham.slice(0, soLuongHienThi).map((sp) => (
          <ProductCard 
            key={sp.ma_san_pham} 
            sanPham={{ ...sp, quantity: 1 }} 
            onAddToCart={() => console.log("Thêm vào giỏ:", sp)} 
          />
        ))}
      </Box>

      {/* Điều hướng Xem thêm / Thu gọn */}
      <Stack direction="row" justifyContent="center" mt={4} spacing={2}>
        {coTheXemThem ? (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setSoLuongHienThi(prev => prev + 10)}
            sx={{ borderRadius: 2, px: 4, py: 1, fontWeight: "bold" }}
          >
            Xem thêm {danhSachSanPham.length - soLuongHienThi} sản phẩm
          </Button>
        ) : (
          danhSachSanPham.length > GIOI_HAN_MAC_DINH && (
            <Button 
              variant="outlined" 
              onClick={() => setSoLuongHienThi(GIOI_HAN_MAC_DINH)}
              sx={{ borderRadius: 2, px: 4, py: 1 }}
            >
              Thu gọn
            </Button>
          )
        )}
      </Stack>
    </Box>
  );
}