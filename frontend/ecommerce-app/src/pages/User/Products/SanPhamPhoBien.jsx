import { useState, useEffect } from "react";
import { Box, Button  } from "@mui/material";
import ProductCard from "../../../components/User/Product/ProductCart";
import api from "../../../api";

export default function ProductList({ sidebarOpen }) {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState({});
  const [allProducts, setAllProducts] = useState([]);

  const DEFAULT_LIMIT = 10;
  const [visibleCount, setVisibleCount] = useState(DEFAULT_LIMIT);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get(`/goi-y/pho-bien-cho-guest`);
        const data = res.data.goi_y;

        setAllProducts(data);
      } catch (err) {
        console.error("Lỗi fetch trending:", err);
      }
      setLoading(false);
    };

    fetchTrending();
  }, []);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setVisibleCount(DEFAULT_LIMIT);
  };

  const renderProducts = (items) =>
     items.slice(0, visibleCount).map((p) => (
      <ProductCard 
        key={p.ma_san_pham} 
        product={{ ...p, quantity: 1 }} 
        onAddToCart={() => console.log("Add to cart", p)} 
      />
    ));

  if (loading) return <p>Loading...</p>;

  // Lấy danh sách sản phẩm của tab hiện tại
  const currentProducts =
    activeTab === "all"
      ? allProducts
      : categories[activeTab]?.san_phams || [];

  const canShowMore = visibleCount < currentProducts.length;  

  return (
    <section className="py-5">
      <div className="container-fluid">
        <div className="bootstrap-tabs product-tabs">

          {/* Tabs Header */}
          <div className="tabs-header d-flex justify-content-between border-bottom mb-4">
            <h3>Top phổ biến</h3>
          </div>

          {/* Danh sách sản phẩm */}
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
            {renderProducts(currentProducts)}
          </Box>

          {/* Nút Xem thêm / Thu gọn */}
          <div className="text-center mt-3">
            {canShowMore ? (
              <Button 
                variant="contained" 
                onClick={() => setVisibleCount(currentProducts.length)}
              >
                Xem thêm {currentProducts.length - visibleCount} sản phẩm
              </Button>
            ) : (
              currentProducts.length > DEFAULT_LIMIT && (
                <Button 
                  variant="outlined" 
                  onClick={() => setVisibleCount(DEFAULT_LIMIT)}
                >
                  Thu gọn
                </Button>
              )
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
