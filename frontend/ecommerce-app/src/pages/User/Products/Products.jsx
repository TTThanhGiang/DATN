import { useState, useEffect } from "react";
import { Typography, Box, IconButton, Paper } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useParams, useNavigate } from "react-router-dom";

import Sidebar from "../../../components/User/SideBar";
import ProductCard from "../../../components/User/Product/ProductCart";
import SubCategorySwiper from "../../../components/User/Product/SubCategorySwiper";
import api from "../../../api";
import {getUser, getRole, getToken, getUserId} from "../../../utils/auth";


export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { categoryId, subCategoryId } = useParams();
  const navigate = useNavigate();
  const sidebarWidth = sidebarOpen ? 300 : 0;

  const token = getToken()

  // --- Fetch tất cả sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/users/san-pham/");
        setProducts(res.data || []);
      } catch (error) {
        console.error("Lấy sản phẩm thất bại:", error);
      }
    };
    fetchProducts();
  }, []);

  // --- Fetch danh mục cha + con, cập nhật subCategories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/users/danh-muc");
        if (res.data.success) {
          const categories = res.data.data;
          const cat = categories.find(c => c.ma_danh_muc === Number(categoryId));
          setCurrentCategory(cat || null);
          setSubCategories(cat?.danh_muc_con || []);
          setSelectedSubCategory(subCategoryId ? Number(subCategoryId) : null);
        }
      } catch (error) {
        console.error("Lấy danh mục thất bại:", error);
      }
    };
    fetchCategories();
  }, [categoryId, subCategoryId]);

  // --- Filter sản phẩm theo category / subcategory
  useEffect(() => {
    if (!categoryId || !products.length) return;

    const catId = Number(categoryId);
    const subCatId = subCategoryId ? Number(subCategoryId) : null;

    const filtered = products.filter(p => {
      const prodCatId = Number(p.ma_danh_muc);
      return subCatId ? prodCatId === subCatId : prodCatId === catId;
    });

    setFilteredProducts(filtered);
  }, [products, categoryId, subCategoryId]);

  // --- Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async (product) => {
    try {
      if (!token) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
        navigate("/login");
        return;
      } 
      const payload = {
        ma_san_pham: Number(product.ma_san_pham),
        so_luong: 1,
      };
      const res = await api.post("/users/them-gio-hang", payload, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });
      if (res.data.success) {
        alert("Đã thêm sản phẩm vào giỏ hàng!");
      } else {
        alert("Thêm sản phẩm vào giỏ hàng thất bại: " + res.data.message);
      }
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error);
      alert("Thêm sản phẩm vào giỏ hàng thất bại");
    }
  };

  // --- Chọn subcategory từ swiper
  const handleSelectSubCategory = (subCat) => {
    const subCatId = subCat.ma_danh_muc;
    setSelectedSubCategory(subCatId);
    navigate(`/categories/${categoryId}/${subCatId}`);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <Box
        sx={{
          width: 300,
          position: "fixed",
          top: 98,
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
        <Sidebar open={true} selectedCategory={currentCategory?.ten_danh_muc} />
      </Box>

      {/* MAIN CONTENT */}
      <Box
        sx={{
          flex: 1,
          ml: `${sidebarWidth}px`,
          transition: "margin-left 0.3s ease",
          p: 3,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f8f9fa",
        }}
      >
        {/* HEADER */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold" ml={1}>
            Danh mục: {currentCategory?.ten_danh_muc || "..."}
          </Typography>
        </Box>
        {/* SUBCATEGORY SWIPER */}
        {subCategories.length > 0 && (
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              mb: 3,
              bgcolor: "white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              width: "100%",
              maxWidth: 1075, 
            }}
          >
            <SubCategorySwiper
              subCategories={subCategories}
              selectedSubCategory={selectedSubCategory}
              onSelect={handleSelectSubCategory}
            />
          </Paper>
        )}
        {/* PRODUCT GRID */}
        {filteredProducts.length === 0 ? (
          <Typography color="text.secondary">
            Không có sản phẩm nào trong danh mục này.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: sidebarOpen
                ? "repeat(auto-fill, minmax(220px, 1fr))"
                : "repeat(auto-fill, minmax(200px, 1fr))",
            }}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.ma_san_pham}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
            
          </Box>
        )}
        
      </Box>
    </Box>
    
  );
}
