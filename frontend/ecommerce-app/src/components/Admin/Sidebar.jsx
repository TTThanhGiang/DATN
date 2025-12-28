import { useState, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "../../assets/css/portal.css";
import { logout } from "../../utils/auth";

export default function ThanhDieuHuong({ vaiTro }) {
  const [moSidebar, setMoSidebar] = useState(false);
  const dieuHuong = useNavigate();

  const tienTo = useMemo(() => {
    switch (vaiTro) {
      case "QUAN_TRI_VIEN":
        return "/admin";
      case "QUAN_LY":
        return "/manager";
      case "NHAN_VIEN":
        return "/staff";
      default:
        return "";
    }
  }, [vaiTro]);

  const cauHinhMenu = useMemo(() => {
    const menuChung = [
      { tieuDe: "Tổng quan", icon: "bi-house-door", link: `${tienTo}/dashboard` },
    ];

    const menuAdmin = [
      { tieuDe: "Quản lý sản phẩm", icon: "bi-bag", link: `${tienTo}/san-phams` },
      { tieuDe: "Quản lý danh mục", icon: "bi-folder", link: `${tienTo}/danh-mucs` },
      { tieuDe: "Quản lý đơn hàng", icon: "bi-receipt-cutoff", link: `${tienTo}/don-hangs` },
      { tieuDe: "Quản lý chi nhánh", icon: "bi-geo-alt", link: `${tienTo}/chi-nhanhs` },
      { tieuDe: "Quản lý tài khoản", icon: "bi-people", link: `${tienTo}/tai-khoans` },
      { tieuDe: "Quản lý đánh giá", icon: "bi-chat-dots", link: `${tienTo}/danh-gias` },
      { tieuDe: "Quản lý tồn kho", icon: "bi-box-seam", link: `${tienTo}/ton-khos` },
      { tieuDe: "Quản lý khuyến mãi", icon: "bi-gift", link: `${tienTo}/khuyen-mais` },
      { tieuDe: "Yêu cầu nhập hàng", icon: "bi-list-check", link: `${tienTo}/nhap-hangs` },
    ];

    const menuQuanLyChiNhanh = [
      { tieuDe: "Quản lý nhân viên", icon: "bi-person-lines-fill", link: `${tienTo}/nhan-viens` },
      { tieuDe: "Quản lý tồn kho", icon: "bi-box-seam", link: `${tienTo}/ton-khos` },
      { tieuDe: "Quản lý khuyến mãi", icon: "bi-gift", link: `${tienTo}/khuyen-mais` },
      { tieuDe: "Quản lý đơn hàng", icon: "bi-receipt-cutoff", link: `${tienTo}/don-hangs` },
      { tieuDe: "Yêu cầu nhập hàng", icon: "bi-list-check", link: `${tienTo}/nhap-hangs` },
    ];

    const menuNhanVien = [
      { tieuDe: "Quản lý đơn hàng", icon: "bi-cart-check", link: `${tienTo}/orders` },
      { tieuDe: "Thông tin cá nhân", icon: "bi-person", link: `${tienTo}/profile` },
    ];

    switch (vaiTro) {
      case "QUAN_TRI_VIEN":
        return [...menuChung, ...menuAdmin];
      case "QUAN_LY":
        return [...menuChung, ...menuQuanLyChiNhanh];
      case "NHAN_VIEN":
        return [...menuChung, ...menuNhanVien];
      default:
        return menuChung;
    }
  }, [vaiTro, tienTo]);

  const xuLyDangXuat = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      dieuHuong("/");
    }
  };


  return (
    <header className="app-header fixed-top">
      <div className="app-header-inner">
        <div className="container-fluid py-2">
          <div className="app-header-content">
            <div className="row justify-content-between align-items-center">
              
              {/* Ô tìm kiếm */}
              <div className="search-mobile-trigger d-sm-none col">
                <i className="search-mobile-trigger-icon fa-solid fa-magnifying-glass"></i>
              </div>

              <div className="app-search-box col">
                <form className="app-search-form">
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    name="search"
                    className="form-control search-input"
                  />
                  <button type="submit" className="btn search-btn btn-primary">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </form>
              </div>

              {/* Tiện ích bên phải */}
              <div className="app-utilities col-auto d-flex align-items-center gap-3">
                {/* Notifications */}
                <div className="app-utility-item app-notifications-dropdown dropdown">
                  <a
                    className="dropdown-toggle no-toggle-arrow position-relative"
                    data-bs-toggle="dropdown"
                    href="#"
                    role="button"
                    aria-expanded="false"
                    title="Thông báo"
                  >
                    <i className="bi bi-bell fs-5"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      3
                    </span>
                  </a>
                  {/* Nội dung dropdown */}
                  <div className="dropdown-menu dropdown-menu-end p-0">
                    <div className="dropdown-menu-header p-3 border-bottom">
                      <h5 className="mb-0">Thông báo</h5>
                    </div>
                    <div className="dropdown-menu-content">
                      <div className="item p-3 border-bottom">
                        <div className="d-flex align-items-center">
                          <img
                            className="profile-image me-2"
                            src="/assets/images/profiles/profile-1.png"
                            alt="User"
                            width={32}
                            height={32}
                          />
                          <div>
                            <div className="desc">Amy đã chia sẻ file với bạn.</div>
                            <div className="meta small text-muted">2 giờ trước</div>
                          </div>
                        </div>
                      </div>
                      <div className="item p-3 border-bottom">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-receipt text-primary fs-4 me-2"></i>
                          <div>
                            <div className="desc">Bạn có hóa đơn mới.</div>
                            <div className="meta small text-muted">1 ngày trước</div>
                          </div>
                        </div>
                      </div>
                      <div className="item p-3">
                        <div className="d-flex align-items-center">
                          <img
                            className="profile-image me-2"
                            src="/assets/images/profiles/profile-2.png"
                            alt="User"
                            width={32}
                            height={32}
                          />
                          <div>
                            <div className="desc">James gửi bạn tin nhắn mới.</div>
                            <div className="meta small text-muted">7 ngày trước</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-menu-footer p-2 text-center border-top">
                      <a href="#">Xem tất cả</a>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="app-utility-item">
                  <a href="#" title="Cài đặt">
                    <i className="bi bi-gear fs-5"></i>
                  </a>
                </div>

                {/* User dropdown */}
                <div className="app-utility-item app-user-dropdown dropdown">
                  <a
                    className="dropdown-toggle"
                    data-bs-toggle="dropdown"
                    href="#"
                    role="button"
                    aria-expanded="false"
                  >
                    <img
                      src="/assets/images/user.png"
                      alt="user profile"
                      className="rounded-circle"
                      width={36}
                      height={36}
                    />
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <a className="dropdown-item" href="#">
                        Tài khoản
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Cài đặt
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" onClick={xuLyDangXuat}>
                        Đăng xuất
                      </a>
                    </li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div id="app-sidepanel" className={`app-sidepanel ${moSidebar ? "open" : "close"}`}>
        <div id="sidepanel-drop" className="sidepanel-drop"></div>
        <div className="sidepanel-inner d-flex flex-column">
          <div className="app-branding text-center py-3 border-bottom">
            <NavLink className="app-logo d-flex align-items-center justify-content-center text-decoration-none" to="/">
              <img src="/images/logo.png" alt="logo" style={{ width: 200, marginRight: 8 }} />
            </NavLink>
          </div>

          <nav id="app-nav-main" className="app-nav app-nav-main flex-grow-1">
            <ul className="app-menu list-unstyled accordion" id="menu-accordion">
              {cauHinhMenu.map((menu, idx) => (
                <li key={idx} className="nav-item">
                  <NavLink
                    to={menu.link}
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center px-3 py-2 ${isActive ? "active bg-light" : ""}`
                    }
                  >
                    <i
                      className={`bi ${menu.icon} me-2`}
                      style={{ fontSize: "1.1rem", width: 20, textAlign: "center" }}
                    ></i>
                    <span className="nav-link-text">{menu.tieuDe}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="app-sidepanel-footer">
            <nav className="app-nav app-nav-footer">
              <ul className="app-menu footer-menu list-unstyled">
                <li className="nav-item">
                  <NavLink
                    to={`${tienTo}/profile`}
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center px-3 py-2 ${isActive ? "active bg-light" : ""}`
                    }
                  >
                    <i
                      className="bi bi-person me-2"
                      style={{ fontSize: "1.1rem", width: 20, textAlign: "center" }}
                    ></i>
                    <span className="nav-link-text">Tài khoản</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                  to={'/'}
                    className= "nav-link d-flex align-items-center px-3 py-2"
                  >
                    <i
                      className="bi bi-box-arrow-right me-2"
                      style={{ fontSize: "1.1rem", width: 20, textAlign: "center" }}
                    ></i>
                    <span className="nav-link-text">Đăng xuất</span>
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>

        </div>
      </div>
    </header>
  );
}
