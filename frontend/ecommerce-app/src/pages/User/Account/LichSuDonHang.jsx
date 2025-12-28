import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DonHangItem from "../../../components/User/Account/DonHangItem";
import { useEffect, useState } from "react";
import api from "../../../api";
import { getToken } from "../../../utils/auth";
import FormDanhGia from "../../../components/User/Account/FormDanhGia";

export default function LichSuDonHang() {
  const [donHangs, setDonHangs] = useState([]);
  const [moDanhGia, setMoDanhGia] = useState(false);
  const [sanPhamDangDanhGia, setSanPhamDangDanhGia] = useState(null);

  const token = getToken();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchDonHangs();
  }, []);

  const fetchDonHangs = async () => {
    try {
      const res = await api.get(`/users/lich-su-mua-hang`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        setDonHangs(res.data.data);
      }
    } catch (err) {
      console.log("Lỗi khi lấy danh sách đơn hàng", err);
    }
  };

  const suKienDanhGia = (sanPham) => {
    setSanPhamDangDanhGia(sanPham);
    setMoDanhGia(true);
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
      }}
    >
      <Typography
        variant={isMobile ? "subtitle1" : "h6"}
        fontWeight={600}
        mb={2}
      >
        Lịch sử đơn hàng
      </Typography>

      {donHangs.length === 0 ? (
        <Typography color="text.secondary">
          Không có đơn hàng nào
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {donHangs.map((donHang) => (
            <DonHangItem
              key={donHang.ma_don_hang}
              donHang={donHang}
              suKienDanhGia={suKienDanhGia}
            />
          ))}
        </Box>
      )}

      <FormDanhGia
        mo={moDanhGia}
        sanPham={sanPhamDangDanhGia}
        dong={() => setMoDanhGia(false)}
        fullScreen={isMobile}  
      />
    </Box>
  );
}
