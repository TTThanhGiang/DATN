import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import SearchOffcanvas from "./SearchOffcanvas";
import AuthOffcanvas  from "../LoginOffcanvas";
import { getToken, getRole, logout, getUserId } from "../../../utils/auth";


import {IconButton, Badge, Menu, MenuItem} from '@mui/material';
import { ShoppingCart, AccountCircle, Favorite, Search } from '@mui/icons-material';

function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const token = getToken();
  const userId = getUserId();

  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    if(token){
      setAnchorEl(event.currentTarget);
    } else {
      setIsAuthOpen(true);
    }
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
  }

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      setAnchorEl(null);
      navigate("/");
   }
  };

  return (
    <header className="header"
    >
      <div className="container-fluid">
        <div className="row py-3 border-bottom">
          {/* Logo */}
          <div className="col-sm-4 col-lg-3 text-center text-sm-start">
            <div className="main-logo">
              <a href="/">
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
                {token ? (
                  <a
                  className="dropdown-toggle"
                  href="#"
                  id="user-dropdown"
                  onClick={handleMenuOpen}
                >
                  <img
                    src="/assets/images/user.png"
                    alt="User"
                    width={36}
                    height={36}
                    className="rounded-circle"
                  />
                </a>
                ) : (
                  <IconButton color="inherit" onClick={handleMenuOpen}>
                    <AccountCircle />
                  </IconButton>
                )}
                {/* Dropdown menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  PaperProps={{
                    className: "dropdown-menu dropdown-menu-end show",
                    sx: { minWidth: 160, padding: 0 },
                  }}
                >
                  <MenuItem
                    onClick={() => { handleMenuClose(); navigate("/profile"); }}
                    className="dropdown-item"
                  >
                    Hồ sơ của tôi
                  </MenuItem>
                  <MenuItem
                    onClick={() => { handleMenuClose(); navigate("/orders"); }}
                    className="dropdown-item"
                  >
                    Đơn mua
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    className="dropdown-item text-danger"
                  >
                    Đăng xuất
                  </MenuItem>
                </Menu>
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
                onClick={() => navigate(`/cart`)}
              >
                <span className="fs-6 text-muted dropdown-toggle">Giỏ hàng</span>
                <span className="cart-total fs-5 fw-bold">100.000 đ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Offcanvas (mobile) */}
      <SearchOffcanvas isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Login Offcanvas (mobile & desktop) */}
      <AuthOffcanvas isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}

export default Header;
