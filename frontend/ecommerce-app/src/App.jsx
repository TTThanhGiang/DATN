import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";



// Admin components
import AdminLayout from "./layout/AdminLayout";
import TongQuan from "./pages/Admin/TongQuan";
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
import ChiTietSanPham from "./pages/User/Products/ChiTietSanPham";
import GioHang from "./pages/User/Checkout/GioHang";
import DanhSachSanPham from "./pages/User/Products/DanhSachSanPham";
import LichSuDonHang  from "./pages/User/Account/LichSuDonHang";
import ChiTietKhuyenMai from "./pages/User/Products/SanPhamKhuyenMai";
import KetQuaThanhToan from "./pages/User/Checkout/KetQuaThanhToan";

// Admin pages
import QuanLyNhanVien from "./pages/BranchManager/QuanLyNhanVien";
import QuanLyKhuyenMai from "./pages/BranchManager/QuanLyKhuyenMai";
import QuanLyDonHang from "./pages/BranchManager/QuanLyDonHang";
import QuanLyTonKho from "./pages/BranchManager/QuanLyTonKho";
import QuanLyYeuCauNhapHang from "./pages/BranchManager/YeuCauNhapHang";
import TongQuanQuanLy from "./pages/BranchManager/TongQuan";
import QuanLyDonHangAdmin from "./pages/Admin/QuanLyDonHang";

// Manage staff
import QuanLyDonHangStaff from "./pages/Staff/QuanLyDonHang";
import ThongTinCaNhanStaff from "./pages/Staff/ThongTinCaNhan";
import TongQuanStaff from "./pages/Staff/TongQuan";

// Auth/Protected
import ProtectedRoute from "./components/ProtectedRoute";
import TaiKhoanNguoiDungLayOut from "./layout/TaiKhoaNguoiDungLayout";
import ThongTinCaNhan from "./pages/User/Account/ThongTinCaNhan";

function App() {
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
                <Route path="/san-pham/:ma_san_pham" element={<ChiTietSanPham />} />
                <Route path="/gio-hang" element={<GioHang />} />
                <Route path="/danh-muc/:id" element={<DanhSachSanPham />} />
                <Route path="/danh-muc/:id/:subId?" element={<DanhSachSanPham />} />
                <Route path="/khuyen-mai/:id" element={<ChiTietKhuyenMai />} />
                <Route path="/thanh-toan-thanh-cong" element={<KetQuaThanhToan />} />
                <Route path="/thanh-toan-that-bai" element={<KetQuaThanhToan />} />
                {/* ===========================
                KHU VỰC QUẢN LÝ TÀI KHOẢN
              ============================ */}
                <Route path="/tai-khoan" element={<TaiKhoanNguoiDungLayOut />}>
                  <Route index element={<ThongTinCaNhan />} />
                  <Route path="thong-tin" element={<ThongTinCaNhan />} />
                  <Route path="lich-su-mua-hang" element={<LichSuDonHang />} />

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
                  <Route path="tong-quan" element={<TongQuan />} />
                  <Route path="tai-khoans" element={<QuanLyTaiKhoan />} />
                  <Route path="chi-nhanhs" element={<QuanLyChiNhanh />} />
                  <Route path="danh-mucs" element={<QuanLyDanhMuc />} />
                  <Route path="don-hangs" element={<QuanLyDonHangAdmin />} />
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
          path="/quan-ly/*"
          element={
            <ProtectedRoute role="manager">
              <AdminLayout>
                <Routes>
                  <Route path="tong-quan" element={<TongQuanQuanLy />} />
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
          path="/nhan-vien/*"
          element={
            <ProtectedRoute role="staff">
              <AdminLayout>
                <Routes>
                  <Route path="tong-quan" element={<TongQuanStaff />} />
                  <Route path="don-hangs" element={<QuanLyDonHangStaff />} />
                  <Route path="tai-khoans" element={<ThongTinCaNhanStaff />} />
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
