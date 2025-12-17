import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  IconButton,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useParams, useNavigate } from "react-router-dom";

import Sidebar from "../../../components/User/SideBar";
import ProductCard from "../../../components/User/Product/ProductCart";
import SubCategorySwiper from "../../../components/User/Product/SubCategorySwiper";
import api from "../../../api";
import { getToken } from "../../../utils/auth";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { id, subId } = useParams();
  const navigate = useNavigate();
  const token = getToken();

  /* ===================== RESPONSIVE ===================== */
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const SIDEBAR_WIDTH = 300;

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  /* ===================== FETCH PRODUCTS ===================== */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/users/san-pham/");
        setProducts(res.data || []);
      } catch (err) {
        console.error("Lấy sản phẩm thất bại:", err);
      }
    };
    fetchProducts();
  }, []);

  /* ===================== FETCH CATEGORIES ===================== */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/users/danh-muc");
        if (res.data.success) {
          const categories = res.data.data;
          const cat = categories.find(
            (c) => c.ma_danh_muc === Number(id)
          );
          setCurrentCategory(cat || null);
          setSubCategories(cat?.danh_muc_con || []);
          setSelectedSubCategory(subId ? Number(subId) : null);
        }
      } catch (err) {
        console.error("Lấy danh mục thất bại:", err);
      }
    };
    fetchCategories();
  }, [id, subId]);

  /* ===================== FILTER PRODUCTS ===================== */
  useEffect(() => {
    if (!id || !products.length) return;

    const catId = Number(id);
    const subCatId = subId ? Number(subId) : null;

    const result = products.filter((p) =>
      subCatId
        ? Number(p.ma_danh_muc) === subCatId
        : Number(p.ma_danh_muc) === catId
    );

    setFilteredProducts(result);
  }, [products, id, subId]);

  /* ===================== ADD TO CART ===================== */
  const handleAddToCart = async (product) => {
    if (!token) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/");
      return;
    }

    try {
      const res = await api.post(
        "/users/them-gio-hang",
        {
          ma_san_pham: product.ma_san_pham,
          so_luong: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        alert("Đã thêm vào giỏ hàng");
      } else {
        alert(res.data.message || "Thêm thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    }
  };

  /* ===================== SELECT SUB CATEGORY ===================== */
  const handleSelectSubCategory = (subCat) => {
    navigate(`/danh-muc/${id}/${subCat.ma_danh_muc}`);
  };

  /* ===================== RENDER ===================== */
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* ===== OVERLAY MOBILE ===== */}
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

      {/* ===== SIDEBAR ===== */}
      <Box
        sx={{
          position: "fixed",
          top: isMobile ? 0 : 110,
          left: 0,
          width: SIDEBAR_WIDTH,
          height: isMobile ? "100vh" : "calc(100vh - 98px)",
          bgcolor: "#fff",
          borderRight: "1px solid #e0e0e0",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          zIndex: isMobile ? 900 : 600,
          overflowY: "auto",
        }}
      >
        <Sidebar open selectedCategory={currentCategory?.ten_danh_muc} />
      </Box>

      {/* ===== MAIN CONTENT ===== */}
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
        {/* HEADER */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={() => setSidebarOpen((v) => !v)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600} ml={1}>
            {currentCategory?.ten_danh_muc || "..."}
          </Typography>
        </Box>

        {/* SUB CATEGORY */}
        {subCategories.length > 0 && (
          <Paper sx={{ 
              p: isMobile ? 1.5 : 2,
              borderRadius: 2,
              mb: isMobile ? 2 : 3,
              bgcolor: "white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              width: "100%",
              overflow: "hidden",
          }}>
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
            Không có sản phẩm nào
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(auto-fill, minmax(220px, 1fr))",
              },
            }}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.ma_san_pham}
                product={product}
              />
            ))} 
          </Box>
        )}
      </Box>
    </Box>
  );
}
