import { useState, useEffect } from "react";
import "../css/vendor.css";
import "../css/normalize.css";
import "../css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import CartOffcanvas from "./CartOffcanvas";
import SearchOffcanvas from "./SearchOffcanvas";
import AuthOffcanvas  from "./LoginOffcanvas";

import {IconButton, Badge} from '@mui/material';
import { ShoppingCart, AccountCircle, Favorite, Search } from '@mui/icons-material';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <header className="header"
    >
      <div className="container-fluid">
        <div className="row py-3 border-bottom">
          {/* Logo */}
          <div className="col-sm-4 col-lg-3 text-center text-sm-start">
            <div className="main-logo">
              <a href="index.html">
                <img src="/images/logo.png" alt="logo" className="img-fluid" />
              </a>
            </div>
          </div>

          {/* Search */}
          <div className="col-sm-6 offset-sm-2 offset-md-0 col-lg-5 d-none d-lg-block">
            <div className="search-bar row bg-light p-2 my-2 rounded-4">
              <div className="col-11 col-md-11">
                <form id="search-form" className="text-center" action="index.html" method="post">
                  <input type="text" className="form-control border-0 bg-transparent" placeholder="Tìm kiếm sản phẩm..." />
                </form>
              </div>
              <div className="col-1">
                <IconButton color="inherit" form="search-form" type="submit">
                  <Search />
                </IconButton>
              </div>
            </div>
          </div>

          {/* Support + Cart */}
          <div className="col-sm-8 col-lg-4 d-flex justify-content-end gap-5 align-items-center mt-4 mt-sm-0 justify-content-center justify-content-sm-end">
            <div className="support-box text-end d-none d-xl-block">
              <span className="fs-6 text-muted">For Support?</span>
              <h5 className="mb-0">+980-34984089</h5>
            </div>

            <ul className="d-flex justify-content-end list-unstyled m-0 align-items-center">
              {/* User / Heart */}
              <li>
                <IconButton color="inherit" onClick={() => setIsAuthOpen(true)}>
                  <AccountCircle />
                </IconButton>
              </li>
              <li>
                <IconButton color="inherit">
                  <Favorite />
                </IconButton>
              </li>

              {/* Cart icon (mobile) */}
              <li className="d-lg-none">
                 <IconButton color="inherit" onClick={() => setIsCartOpen(true)}>
                  <Badge badgeContent={3} color="primary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              </li>

              {/* Search icon (mobile) */}
              <li className="d-lg-none">
                <IconButton color="inherit" onClick={() => setIsSearchOpen(true)}>
                  <Search />
                </IconButton>
              </li>
            </ul>

            {/* Cart (desktop) */}
            <div className="cart text-end d-none d-lg-block">
              <button
                className="border-0 bg-transparent d-flex flex-column gap-2 lh-1"
                onClick={() => setIsCartOpen(true)}
              >
                <span className="fs-6 text-muted dropdown-toggle">Giỏ hàng</span>
                <span className="cart-total fs-5 fw-bold">100.000 đ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu
      <div className="container-fluid">
        <div className="row py-3">
          <div className="d-flex justify-content-center justify-content-sm-between align-items-center">
            <nav className="main-menu d-flex navbar navbar-expand-lg">
              <button
                className="navbar-toggler"
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              
              <div className={`offcanvas offcanvas-end ${isMenuOpen ? "show" : ""}`} >
                <div className="offcanvas-header justify-content-center">
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsMenuOpen(false)}
                  ></button>
                </div>
                <div className="offcanvas-body">
                  <select className="filter-categories border-0 mb-0 me-5">
                    <option>Shop by Departments</option>
                    <option>Groceries</option>
                    <option>Drinks</option>
                    <option>Chocolates</option>
                  </select>

                  <ul className="navbar-nav justify-content-end menu-list list-unstyled d-flex gap-md-3 mb-0 flex-column flex-lg-row">
                    <li className="nav-item active">
                      <a href="#women" className="nav-link">Women</a>
                    </li>
                    <li className="nav-item">
                      <a href="#men" className="nav-link">Men</a>
                    </li>
                    <li className="nav-item">
                      <a href="#kids" className="nav-link">Kids</a>
                    </li>
                    <li className="nav-item">
                      <a href="#accessories" className="nav-link">Accessories</a>
                    </li>
                    <li className="nav-item">
                      <a href="#pages" className="nav-link">Pages</a>
                    </li>
                    <li className="nav-item">
                      <a href="#brand" className="nav-link">Brand</a>
                    </li>
                    <li className="nav-item">
                      <a href="#sale" className="nav-link">Sale</a>
                    </li>
                    <li className="nav-item">
                      <a href="#blog" className="nav-link">Blog</a>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div> */}

      {/* Cart Offcanvas (mobile & desktop) */}
      <CartOffcanvas isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Search Offcanvas (mobile) */}
      <SearchOffcanvas isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Login Offcanvas (mobile & desktop) */}
      <AuthOffcanvas isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}

export default Header;
