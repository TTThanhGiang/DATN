import { useState } from "react";
import Banner from '../../../components/User/Home/Banner';
import CategorySection from '../../../components/User/Home/CategorySection';
import ProductList from '../Products/ProductList';
import { Box, IconButton, Typography } from "@mui/material";
import Sidebar from "../../../components/User/SideBar";
import MenuIcon from "@mui/icons-material/Menu";

function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const sidebarWidth = sidebarOpen ? 300 : 0;

  return (
    <Box sx={{ display: "flex", height: "100vh"}}>
      {/* Sidebar cố định */}
      <Box
        sx={{
          width: 300,
          position: "fixed",
          top: 105,
          left: 0,
          bottom: 0,
          borderRight: "1px solid #ddd",
          bgcolor: "#fff",
          overflowY: "auto",
          transition: "transform 0.3s ease, opacity 0.3s ease",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          opacity: sidebarOpen ? 1 : 0,
          zIndex: 1000,
          p: 1,
        }}
      >
        <Sidebar
          open={sidebarOpen}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
      </Box>

      {/* Nội dung chính */}
      <Box
        sx={{
          flex: 1,
          ml: `${sidebarWidth}px`,
          height: "100vh",
          overflowY: "auto",
          transition: "margin-left 0.4s ease",
          p: 2,
          flexDirection: "column",
        }}
      >
        {/* Nút toggle Sidebar */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
            <MenuIcon />
          </IconButton>
          {!sidebarOpen && (
            <Typography variant="subtitle1" fontWeight="bold">
              Danh mục sản phẩm
            </Typography>
          )}
        </Box>

        {/* Nội dung trang */}
        <Banner />
        <CategorySection />
        <ProductList sidebarOpen={sidebarOpen} />
      </Box>
    </Box>
  );
}

export default HomePage;
