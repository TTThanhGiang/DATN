import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import SearchOffcanvas from "./SearchOffcanvas";
import AuthOffcanvas  from "../LoginOffcanvas";
import DiaChiDialog  from "../Home/DiaChiDialog";
import { getToken, getRole, logout, getUserId, getUser } from "../../../utils/auth";


import {IconButton, Badge, Menu, MenuItem, Box} from '@mui/material';
import { ShoppingCart, AccountCircle, Favorite, Search, LocationOn, Inventory2, Logout } from '@mui/icons-material';
import api from "../../../api";

function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const [moDiaChi, setMoDiaChi] = useState(false);
  const [diaChi, setDiaChi] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const userId = getUserId();
  const token = getToken();

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
      window.dispatchEvent(new Event("user-logout"));
      navigate("/");
   }
  };

  useEffect(() => {
    if (token) {
      getSoSPGioHang();
    }

    const capNhatGioHang = () => {
      if (token) getSoSPGioHang();
    };

    window.addEventListener("cart-updated", capNhatGioHang);

    return () => {
      window.removeEventListener("cart-updated", capNhatGioHang);
    };
  }, [token]);

  const getSoSPGioHang = async () => {
    try {
      const res = await api.get(`/users/so-san-pham-trong-gio-hang`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems(res.data.data);
    } catch (error) {
      console.error("Lỗi lấy số SP giỏ hàng:", error);
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
                <IconButton color="inherit" onClick={() => navigate("/gio-hang")}>
                  <Badge badgeContent={cartItems} color="primary">
                    <ShoppingCart />
                  </Badge>
              </IconButton>
              </div>
            </div>
          </div>

          {/* Support + Cart */}
          <div className="col-sm-8 col-lg-4 mt-4 mt-sm-0">

            {/* ===== DESKTOP ===== */}
            <div className="d-none d-lg-flex justify-content-end align-items-start gap-3">

              {/* CỘT ĐỊA CHỈ + TÀI KHOẢN */}
              <div className="d-flex flex-column align-items-end gap-2">

                {/* ĐỊA CHỈ */}
                <div
                  className="d-flex align-items-center px-3 py-1"
                  style={{
                    background: "rgba(0,126,66,0.15)",
                    borderRadius: 999,
                    minWidth: 220,
                    cursor: "pointer",
                  }}
                  onClick={() => setMoDiaChi(true)}
                >
                  <LocationOn fontSize="small" sx={{ color: "#007E42" }} />
                  <span className="ms-1" style={{ fontSize: 11 }}>
                    Giao đến:
                  </span>
                  <span
                    className="ms-1 fw-bold text-truncate"
                    style={{
                      fontSize: 12,
                      maxWidth: 140,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {diaChi}
                  </span>
                </div>

                {/* TÀI KHOẢN */}
                <button
                  onClick={handleMenuOpen}
                  style={{
                    background: "#006133",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px 6px 0 0",
                    padding: "6px 12px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  <AccountCircle />
                  <span className="ms-2">
                    {token ? "Tài khoản của bạn" : "Đăng nhập"}
                  </span>
                </button>
              </div>
            </div>

            {/* ===== MOBILE ===== */}
            <div className="d-lg-none">
              {/* HÀNG ICON */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: {
                    xs: "center",   // mobile
                    sm: "flex-end", // tablet trở lên
                  },
                }}
              >
                <IconButton onClick={() => setIsSearchOpen(true)}>
                  <Search />
                </IconButton>

                <IconButton onClick={() => navigate("/gio-hang")}>
                  <Badge badgeContent={3} color="primary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>

                <IconButton onClick={handleMenuOpen}>
                  <AccountCircle />
                </IconButton>
              </Box>
            </div>

            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate("/tai-khoan");
                }}
                sx={{ gap: 1.5 }}
              >
                <AccountCircle fontSize="small" />
                Hồ sơ của tôi
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate("/tai-khoan/lich-su-mua-hang");
                }}
                sx={{ gap: 1.5 }}
              >
                <Inventory2 fontSize="small" />
                Đơn mua
              </MenuItem>

              <MenuItem
                onClick={handleLogout}
                sx={{
                  gap: 1.5,
                  color: "error.main",
                }}
              >
                <Logout fontSize="small" />
                Đăng xuất
              </MenuItem>
            </Menu>
          </div>

          
        </div>
      </div>

      {/* Search Offcanvas (mobile) */}
      <SearchOffcanvas isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Login Offcanvas (mobile & desktop) */}
      <AuthOffcanvas isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

        <DiaChiDialog
          mo={moDiaChi}
          dong={() => setMoDiaChi(false)}
          onXacNhan={(diaChiDayDu) => setDiaChi(diaChiDayDu)}
        />
    </header>
  );
}

export default Header;
