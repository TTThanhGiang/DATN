import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/SideBar";
import HomePage from "./pages/Home/Home";
import ProductDetail from "./pages/Products/ProductDetail";
import { Label, LabelOutlined } from "@mui/icons-material";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarWidth = sidebarOpen ? 240 : 0;

  return (
    <Router>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header sticky */}
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1200,
            bgcolor: "white",
            borderBottom: "1px solid #ddd",
          }}
        >
          <Header />
        </Box>

        {/* Layout chính: Sidebar + Content */}
        <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
          {/* Sidebar cố định chiều cao, scroll riêng */}
          <Box
            sx={{
              width: sidebarWidth,
              transition: "width 0.3s",
              borderRight: "1px solid #ddd",
              overflowY: "auto",
            }}
          >
            <Sidebar onSelectCategory={(cat) => console.log("Chọn:", cat)} />
          </Box>

          {/* Nội dung chính */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              transition: "margin-left 0.3s",
            }}
          >
            {/* Nút toggle Sidebar */}
            <Box sx={{
                display: "flex", 
                alignItems: "center",}}>
              <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
                <MenuIcon />
              </IconButton>
              {!sidebarOpen &&(
                <Typography variant="subtitle1" fontWeight="bold" >
                Danh mục sản phẩm
              </Typography>
              )}
            </Box>

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
          </Box>
        </Box>

      </Box>
    </Router>
  );
}

export default App;
