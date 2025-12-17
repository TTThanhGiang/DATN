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

export default function FormDanhGia({ open, onClose, sanPham }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const token = getToken();

  // Hook luôn phải nằm TRÊN cùng
  useEffect(() => {
    if (open) {
      setRating(0);
      setComment("");
    }
  }, [open]);

  const handleGuiDanhGia = async () => {
    if (!rating) {
      alert("Vui lòng chọn số sao!");
      return;
    }

    const payload = {
      ma_san_pham: sanPham?.ma_san_pham,
      so_sao: rating,
      binh_luan: comment
    };

    try {
      const res = await api.post(`/users/gui-danh-gia`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(res.data.message);
      onClose();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Lỗi kết nối server!");
    }
    }
  };

  // Chỉ chặn RENDER JSX (KHÔNG return trước hooks)
  if (!open || !sanPham) {
    return <></>; // JSX trống, KHÔNG gây lỗi hook
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
          value={rating}
          onChange={(e, value) => setRating(value)}
          sx={{ my: 2 }}
        />

        <TextField
          multiline
          rows={3}
          fullWidth
          placeholder="Nhận xét của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" color="primary" onClick={handleGuiDanhGia}>
          Gửi đánh giá
        </Button>
      </DialogActions>
    </Dialog>
  );
}
