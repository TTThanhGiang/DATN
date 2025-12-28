import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItemButton, ListItemText, Stack, Typography, TextField,
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function ModalChonDanhMuc({ mo, dong, danhSachDanhMuc, khiChon }) {
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  const danhMucLoc = danhSachDanhMuc.filter(dm =>
    dm.ten_danh_muc.toLowerCase().includes(tuKhoaTimKiem.toLowerCase())
  );

  return (
    <Dialog open={mo} onClose={dong} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" alignItems="center" gap={1}>
          <LocationOnIcon color="primary" />
          <Typography variant="h6">Chọn danh mục</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          placeholder="Tìm theo tên danh mục..."
          value={tuKhoaTimKiem}
          onChange={(e) => setTuKhoaTimKiem(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          sx={{ mb: 2 }}
        />

        <List>
          {danhMucLoc.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Không tìm thấy danh mục nào.
            </Typography>
          ) : (
            danhMucLoc.map(dm => (
              <ListItemButton key={dm.ma_danh_muc} onClick={() => { khiChon(dm); dong(); }}>
                <ListItemText primary={dm.ten_danh_muc} />
              </ListItemButton>
            ))
          )}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={dong}>Hủy</Button>
      </DialogActions>
    </Dialog>
  )
}
