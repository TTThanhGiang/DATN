import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
  Button
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import React, { useState } from "react";

export default function HopThoaiDoiMatKhau({ mo, dong, xuLyDoiMatKhau }) {
  const [matKhauCu, setMatKhauCu] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");

  const [hienMatKhauCu, setHienMatKhauCu] = useState(false);
  const [hienMatKhauMoi, setHienMatKhauMoi] = useState(false);
  const [hienXacNhanMatKhau, setHienXacNhanMatKhau] = useState(false);

  const handleDoiMatKhau = () => {
    if (!matKhauCu || !matKhauMoi || !xacNhanMatKhau) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (matKhauMoi !== xacNhanMatKhau) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    xuLyDoiMatKhau({
      matKhauCu,
      matKhauMoi,
    });
    setMatKhauCu("");
    setMatKhauMoi("");
    setXacNhanMatKhau("");
  };

  return (
    <Dialog open={mo} onClose={dong} fullWidth maxWidth="sm">
      <DialogTitle>Đổi mật khẩu</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        
        {/* Mật khẩu cũ */}
        <TextField
          label="Mật khẩu cũ"
          type={hienMatKhauCu ? "text" : "password"}
          fullWidth
          margin="normal"
          value={matKhauCu}
          onChange={(e) => setMatKhauCu(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setHienMatKhauCu(!hienMatKhauCu)}>
                  {hienMatKhauCu ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* Mật khẩu mới */}
        <TextField
          label="Mật khẩu mới"
          type={hienMatKhauMoi ? "text" : "password"}
          fullWidth
          margin="normal"
          value={matKhauMoi}
          onChange={(e) => setMatKhauMoi(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setHienMatKhauMoi(!hienMatKhauMoi)}>
                  {hienMatKhauMoi ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* Xác nhận mật khẩu */}
        <TextField
          label="Xác nhận mật khẩu"
          type={hienXacNhanMatKhau ? "text" : "password"}
          fullWidth
          margin="normal"
          value={xacNhanMatKhau}
          onChange={(e) => setXacNhanMatKhau(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setHienXacNhanMatKhau(!hienXacNhanMatKhau)}>
                  {hienXacNhanMatKhau ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

      </DialogContent>

      <DialogActions>
        <Button onClick={dong}>Hủy</Button>
        <Button variant="contained" onClick={handleDoiMatKhau}>
          Đổi mật khẩu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
