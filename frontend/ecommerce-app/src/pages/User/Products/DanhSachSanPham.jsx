import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  IconButton,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useParams, useNavigate } from "react-router-dom";

import Sidebar from "../../../components/User/Home/SideBar";
import ProductCard from "../../../components/User/Product/TheSanPham";
import SubDanhMucSwiper from "../../../components/User/Product/SubDanhMucSwiper";
import api from "../../../api";
import { getToken } from "../../../utils/auth";

export default function DanhSachSanPham() {
  const [sanPhams, setSanPhams] = useState([]);
  const [sanPhamsLoc, setSanPhamsLoc] = useState([]);
  const [danhMucCon, setDanhMucCon] = useState([]);
  const [danhMucHienTai, setDanhMucHienTai] = useState(null);
  const [subDanhMucChon, setSubDanhMucChon] = useState(null);
  const [sidebarMo, setSidebarMo] = useState(true);

  const { id, subId } = useParams();
  const dieuHuong = useNavigate();
  const token = getToken();

  const theme = useTheme();
  const laMobile = useMediaQuery(theme.breakpoints.down("md"));
  const CHIEU_RONG_SIDEBAR = 300;

  // Ẩn sidebar trên mobile
  useEffect(() => {
    setSidebarMo(!laMobile);
  }, [laMobile]);

  // Lấy danh sách sản phẩm
  useEffect(() => {
    const laySanPhams = async () => {
      try {
        const res = await api.get("/users/san-pham/");
        setSanPhams(res.data || []);
      } catch (err) {
        console.error("Lấy sản phẩm thất bại:", err);
      }
    };
    laySanPhams();
  }, []);

  // Lấy danh mục
  useEffect(() => {
    const layDanhMucs = async () => {
      try {
        const res = await api.get("/users/danh-muc");
        if (res.data.success) {
          const danhMucs = res.data.data;
          const danhMuc = danhMucs.find((c) => c.ma_danh_muc === Number(id));
          setDanhMucHienTai(danhMuc || null);
          setDanhMucCon(danhMuc?.danh_muc_con || []);
          setSubDanhMucChon(subId ? Number(subId) : null);
        }
      } catch (err) {
        console.error("Lấy danh mục thất bại:", err);
      }
    };
    layDanhMucs();
  }, [id, subId]);

  // Lọc sản phẩm theo danh mục / subcategory
  useEffect(() => {
    if (!id || !sanPhams.length) return;

    const danhMucId = Number(id);
    const subDanhMucId = subId ? Number(subId) : null;

    const ketQua = sanPhams.filter((sp) =>
      subDanhMucId
        ? Number(sp.ma_danh_muc) === subDanhMucId
        : Number(sp.ma_danh_muc) === danhMucId
    );

    setSanPhamsLoc(ketQua);
  }, [sanPhams, id, subId]);

  // Thêm vào giỏ hàng
  const xuLyThemVaoGio = async (sanPham) => {
    if (!token) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
      dieuHuong("/");
      return;
    }

    try {
      const res = await api.post(
        "/users/them-gio-hang",
        {
          ma_san_pham: sanPham.ma_san_pham,
          so_luong: 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("Đã thêm vào giỏ hàng");
      } else {
        alert(res.data.message || "Thêm thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    }
  };

  // Chọn danh mục con
  const xuLyChonSubDanhMuc = (subDanhMuc) => {
    dieuHuong(`/danh-muc/${id}/${subDanhMuc.ma_danh_muc}`);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* Overlay mobile */}
      {laMobile && sidebarMo && (
        <Box
          onClick={() => setSidebarMo(false)}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.4)",
            zIndex: 900,
          }}
        />
      )}

      {/* Sidebar */}
      <Box
        sx={{
          position: "fixed",
          top: laMobile ? 0 : 110,
          left: 0,
          width: CHIEU_RONG_SIDEBAR,
          height: laMobile ? "100vh" : "calc(100vh - 98px)",
          bgcolor: "#fff",
          borderRight: "1px solid #e0e0e0",
          transform: sidebarMo ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          zIndex: laMobile ? 900 : 600,
          overflowY: "auto",
        }}
      >
        <Sidebar open selectedCategory={danhMucHienTai?.ten_danh_muc} />
      </Box>

      {/* Nội dung chính */}
      <Box
        sx={{
          flex: 1,
          ml: !laMobile && sidebarMo ? `${CHIEU_RONG_SIDEBAR}px` : 0,
          width: !laMobile && sidebarMo
            ? `calc(100% - ${CHIEU_RONG_SIDEBAR}px)`
            : "100%",
          transition: "margin-left 0.3s ease, width 0.3s ease",
          p: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton onClick={() => setSidebarMo((v) => !v)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600} ml={1}>
            {danhMucHienTai?.ten_danh_muc || "..."}
          </Typography>
        </Box>

        {/* Danh mục con */}
        {danhMucCon.length > 0 && (
          <Paper
            sx={{
              p: laMobile ? 1.5 : 2,
              borderRadius: 2,
              mb: laMobile ? 2 : 3,
              bgcolor: "white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <SubDanhMucSwiper
              danhMucCon={danhMucCon}
              danhMucConDangChon={subDanhMucChon}
              onChon={xuLyChonSubDanhMuc}
            />
          </Paper>
        )}

        {/* Lưới sản phẩm */}
        {sanPhamsLoc.length === 0 ? (
          <Typography color="text.secondary">Không có sản phẩm nào</Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(auto-fill, minmax(220px, 1fr))",
              },
            }}
          >
            {sanPhamsLoc.map((sp) => (
              <ProductCard
                key={sp.ma_san_pham}
                sanPham={sp}
                onAddToCart={xuLyThemVaoGio}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
