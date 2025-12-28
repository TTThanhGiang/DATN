import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Rating,
  TextField,
  Box
} from "@mui/material";
import { useState, useEffect } from "react";
import api from "../../../api";
import { getToken } from "../../../utils/auth";

export default function FormDanhGia({ mo, dong, sanPham }) {
  const [soSao, setSoSao] = useState(0);
  const [binhLuan, setBinhLuan] = useState("");
  const token = getToken();

  // Hook luôn phải nằm TRÊN cùng
  useEffect(() => {
    if (mo) {
      setSoSao(0);
      setBinhLuan("");
    }
  }, [mo]);

  const xuLyGuiDanhGia = async () => {
    if (!soSao) {
      alert("Vui lòng chọn số sao!");
      return;
    }

    const duLieu = {
      ma_san_pham: sanPham?.ma_san_pham,
      so_sao: soSao,
      binh_luan: binhLuan
    };

    try {
      const res = await api.post(`/users/gui-danh-gia`, duLieu, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(res.data.message);
      dong();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Lỗi kết nối server!");
      }
    }
  };

  // Chỉ chặn RENDER JSX (KHÔNG return trước hooks)
  if (!mo || !sanPham) {
    return <></>; // JSX trống, KHÔNG gây lỗi hook
  }

  return (
    <Dialog open={mo} onClose={dong} maxWidth="sm" fullWidth>
      <DialogTitle>Đánh giá sản phẩm</DialogTitle>

      <DialogContent>
        <Typography variant="h6">{sanPham.ten_san_pham}</Typography>

        <Box textAlign="center" mt={1}>
          <img
            src={sanPham.hinh_anhs}
            alt={sanPham.ten_san_pham}
            width={120}
            style={{ borderRadius: 8 }}
          />
        </Box>

        <Rating
          size="large"
          value={soSao}
          onChange={(e, value) => setSoSao(value)}
          sx={{ my: 2 }}
        />

        <TextField
          multiline
          rows={3}
          fullWidth
          placeholder="Nhận xét của bạn..."
          value={binhLuan}
          onChange={(e) => setBinhLuan(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={dong}>Hủy</Button>
        <Button variant="contained" color="primary" onClick={xuLyGuiDanhGia}>
          Gửi đánh giá
        </Button>
      </DialogActions>
    </Dialog>
  );
}
