import { useState, useEffect } from "react";
import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "../../assets/css/portal.css";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";

export default function Sidebar({ role }) {

  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const navigate = useNavigate();

  const prefix = useMemo(() => {
    switch (role) {
      case "QUAN_TRI_VIEN":
        return "/admin";
      case "QUAN_LY":
        return "/manager";
      case "NHAN_VIEN":
        return "/staff";
      default:
        return "";
    }
  }, [role]);
  // cấu hình menu cho từng role
  const menuConfig = useMemo(() => {
    const commonMenus = [
      {
        title: "Overview",
        icon: "bi-house-door",
        link: `${prefix}/dashboard`,
      },
    ];

    const adminMenus = [
      { title: "Quản lý sản phẩm", icon: "bi-bag", link: `${prefix}/san-phams` },
      { title: "Quản lý danh mục", icon: "bi-folder", link: `${prefix}/danh-mucs` },
      { title: "Quản lý chi nhánh", icon: "bi-geo-alt", link: `${prefix}/chi-nhanhs` },
      { title: "Quản lý tài khoản", icon: "bi-people", link: `${prefix}/tai-khoans` },
      { title: "Quản lý đánh giá", icon: "bi-chat-dots", link: `${prefix}/danh-gias` },
      { title: "Quản lý tồn kho", icon: "bi-box-seam", link: `${prefix}/ton-khos` },
      { title: "Quản lý khuyến mãi", icon: "bi-gift", link: `${prefix}/khuyen-mais` },
      { title: "Yêu cầu nhập hàng", icon: "bi-list-check", link: `${prefix}/nhap-hangs` },
    ];

    const branchManagerMenus = [
      { title: "Quản lý nhân viên", icon: "bi-person-lines-fill", link: `${prefix}/nhan-viens` },
      { title: "Quản lý tồn kho", icon: "bi-box-seam", link: `${prefix}/ton-khos` },
      { title: "Quản lý khuyến mãi", icon: "bi-gift", link: `${prefix}/khuyen-mais` },
      { title: "Quản lý đơn hàng", icon: "bi-receipt-cutoff", link: `${prefix}/don-hangs` },
      { title: "Yêu cầu nhập hàng", icon: "bi-list-check", link: `${prefix}/nhap-hangs` },
    ];

    const staffMenus = [
      { title: "Quản lý đơn hàng", icon: "bi-cart-check", link: `${prefix}/orders` },
      { title: "Thông tin cá nhân", icon: "bi-person", link: `${prefix}/profile` },
    ];

    switch (role) {
      case "QUAN_TRI_VIEN":
        return [...commonMenus, ...adminMenus];
      case "QUAN_LY":
        return [...commonMenus, ...branchManagerMenus];
      case "NHAN_VIEN":
        return [...commonMenus, ...staffMenus];
      default:
        return commonMenus;
    }
  }, [role]);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout();
      navigate("/");
    }
  };

  return (
    <header className="app-header fixed-top">
      <div className="app-header-inner">
        <div className="container-fluid py-2">
          <div className="app-header-content">
            <div className="row justify-content-between align-items-center">
              
              {/* Nút mở sidebar (mobile) */}
              <div className="col-auto">
                <a
                  id="sidepanel-toggler"
                  className="sidepanel-toggler d-inline-block d-xl-none"
                  onClick={toggleSidebar}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    role="img"
                  >
                    <title>Menu</title>
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeMiterlimit="10"
                      strokeWidth="2"
                      d="M4 7h22M4 15h22M4 23h22"
                    ></path>
                  </svg>
                </a>
              </div>

              {/* Ô tìm kiếm */}
              <div className="search-mobile-trigger d-sm-none col">
                <i className="search-mobile-trigger-icon fa-solid fa-magnifying-glass"></i>
              </div>

              <div className="app-search-box col">
                <form className="app-search-form">
                  <input
                    type="text"
                    placeholder="Search..."
                    name="search"
                    className="form-control search-input"
                  />
                  <button
                    type="submit"
                    className="btn search-btn btn-primary"
                    value="Search"
                  >
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </form>
              </div>

              {/* Các tiện ích bên phải */}
              <div className="app-utilities col-auto d-flex align-items-center gap-3">
                
                {/* Notifications */}
                <div className="app-utility-item app-notifications-dropdown dropdown">
                  <a
                    className="dropdown-toggle no-toggle-arrow position-relative"
                    id="notifications-dropdown-toggle"
                    data-bs-toggle="dropdown"
                    href="#"
                    role="button"
                    aria-expanded="false"
                    title="Notifications"
                  >
                    <i className="bi bi-bell fs-5"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      3
                    </span>
                  </a>

                  <div
                    className="dropdown-menu dropdown-menu-end p-0"
                    aria-labelledby="notifications-dropdown-toggle"
                  >
                    <div className="dropdown-menu-header p-3 border-bottom">
                      <h5 className="mb-0">Notifications</h5>
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
                            <div className="desc">
                              Amy shared a file with you.
                            </div>
                            <div className="meta small text-muted">
                              2 hrs ago
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="item p-3 border-bottom">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-receipt text-primary fs-4 me-2"></i>
                          <div>
                            <div className="desc">
                              You have a new invoice.
                            </div>
                            <div className="meta small text-muted">
                              1 day ago
                            </div>
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
                            <div className="desc">
                              James sent you a new message.
                            </div>
                            <div className="meta small text-muted">
                              7 days ago
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-menu-footer p-2 text-center border-top">
                      <a href="#">View all</a>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="app-utility-item">
                  <a href="#" title="Settings">
                    <i className="bi bi-gear fs-5"></i>
                  </a>
                </div>

                {/* User dropdown */}
                <div className="app-utility-item app-user-dropdown dropdown">
                  <a
                    className="dropdown-toggle"
                    id="user-dropdown-toggle"
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
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="user-dropdown-toggle"
                  >
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
                      <a className="dropdown-item" onClick={handleLogout}>
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
      <div id="app-sidepanel" className={`app-sidepanel ${isSidebarOpen ? "open" : "close"}`}>
        <div id="sidepanel-drop" className="sidepanel-drop"></div>
        <div className="sidepanel-inner d-flex flex-column">
        <div className="app-branding text-center py-3 border-bottom">
          <NavLink className="app-logo d-flex align-items-center justify-content-center text-decoration-none" to="/">
            <img
              src="/images/logo.png"
              alt="logo"
              style={{ width: 200, marginRight: 8 }}
            />
          </NavLink>
        </div>

        <nav id="app-nav-main" className="app-nav app-nav-main flex-grow-1">
          <ul className="app-menu list-unstyled accordion" id="menu-accordion">
            {menuConfig.map((item, idx) => (
              <li key={idx} className="nav-item">
                <NavLink
                  to={item.link}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center px-3 py-2 ${isActive ? "active bg-light" : ""}`
                  }
                >
                  <i
                    className={`bi ${item.icon} me-2`}
                    style={{ fontSize: "1.1rem", width: 20, textAlign: "center" }}
                  ></i>
                  <span className="nav-link-text">{item.title}</span>
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
                  to={`${prefix}/profile`}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center px-3 py-2 ${isActive ? "active bg-light" : ""}`
                  }
                >
                  <i
                    className= "bi bi-person me-2"
                    style={{ fontSize: "1.1rem", width: 20, textAlign: "center" }}
                  ></i>
                  <span className="nav-link-text">Tài khoản</span>
                </NavLink>
						    </li>
                  <li className="nav-item">
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                      `nav-link d-flex align-items-center px-3 py-2 ${isActive ? "active bg-light" : ""}`
                    }
                  >
                    <i
                      className= "bi bi-box-arrow-right me-2"
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
  
