import React from "react";
import { Box, Typography, IconButton, Button, Divider } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function GioHangItem({
  tenSanPham,
  giaMotKg,
  khoiLuong,
  hinhAnh,
  soLuong,
  giaGocTong,   // Tổng tiền khi chưa giảm của hàng này
  giaSauGiam,   // Tổng tiền sau khi áp mã (null nếu không được giảm)
  khiThayDoiSoLuong,
  khiXoa,
}) {
  const tangSoLuong = () => khiThayDoiSoLuong(soLuong + 1);
  const giamSoLuong = () => khiThayDoiSoLuong(soLuong > 1 ? soLuong - 1 : 0);

  // Logic hiển thị giá: Nếu có giaSauGiam thì dùng nó, không thì dùng giaGocTong
  const hienThiGiaChinh = giaSauGiam !== null ? giaSauGiam : giaGocTong;

  return (
    <Box
      sx={{
        bgcolor: "white",
        p: 2,
        borderRadius: 2,
        mb: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "0.2s",
        "&:hover": { boxShadow: 3 },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            component="img"
            src={hinhAnh}
            alt={tenSanPham}
            sx={{ 
              width: 70, 
              height: 70, 
              objectFit: "cover", 
              borderRadius: 1.5, 
              border: "1px solid #f0f0f0" 
            }}
          />
          <Box>
            <Typography fontWeight="bold" sx={{ color: "#333", fontSize: "1rem" }}>
              {tenSanPham}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {giaMotKg?.toLocaleString()}đ / {khoiLuong}
            </Typography>
          </Box>
        </Box>

        {/* Khu vực hiển thị giá tiền */}
        <Box sx={{ textAlign: "right" }}>
          {giaSauGiam !== null && (
            <Typography 
              sx={{ 
                textDecoration: "line-through", 
                color: "text.disabled", 
                fontSize: "14px",
                display: "block" 
              }}
            >
              {giaGocTong?.toLocaleString()}đ
            </Typography>
          )}
          <Typography 
            fontWeight="bold" 
            sx={{ 
              fontSize: "18px", 
              color: giaSauGiam !== null ? "error.main" : "primary.main" 
            }}
          >
            {hienThiGiaChinh?.toLocaleString()}đ
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1.5, borderStyle: "dashed" }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          startIcon={<DeleteOutlineIcon />}
          color="error"
          size="small"
          sx={{ textTransform: "none", fontWeight: 500 }}
          onClick={khiXoa}
        >
          Xóa
        </Button>

        <Box 
          display="flex" 
          alignItems="center" 
          sx={{ 
            bgcolor: "#f5f7fa", 
            borderRadius: "20px", 
            px: 1,
            border: "1px solid #e0e0e0"
          }}
        >
          <IconButton size="small" onClick={giamSoLuong} sx={{ color: "primary.main" }}>
            <RemoveIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ mx: 1.5, minWidth: 25, textAlign: "center", fontWeight: "bold" }}>
            {soLuong}
          </Typography>
          <IconButton size="small" onClick={tangSoLuong} sx={{ color: "primary.main" }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}