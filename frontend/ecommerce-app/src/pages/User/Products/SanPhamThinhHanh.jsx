import { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  Typography, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Stack 
} from "@mui/material";
import ProductCard from "../../../components/User/Product/TheSanPham";
import api from "../../../api";

export default function DanhSachSanPhamXuHuong() {
  const [tabHienTai, setTabHienTai] = useState("tat_ca");
  const [dangTai, setDangTai] = useState(true);

  const [danhMuc, setDanhMuc] = useState({});
  const [tatCaSanPham, setTatCaSanPham] = useState([]);

  const GIOI_HAN_MAC_DINH = 10;
  const [soLuongHienThi, setSoLuongHienThi] = useState(GIOI_HAN_MAC_DINH);

  useEffect(() => {
    const taiSanPhamXuHuong = async () => {
      try {
        const phanHoi = await api.get("/goi-y/trending/danh-muc");
        const duLieu = phanHoi.data;

        setDanhMuc(duLieu);

        // Hợp nhất tất cả sản phẩm từ các danh mục vào một mảng duy nhất
        const mangHopNhat = Object.values(duLieu).flatMap((dm) => dm.san_phams);
        setTatCaSanPham(mangHopNhat);
        console.log(duLieu)
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm xu hướng:", err);
      } finally {
        setDangTai(false);
      }
    };

    taiSanPhamXuHuong();
  }, []);

  // Xử lý khi chuyển Tab
  const thayDoiTab = (event, giaTriMoi) => {
    setTabHienTai(giaTriMoi);
    setSoLuongHienThi(GIOI_HAN_MAC_DINH);
  };

  // Lọc danh sách sản phẩm dựa trên Tab
  const danhSachLoc =
    tabHienTai === "tat_ca"
      ? tatCaSanPham
      : danhMuc[tabHienTai]?.san_phams || [];

  const coTheXemThem = soLuongHienThi < danhSachLoc.length;

  if (dangTai) {
    return (
      <Stack alignItems="center" py={5}>
        <CircularProgress />
        <Typography mt={2}>Đang tải sản phẩm xu hướng...</Typography>
      </Stack>
    );
  }

  return (
    <Box component="section" sx={{ py: 4 }}>
      {/* Tiêu đề và Tabs điều hướng */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          borderBottom: 1, 
          borderColor: "divider",
          mb: 4,
          pb: 1
        }}
      >
        <Typography variant="h5" fontWeight={700} color="primary.main">
          Xu hướng thị trường
        </Typography>

        <Tabs 
          value={tabHienTai} 
          onChange={thayDoiTab}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            "& .MuiTab-root": { fontWeight: 600, textTransform: "none", fontSize: "1rem" }
          }}
        >
          <Tab label="Tất cả" value="tat_ca" />
          {Object.values(danhMuc).map((dm) => (
            <Tab 
              key={dm.ma_danh_muc} 
              label={dm.ten_danh_muc} 
              value={String(dm.ma_danh_muc)} 
            />
          ))}
        </Tabs>
      </Box>

      {/* Lưới sản phẩm (Grid) */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",      // 2 cột trên điện thoại
            sm: "repeat(3, 1fr)",      // 3 cột trên tablet
            md: "repeat(4, 1fr)",      // 4 cột trên laptop
            lg: "repeat(5, 1fr)",      // 5 cột trên màn hình lớn
          },
        }}
      >
        {danhSachLoc.slice(0, soLuongHienThi).map((sp) => (
          <ProductCard 
            key={sp.ma_san_pham} 
            sanPham={{ ...sp, quantity: 1 }} 
            onAddToCart={() => console.log("Thêm vào giỏ:", sp)} 
          />
        ))}
      </Box>

      {/* Khu vực nút hành động */}
      <Stack direction="row" justifyContent="center" mt={5} spacing={2}>
        {coTheXemThem ? (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setSoLuongHienThi(prev => prev + 10)}
            sx={{ borderRadius: 2, px: 4, py: 1, fontWeight: "bold" }}
          >
            Xem thêm {danhSachLoc.length - soLuongHienThi} sản phẩm
          </Button>
        ) : (
          danhSachLoc.length > GIOI_HAN_MAC_DINH && (
            <Button 
              variant="outlined" 
              onClick={() => setSoLuongHienThi(GIOI_HAN_MAC_DINH)}
              sx={{ borderRadius: 2, px: 4, py: 1}}
            >
              Thu gọn
            </Button>
          )
        )}
      </Stack>
    </Box>
  );
}