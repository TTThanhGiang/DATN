import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItemButton, ListItemText, Stack, Typography, TextField,
} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function CategorySelectorModal({ open, onClose, categories, onSelect }) {
  const [search, setSearch] = useState("");


  // Lọc danh mục con
  // Hàm đệ quy lấy tất cả danh mục con
  const getLeafCategories = (categories) => {
    let result = [];

    for (const cat of categories) {
      // Nếu là danh mục con (không có thêm danh mục con bên trong)
      if (!cat.danh_muc_con || cat.danh_muc_con.length === 0) {
        result.push(cat);
      }

      // Nếu có danh mục con thì duyệt tiếp
      if (cat.danh_muc_con && cat.danh_muc_con.length > 0) {
        result = result.concat(getLeafCategories(cat.danh_muc_con));
      }
    }

    return result;
  };

  // Lọc theo search
  const allCategories = getLeafCategories(categories);
  const filteredCategories = allCategories.filter(cat =>
    cat.ten_danh_muc.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          sx={{ mb: 2 }}
        />
        <List>
          {filteredCategories.length ===0 ? (
            <Typography variant="body2" color="text.secondary">
              Không tìm thấy danh mục nào.
            </Typography>
          ) : (
            filteredCategories.map(cat => (
              <ListItemButton key={cat.ma_danh_muc} onClick={() => {onSelect(cat); onClose()}}>
                <ListItemText primary={cat.ten_danh_muc} />
              </ListItemButton>
            ))
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
      </DialogActions>
    </Dialog>
  )
}
