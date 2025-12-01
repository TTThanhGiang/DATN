import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../utils/auth";

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const handleLogout = () => {
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        logout();
        navigate("/");
      }
    };
  return (
    <header className="admin-header border-bottom bg-white shadow-sm">
      <div className="app-header-inner">
        <div className="container-fluid py-2">
          <div className="app-header-content">
            <div className="row justify-content-between align-items-center">
              
              {/* Nút mở sidebar */}
              <div className="col-auto">
                <button
                  id="sidepanel-toggler"
                  className="btn btn-link d-inline-block d-xl-none p-0"
                  onClick={onToggleSidebar}
                >
                  <i className="bi bi-list fs-2"></i>
                </button>
              </div>

              {/* Ô tìm kiếm */}
              <div className="app-search-box col">
                <form className="app-search-form d-flex">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="form-control me-2"
                  />
                  <button type="submit" className="btn btn-primary">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </form>
              </div>

              {/* Khu vực tiện ích */}
              <div className="app-utilities col-auto d-flex align-items-center gap-3">
                {/* Notifications */}
                <div className="dropdown">
                  <a
                    className="dropdown-toggle text-dark position-relative"
                    id="notifications-dropdown"
                    data-bs-toggle="dropdown"
                    href="#"
                  >
                    <i className="bi bi-bell fs-4"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      3
                    </span>
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="notifications-dropdown"
                  >
                    <li className="dropdown-header">Thông báo</li>
                    <li><a className="dropdown-item" href="#">Amy shared a file</a></li>
                    <li><a className="dropdown-item" href="#">New invoice ready</a></li>
                    <li><a className="dropdown-item" href="#">James sent a message</a></li>
                  </ul>
                </div>

                {/* Settings */}
                <a href="#" className="text-dark">
                  <i className="bi bi-gear fs-4"></i>
                </a>

                {/* User dropdown */}
                <div className="dropdown">
                  <a
                    className="dropdown-toggle"
                    id="user-dropdown"
                    data-bs-toggle="dropdown"
                    href="#"
                  >
                    <img
                      src="/assets/images/user.png"
                      alt="User"
                      width={36}
                      height={36}
                      className="rounded-circle"
                    />
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="user-dropdown"
                  >
                    <li><a className="dropdown-item" href="#">Tài khoản</a></li>
                    <li><a className="dropdown-item" href="#">Cài đặt</a></li>
                    <li><a className="dropdown-item text-danger" onClick={handleLogout}>Đăng xuất</a></li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
