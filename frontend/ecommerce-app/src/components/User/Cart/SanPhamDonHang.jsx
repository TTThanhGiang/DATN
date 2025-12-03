import React from "react";
import { Box, Typography, IconButton, Button, Divider } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function SanPhamDonHang({
  name,
  pricePerKg,
  weight,
  image,
  quantity,
  onQuantityChange,
  onDelete,
}) {
  const handleIncrease = () => onQuantityChange(quantity + 1);
  const handleDecrease = () => onQuantityChange(quantity > 1 ? quantity - 1 : 0);
  const totalPrice = pricePerKg * quantity;

  return (
    <Box
      sx={{
        bgcolor: "white",
        p: 2,
        borderRadius: 2,
        mb: 2,
        boxShadow: 1,
        transition: "0.2s",
        "&:hover": { boxShadow: 3 },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            component="img"
            src={image}
            alt={name}
            sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "1px solid #eee" }}
          />
          <Box>
            <Typography fontWeight="bold">{quantity} x {name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {pricePerKg.toLocaleString()}đ/{weight}
            </Typography>
          </Box>
        </Box>

        <Typography fontWeight="bold" fontSize="18px">
          {totalPrice.toLocaleString()}đ
        </Typography>
      </Box>
    </Box>
  );
}
