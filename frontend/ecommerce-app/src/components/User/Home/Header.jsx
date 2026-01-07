import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import ThanhCongCuTimKiem from "./TimKiemOffcanvas";
import DangNhapOffcanvas  from "./DangNhapOffcanvas";
import DialogDiaChi  from "../Home/DiaChiDialog";
import { getToken, getRole, logout, getUserId, getUser } from "../../../utils/auth";

import {IconButton, Badge, Menu, MenuItem, Box} from '@mui/material';
import { ShoppingCart, AccountCircle, Favorite, Search, LocationOn, Inventory2, Logout } from '@mui/icons-material';
import api from "../../../api";

function Header() {
  const [timKiemMo, setTimKiemMo] = useState(false);
  const [dangNhapMo, setDangNhapMo] = useState(false);
  const [sanPhamGioHang, setSanPhamGioHang] = useState([]);

  const [moDiaChi, setMoDiaChi] = useState(false);
  const [diaChiHienTai, setDiaChiHienTai] = useState("");

  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuMo = Boolean(menuAnchor);

  const idNguoiDung = getUserId();
  const token = getToken();

  const dieuHuong = useNavigate();

  const moMenuNguoiDung = (event) => {
    if(token){
      setMenuAnchor(event.currentTarget);
    } else {
      setDangNhapMo(true);
    }
  };

  const dongMenuNguoiDung = () => {
    setMenuAnchor(null);
  };

  const xoaDangNhap = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      setMenuAnchor(null);
      window.dispatchEvent(new Event("user-logout"));
      dieuHuong("/");
   }
  };

  useEffect(() => {
    if (token) {
      laySoSanPhamGioHang();
    }

    const capNhatGioHang = () => {
      if (token) laySoSanPhamGioHang();
    };

    window.addEventListener("cart-updated", capNhatGioHang);

    return () => {
      window.removeEventListener("cart-updated", capNhatGioHang);
    };
  }, [token]);

  const laySoSanPhamGioHang = async () => {
    try {
      const res = await api.get(`/users/so-san-pham-trong-gio-hang`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSanPhamGioHang(res.data.data);
    } catch (error) {
      console.error("Lỗi lấy số SP giỏ hàng:", error);
    }
  };

  return (
    <header className="header">
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
                <form id="form-tim-kiem" className="text-center" action="index.html" method="post">
                  <input type="text" className="form-control border-0 bg-transparent" placeholder="Tìm kiếm sản phẩm..." />
                </form>
              </div>
              <div className="col-1">
                <IconButton color="inherit" onClick={() => dieuHuong("/gio-hang")}>
                  <Badge badgeContent={sanPhamGioHang} color="primary">
                    <ShoppingCart />
                  </Badge>
              </IconButton>
              </div>
            </div>
          </div>

          {/* Support + Cart */}
          <div className="col-sm-8 col-lg-4 mt-4 mt-sm-0">
            <div className="d-none d-lg-flex justify-content-end align-items-start gap-3">
              <div className="d-flex flex-column align-items-end gap-2">
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
                    {diaChiHienTai}
                  </span>
                </div>

                {/* TÀI KHOẢN */}
                <button
                  onClick={moMenuNguoiDung}
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: {
                    xs: "center",
                    sm: "flex-end",
                  },
                }}
              >
                <IconButton onClick={() => setTimKiemMo(true)}>
                  <Search />
                </IconButton>

                <IconButton onClick={() => dieuHuong("/gio-hang")}>
                  <Badge badgeContent={3} color="primary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>

                <IconButton onClick={moMenuNguoiDung}>
                  <AccountCircle />
                </IconButton>
              </Box>
            </div>

            <Menu
              anchorEl={menuAnchor}
              open={menuMo}
              onClose={dongMenuNguoiDung}
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
                  dongMenuNguoiDung();
                  dieuHuong("/tai-khoan");
                }}
                sx={{ gap: 1.5 }}
              >
                <AccountCircle fontSize="small" />
                Hồ sơ của tôi
              </MenuItem>

              <MenuItem
                onClick={() => {
                  dongMenuNguoiDung();
                  dieuHuong("/tai-khoan/lich-su-mua-hang");
                }}
                sx={{ gap: 1.5 }}
              >
                <Inventory2 fontSize="small" />
                Đơn mua
              </MenuItem>

              <MenuItem
                onClick={xoaDangNhap}
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
      <ThanhCongCuTimKiem mo={timKiemMo} dong={() => setTimKiemMo(false)} />
      
      {/* Login Offcanvas (mobile & desktop) */}
      <DangNhapOffcanvas mo={dangNhapMo} dong={() => setDangNhapMo(false)} />

      <DialogDiaChi
        mo={moDiaChi}
        dong={() => setMoDiaChi(false)}
        onXacNhan={(diaChiDayDu) => setDiaChiHienTai(diaChiDayDu)}
      />
    </header>
  );
}

export default Header;
