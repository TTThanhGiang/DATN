import { Box } from "@mui/material";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    title: "Thông tin cá nhân",
    link: "/tai-khoan/thong-tin",
    icon: "bi-person"
  },
  {
    title: "Lịch sử mua hàng",
    link: "/tai-khoan/lich-su-mua-hang",
    icon: "bi-cart-check"
  },
  {
    title: "Địa chỉ giao hàng",
    link: "/tai-khoan/dia-chi",
    icon: "bi-geo-alt"
  }
];

export default function TaiKhoanSideBar(){
    return (
    <div id="app-sidepanel">
        <nav id="app-nav-main" className="app-nav app-nav-main flex-grow-1">
          <ul className="app-menu list-unstyled accordion" id="menu-accordion">
             {menuItems.map((item, index) => (
            <li className="nav-item" key={index}>
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 py-2 ${
                    isActive ? "active bg-light" : ""
                  }`
                }
              >
                <i
                  className={`bi ${item.icon} me-2`}
                  style={{
                    fontSize: "1.1rem",
                    width: 20,
                    textAlign: "center"
                  }}
                ></i>
                <span className="nav-link-text">{item.title}</span>
              </NavLink>
            </li>
          ))}
          </ul>
        </nav>
    </div>
    )
}