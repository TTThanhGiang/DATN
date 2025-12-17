import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../../../components/User/SideBar";
import Banner from "../../../components/User/Home/Banner";
import KhuyenMaiSection from "../../../components/User/Khuyến mãi/KhuyenMaiSection";
import SanPhamThinhHanh from "../Products/SanPhamThinhHanh";
import SanPhamPhoBien from "../Products/SanPhamPhoBien";
import SanPhamGoiYNguoiDung from "../Products/SanPhamGoiYNguoiDung";
import { getUser } from "../../../utils/auth";

const SIDEBAR_WIDTH = 300;

function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [user, setUser] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setSidebarOpen(!isMobile);

    // ✅ lấy user khi mount
    setUser(getUser());

    const capNhatUser = () => {
      setUser(getUser());
    };

    const capNhatKhiLogout = () => {
      setUser(null);
    };

    window.addEventListener("user-login", capNhatUser);
    window.addEventListener("user-logout", capNhatKhiLogout);

    return () => {
      window.removeEventListener("user-login", capNhatUser);
      window.removeEventListener("user-logout", capNhatKhiLogout);
    };
  }, [isMobile]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobile && sidebarOpen && (
        <Box
          onClick={() => setSidebarOpen(false)}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.4)",
            zIndex: 900,
          }}
        />
      )}

      {/* SIDEBAR */}
      <Box
        sx={{
          position: "fixed",
          top: isMobile ? 0 : 110,
          left: 0,
          width: SIDEBAR_WIDTH,
          height: isMobile ? "100vh" : "calc(100vh - 110px)",
          bgcolor: "#fff",
          borderRight: "1px solid #e0e0e0",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          zIndex: isMobile ? 900 : 600,
          overflowY: "auto",
        }}
      >
        <Sidebar
          open={sidebarOpen}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </Box>

      {/* MAIN */}
      <Box
       sx={{
          flex: 1,
          ml: !isMobile && sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0,

          width: !isMobile && sidebarOpen
            ? `calc(100% - ${SIDEBAR_WIDTH}px)`
            : "100%",

          transition: "margin-left 0.3s ease, width 0.3s ease",
          p: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <IconButton onClick={() => setSidebarOpen((v) => !v)}>
            <MenuIcon />
          </IconButton>

          {!sidebarOpen && !isMobile && (
            <Typography fontWeight={600}>Danh mục sản phẩm</Typography>
          )}
        </Box>

        <KhuyenMaiSection />
        
        <Banner />

        {user && <SanPhamGoiYNguoiDung />}
        <SanPhamPhoBien />
        <SanPhamThinhHanh />
      </Box>
    </Box>
  );
}

export default HomePage;
