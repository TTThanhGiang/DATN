import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";
import ProductCard from "../../../components/User/Product/TheSanPham";
import api from "../../../api";

const GIOI_HAN_MAC_DINH = 5;

export default function DanhSachSanPhamXuHuong({ maDanhMuc }) {
  const [dangTai, setDangTai] = useState(false);
  const [tatCaSanPham, setTatCaSanPham] = useState([]);
  const [soLuongHienThi, setSoLuongHienThi] = useState(GIOI_HAN_MAC_DINH);

  useEffect(() => {
    if (!maDanhMuc) return;

    const taiSanPhamXuHuong = async () => {
      try {
        setDangTai(true);

        const phanHoi = await api.get(
          `/goi-y/top-san-pham-theo-danh-muc/${maDanhMuc}`
        );

        // 🔒 Đảm bảo luôn là mảng
        const danhSach =
          Array.isArray(phanHoi.data?.goi_y)
            ? phanHoi.data.goi_y
            : [];

        setTatCaSanPham(danhSach);
        setSoLuongHienThi(GIOI_HAN_MAC_DINH);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm xu hướng:", err);
        setTatCaSanPham([]);
      } finally {
        setDangTai(false);
      }
    };

    taiSanPhamXuHuong();
  }, [maDanhMuc]);

  const danhSachHienThi = tatCaSanPham.slice(0, soLuongHienThi);
  const coTheXemThem = soLuongHienThi < tatCaSanPham.length;

  /* ================== LOADING ================== */
  if (dangTai) {
    return (
      <Stack alignItems="center" py={5}>
        <CircularProgress />
        <Typography mt={2}>Đang tải sản phẩm xu hướng...</Typography>
      </Stack>
    );
  }

  /* ================== EMPTY ================== */
  if (!tatCaSanPham.length) {
    return (
      <Stack alignItems="center" py={5}>
        <Typography color="text.secondary">
          Chưa có sản phẩm gợi ý cho danh mục này
        </Typography>
      </Stack>
    );
  }

  /* ================== UI ================== */
  return (
    <Box component="section" sx={{ py: 4 }}>
      {/* DANH SÁCH SẢN PHẨM */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)", // mobile: 2 sp / hàng
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(5, 1fr)",
          },
        }}
      >
        {danhSachHienThi.map((sp) => (
          <ProductCard
            key={sp.ma_san_pham}
            sanPham={{ ...sp, quantity: 1 }}
            onAddToCart={() => console.log("Thêm vào giỏ:", sp)}
          />
        ))}
      </Box>

      {/* NÚT XEM THÊM / THU GỌN */}
      <Stack direction="row" justifyContent="center" mt={5}>
        {coTheXemThem ? (
          <Button
            variant="contained"
            onClick={() =>
              setSoLuongHienThi((prev) => prev + GIOI_HAN_MAC_DINH)
            }
            sx={{ borderRadius: 2, px: 4, py: 1, fontWeight: 600 }}
          >
            Xem thêm {tatCaSanPham.length - soLuongHienThi} sản phẩm
          </Button>
        ) : (
          tatCaSanPham.length > GIOI_HAN_MAC_DINH && (
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
