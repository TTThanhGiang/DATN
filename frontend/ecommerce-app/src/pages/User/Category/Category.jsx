import { useState } from "react";
import Banner from '../../../components/User/Home/Banner';
import CategorySection from './Category';
import ProductList from '../Products/ProductList';
import { Box, IconButton, Typography } from "@mui/material";
import Sidebar from "../../../components/User/SideBar";

export default function Category() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarWidth = sidebarOpen ? 240 : 0;
    return (
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
          <Box>
            <Banner/>
            <CategorySection/>
            <ProductList/>
          </Box>
        </Box>
    );
}