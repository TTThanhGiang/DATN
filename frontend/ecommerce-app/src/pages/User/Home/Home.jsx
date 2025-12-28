import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Stack,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../../../components/User/Home/SideBar";
import Banner from "../../../components/User/Home/Banner";
import KhuyenMaiSection from "../../../components/User/Khuyến mãi/KhuyenMaiSection";
import SanPhamThinhHanh from "../Products/SanPhamThinhHanh";
import SanPhamPhoBien from "../Products/SanPhamPhoBien";
import SanPhamGoiYNguoiDung from "../Products/SanPhamGoiYNguoiDung";
import { getUser } from "../../../utils/auth";

const CHIEU_RONG_SIDEBAR = 300;

function TrangChu() {
  const [moSidebar, setMoSidebar] = useState(true);
  const [danhMucDaChon, setDanhMucDaChon] = useState(null);
  const [nguoiDung, setNguoiDung] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setMoSidebar(!isMobile);
    setNguoiDung(getUser());
    const capNhatNguoiDung = () => setNguoiDung(getUser());
    const xoaNguoiDung = () => setNguoiDung(null);
    window.addEventListener("user-login", capNhatNguoiDung);
    window.addEventListener("user-logout", xoaNguoiDung);
    return () => {
      window.removeEventListener("user-login", capNhatNguoiDung);
      window.removeEventListener("user-logout", xoaNguoiDung);
    };
  }, [isMobile]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      
      {/* LỚP PHỦ SIDEBAR CHO ĐIỆN THOẠI */}
      {isMobile && moSidebar && (
        <Box
          onClick={() => setMoSidebar(false)}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: 900,
          }}
        />
      )}

      {/* THANH DANH MỤC (SIDEBAR) */}
      <Box
        sx={{
          position: "fixed",
          top: isMobile ? 0 : 110,
          left: 0,
          width: CHIEU_RONG_SIDEBAR,
          height: isMobile ? "100vh" : "calc(100vh - 110px)",
          bgcolor: "#fff",
          borderRight: "1px solid #e0e0e0",
          transform: moSidebar ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: isMobile ? 1000 : 600,
          overflowY: "auto",
        }}
      >
        <Sidebar
          open={moSidebar}
          selectedCategory={danhMucDaChon}
          onSelectCategory={setDanhMucDaChon}
        />
      </Box>

      {/* NỘI DUNG CHÍNH */}
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: !isMobile && moSidebar ? `${CHIEU_RONG_SIDEBAR}px` : 0,
          width: !isMobile && moSidebar 
            ? `calc(100% - ${CHIEU_RONG_SIDEBAR}px)` 
            : "100%",
          transition: "margin-left 0.3s ease, width 0.3s ease",
          p: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* THANH CÔNG CỤ ĐIỀU KHIỂN SIDEBAR */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <IconButton 
            onClick={() => setMoSidebar((prev) => !prev)}
            sx={{ bgcolor: "#fff", boxShadow: 1, "&:hover": { bgcolor: "#eee" } }}
          >
            <MenuIcon />
          </IconButton>
          {!moSidebar && !isMobile && (
            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
              Mở danh mục sản phẩm
            </Typography>
          )}
        </Stack>

        <Container maxWidth="xl" disableGutters>
          <Stack spacing={4}>
            <KhuyenMaiSection />
            
            <Banner />

            {nguoiDung && (
              <SanPhamGoiYNguoiDung />
            )}

            <SanPhamPhoBien />

            <SanPhamThinhHanh />

          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

export default TrangChu;