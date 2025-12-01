import { useState } from "react";
import {Box} from "@mui/material";

import ProductCard from "../../../components/User/Product/ProductCart"
import { allProducts } from "../../../components/sampleProducts"


export default function ProductList(sidebarOpen) {
  const [activeTab, setActiveTab] = useState("all");

  const [products, setProducts] = useState(allProducts);
  // const filteredProducts = allProducts.filter((p) => p.categoryId === Number(categoryId));
  const [cart, setCart] = useState({})
  // Hàm tăng giảm theo id + tab
  const handleIncrease = (tab, id) => {
    setProducts((prev) => ({
      ...prev,
      [tab]: prev[tab].map((p) =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p
      ),
    }));
  };

  const handleDecrease = (tab, id) => {
    setProducts((prev) => ({
      ...prev,
      [tab]: prev[tab].map((p) =>
        p.id === id ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p
      ),
    }));
  };

  const handleAddToCart = (product) => {
    console.log("Thêm vào giỏ hàng:", product)
    alert(`Đã thêm ${product.name} vào giỏ hàng!`)
  }

  const renderProducts = (items, tab) =>
    items.map((p) => (
      <ProductCard
        key={p.id}
        product={{ ...p, quantity: cart[p.id] || 0 }}
        onAddToCart={handleAddToCart}
      />
    ));

  return (
    <section className="py-5">
      <div className="container-fluid">
        <div className="bootstrap-tabs product-tabs">
          {/* Tabs Header */}
          <div className="tabs-header d-flex justify-content-between border-bottom mb-4">
            <h3>Trending Products</h3>
            <nav>
              <div className="nav nav-tabs" role="tablist">
                <button
                  className={`nav-link text-uppercase fs-6 ${
                    activeTab === "all" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("all")}
                >
                  All
                </button>
                <button
                  className={`nav-link text-uppercase fs-6 ${
                    activeTab === "fruits" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("fruits")}
                >
                  Fruits & Veges
                </button>
                <button
                  className={`nav-link text-uppercase fs-6 ${
                    activeTab === "juices" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("juices")}
                >
                  Juices
                </button>
              </div>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "all" && (
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  transition: "all 0.3s ease",
                  gridTemplateColumns: sidebarOpen
                    ? "repeat(auto-fill, minmax(220px, 1fr))"
                    : "repeat(auto-fill, minmax(200px, 1fr))",
                }}
              >
                {renderProducts(products, "all")}
              </Box>
            )}
            {activeTab === "fruits" && (
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  transition: "all 0.3s ease",
                  gridTemplateColumns: sidebarOpen
                    ? "repeat(auto-fill, minmax(220px, 1fr))"
                    : "repeat(auto-fill, minmax(200px, 1fr))",
                }}
              >
                {renderProducts(products.filter((p) => p.categoryId === Number(1)), "fruits")}
              </Box>
            )}
            {activeTab === "juices" && (
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  transition: "all 0.3s ease",
                  gridTemplateColumns: sidebarOpen
                    ? "repeat(auto-fill, minmax(220px, 1fr))"
                    : "repeat(auto-fill, minmax(200px, 1fr))",
                }}
              >
                {renderProducts(products.filter((p) => p.categoryId === Number(2)), "juices")}
              </Box>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
