import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";



// Admin components
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import QuanLyTaiKhoan from "./pages/Admin/QuanLyTaiKhoan";
import QuanLyChiNhanh from "./pages/Admin/QuanLyChiNhanh";
import QuanLyDanhMuc from "./pages/Admin/QuanLyDanhMuc";
import QuanLySanPham from "./pages/Admin/QuanLySanPham";
import AdminQuanLyTonKho from "./pages/Admin/QuanLyTonKho";
import QuanLyDanhGia from "./pages/Admin/QuanLyDanhGia";
import AdminYeuCauNhapHang from "./pages/Admin/YeuCauNhapHang";
import AdminQuanLyKhuyenMai from "./pages/Admin/QuanLyKhuyenMai";

// User page
import UserLayout from "./layout/UserLayout";
import HomePage from "./pages/User/Home/Home";
import ProductDetail from "./pages/User/Products/ProductDetail";
import Cart from "./pages/User/Checkout/Cart";
import ProductListPage from "./pages/User/Products/Products";
import LichSuDonHang  from "./pages/User/Account/LichSuDonHang";

// Manage pages
import QuanLyNhanVien from "./pages/BranchManager/EmployeeManage";
import QuanLyKhuyenMai from "./pages/BranchManager/PromotionManage";
import QuanLyDonHang from "./pages/BranchManager/OrderManage";
import QuanLyTonKho from "./pages/BranchManager/QuanLyTonKho";
import QuanLyYeuCauNhapHang from "./pages/BranchManager/YeuCauNhapHang";

// Manage staff
import OrderManageStaff from "./pages/Staff/OrderManage";
import Profile from "./pages/Staff/Profile";

// Auth/Protected
import ProtectedRoute from "./components/ProtectedRoute";
import TaiKhoanNguoiDungLayOut from "./layout/TaiKhoaNguoiDungLayout";
import ThongTinCaNhan from "./pages/User/Account/ThongTinCaNhan";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarWidth = sidebarOpen ? 240 : 0;

  return (
    <Router>
      <Routes>
        {/* ===================== USER ROUTES ===================== */}
        <Route
          path="/*"
          element={
            <UserLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/san-pham/:id" element={<ProductDetail />} />
                <Route path="/gio-hang" element={<Cart />} />
                <Route path="/danh-muc/:id" element={<ProductListPage />} />
                <Route path="/danh-muc/:id/:subId?" element={<ProductListPage />} />
                {/* ===========================
                KHU VỰC QUẢN LÝ TÀI KHOẢN
              ============================ */}
                <Route path="/tai-khoan" element={<TaiKhoanNguoiDungLayOut />}>
                  <Route index element={<ThongTinCaNhan />} />
                  <Route path="thong-tin" element={<ThongTinCaNhan />} />
                  <Route path="lich-su-mua-hang" element={<LichSuDonHang />} />
                  {/*
                  <Route path="doi-mat-khau" element={<DoiMatKhau />} />
                  <Route path="dia-chi" element={<DiaChi />} /> */}

                  {/* Mặc định khi truy cập /tai-khoan */}

                </Route>
              </Routes>
            </UserLayout>
          }
        />

        {/* ===================== ADMIN ROUTES ===================== */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="tai-khoans" element={<QuanLyTaiKhoan />} />
                  <Route path="chi-nhanhs" element={<QuanLyChiNhanh />} />
                  <Route path="danh-mucs" element={<QuanLyDanhMuc />} />
                  <Route path="san-phams" element={<QuanLySanPham />} />
                  <Route path="ton-khos" element={<AdminQuanLyTonKho />} />
                  <Route path="danh-gias" element={<QuanLyDanhGia/>}/>
                  <Route path="khuyen-mais" element={<AdminQuanLyKhuyenMai/>}/>
                  <Route path="nhap-hangs" element={<AdminYeuCauNhapHang/>} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* BRANCH MANAGER */}
        <Route
          path="/manager/*"
          element={
            <ProtectedRoute role="manager">
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="nhan-viens" element={<QuanLyNhanVien />} />
                  <Route path="ton-khos" element={<QuanLyTonKho />} />
                  <Route path="khuyen-mais" element={<QuanLyKhuyenMai />} />
                  <Route path="don-hangs" element={<QuanLyDonHang />} />
                  <Route path="nhap-hangs" element={<QuanLyYeuCauNhapHang />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* STAFF */}
        <Route
          path="/staff/*"
          element={
            <ProtectedRoute role="staff">
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="orders" element={<OrderManageStaff />} />
                  <Route path="profile" element={<Profile />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
