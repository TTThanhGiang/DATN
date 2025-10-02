import { useState } from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { BorderAll, Star } from "@mui/icons-material";

import "../../css/style.css";
import { colors } from "@mui/material";

const productsData = {
    all: [
      {
        id: 1,
        title: "Sunstar Fresh Melon Juice",
        img: "images/thumb-bananas.png",
        price: 18.0,
        qty: "1 Unit",
        discount: "-30%",
        rating: 4.5,
        quantity: 1,
      },
      {
        id: 2,
        title: "Biscuits Pack",
        img: "images/thumb-biscuits.png",
        price: 18.0,
        qty: "1 Unit",
        discount: "-30%",
        rating: 4.5,
        quantity: 1,
      },
    ],
    fruits: [
      {
        id: 3,
        title: "Fresh Cucumber",
        img: "images/thumb-cucumber.png",
        price: 18.0,
        qty: "1 Unit",
        discount: "-30%",
        rating: 4.5,
        quantity: 1,
      },
      {
        id: 4,
        title: "Fresh Milk",
        img: "images/thumb-milk.png",
        price: 18.0,
        qty: "1 Unit",
        discount: "-30%",
        rating: 4.5,
        quantity: 1,
      },
    ],
    juices: [
      {
        id: 5,
        title: "Organic Juice",
        img: "images/thumb-cucumber.png",
        price: 18.0,
        qty: "1 Unit",
        rating: 4.5,
        quantity: 1,
      },
      {
        id: 6,
        title: "Fresh Milk Juice",
        img: "images/thumb-milk.png",
        price: 18.0,
        qty: "1 Unit",
        rating: 4.5,
        quantity: 1,
      },
    ],
  };

export default function ProductList() {
  const [activeTab, setActiveTab] = useState("all");

   const [products, setProducts] = useState(productsData);

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

  const renderProducts = (items, tab) =>
    items.map((p) => (

      <div className="col" key={p.id}>
        <div className="product-item h-100 justify-content-between p-3 border rounded d-flex flex-column position-relative">
          {p.discount && (
            <span className="badge bg-success position-absolute m-3">
              {p.discount}
            </span>
          )}
          <figure>
            <a href="#" title={p.title}>
               <img
                  src={p.img}
                  alt={p.title}
                  className="text-center mb-3" 
                  style={{
                    width: "100%",       // đầy ngang khung
                    height: "100%",      // đầy chiều cao khung
                    objectFit: "contain", // giữ tỉ lệ, không bị méo
                    display: "block",
                  }}
                />
              </a>
          </figure>
          <h3>{p.title}</h3>
          <div>
            <div>
              <span className="qty">{p.qty}</span><span className="rating"><Star style={{color: "gold", border: "soli"}}/> 4.5</span>
            </div>
          </div>
          <span className="price">${p.price.toFixed(2)}</span>
          <div className="d-flex align-items-center justify-content-between">
            <div className="input-group product-qty justify-content-center">
              <span className="input-group-btn">
                <button
                  onClick={() => handleDecrease(tab, p.id)}
                  type="button"
                  className="quantity-left-minus btn btn-danger btn-number"
                  >
                  <RemoveIcon fontSize="small" />
                </button>
              </span>
              <input type="text" id="quantity" name="quantity" className="form-control input-number" value={p.quantity} readOnly/>
              <span className="input-group-btn">
                 <button
                  type="button"
                  className="quantity-right-plus btn btn-success btn-number"
                  onClick={() => handleIncrease(tab, p.id)}
                  >
                    <AddIcon fontSize="small" />
                  </button>
              </span>
            </div>
            <ShoppingCartIcon fontSize="small" />
          </div>
        </div>
      </div>
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
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
                {renderProducts(products.all, "all")}
              </div>
            )}
            {activeTab === "fruits" && (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
                {renderProducts(products.fruits, "fruits")}
              </div>
            )}
            {activeTab === "juices" && (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
                {renderProducts(products.juices, "juices")}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
