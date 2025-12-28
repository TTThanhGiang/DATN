import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, IconButton, Typography, Button, Divider, Chip, Rating, Pagination, Grid, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import PageWrapper from "../../components/PageWrapper";
import { EditOutlined, DeleteOutlined, CheckCircleOutline, CancelOutlined, Search } from "@mui/icons-material";
import api from "../../api";
import { getToken } from "../../utils/auth";

export default function QuanLyDanhGia() {
  const [danhGiaDangChon, setDanhGiaDangChon] = useState(null);
  const [tabDangChon, setTabDangChon] = useState(0);

  const [tong, setTong] = useState(0);
  const[page, setPage] = useState(1);
  const limit = 10;
  const token = getToken();
  const [danhSachDanhGia, setDanhSachDanhGia] = useState([]);

  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [locTrangThai, setLocTrangThai] = useState("TAT_CA");

  useEffect(() => {
    layDanhSachDanhGia();
  }, [page, locTrangThai]);

  const layDanhSachDanhGia = async () =>{
    try{
      const offset = (page - 1) * limit;
      const res = await api.get(`/admins/danh-sach-danh-gia`, {
        params:{
          limit,
          offset,
          tu_khoa: tuKhoaTimKiem || undefined,
          trang_thai: locTrangThai
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if(res.data.success){
        setDanhSachDanhGia(res.data.data.items);
        setTong(res.data.data.total);
      }
    }catch(loi){
      console.log("Lỗi khi lấy đánh giá", loi);
    }
  }

  const xuLyDoiTab  = (_, giaTriMoi) => setTabDangChon(giaTriMoi);

  const xuLyChonDanhGia  = (danhGia) => {
    setDanhGiaDangChon(danhGia);
    setTabDangChon(1);
  };

  const xuLyDuyetDanhGia = async () => {
    try{
      const res = await api.put(`/admins/duyet-danh-gia/${danhGiaDangChon.ma_danh_gia}`,{}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if(res.data.success){
        alert("Duyệt đánh giá thành công!");
        setTabDangChon(0);
        layDanhSachDanhGia();
      }
        

    }catch(loi){
      alert(loi.res?.data?.message || loi.message || "Duyệt đánh giá thất bại");
    }
  }

  const xuLyTuChoiDanhGia = async () => {
    try{
      const res = await api.put(`/admins/tu-choi-danh-gia/${danhGiaDangChon.ma_danh_gia}`,{},{
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if(res.data.success){
        alert("Đã từ chối đánh giá!")
        setTabDangChon(0);
        layDanhSachDanhGia();
      }
        
    }catch(loi){
      alert(loi.res?.data?.message || loi.message || "Từ chối đánh giá thất bại");
    }
  }

  const xuLyXoaDanhGia  = (id) => {
    setDanhSachDanhGia((truocDo ) => truocDo .filter((r) => r.id !== id));
  };

  return (
    <PageWrapper title="Quản lý đánh giá">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabDangChon} onChange={xuLyDoiTab}>
          <Tab label="Danh sách đánh giá" />
          {danhGiaDangChon && <Tab label="Duyệt đánh giá" />}
        </Tabs>
      </Box>

      {tabDangChon === 0 && (
        <>
          <Paper elevation={0} sx={{ mb: 1, borderRadius: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    label="Tìm đánh giá"
                    placeholder="Nhập tên khách hàng hoặc tên sản phẩm..."
                    value={tuKhoaTimKiem}
                    onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setPage(1);
                        layDanhSachDanhGia();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={(e) => {
                            setPage(1);
                            layDanhSachDanhGia();
                          }}>
                          <Search />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>                
                <Grid size={{ xs: 12, md: 4 }}>                  
                  <TextField
                    label="Trạng thái"
                    name="trang_thai"
                    select
                    onChange={(e) => { setLocTrangThai(e.target.value); setTrangHienTai(1); }}
                    fullWidth
                    SelectProps={{ native: true }}
                    value={locTrangThai}
                    
                  >
                    <option value="TAT_CA">Tất cả trạng thái</option>
                    <option value="CHO_XU_LY">Chờ duyệt</option>
                    <option value="DA_DUYET">Đã duyệt</option>
                    <option value="DA_HUY">Đã từ chối</option>
                  </TextField>
                </Grid>
              </Grid>
          </Paper>
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #eee" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" width={60}>ID</TableCell>
                  <TableCell>Ngày đánh giá</TableCell>
                  <TableCell>Ảnh</TableCell>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell>Người đánh giá</TableCell>
                  <TableCell>Đánh giá</TableCell>
                  <TableCell>Bình luận</TableCell>
                  <TableCell>Trạng thái</TableCell>
                
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {danhSachDanhGia.map((r) => (
                  <TableRow key={r.ma_danh_gia} hover>
                    <TableCell align="center">{r.ma_danh_gia}</TableCell>
                    <TableCell>{r.ngay_danh_gia}</TableCell>
                    <TableCell>
                      <Box component="img" src={r.hinh_anh} alt={r.ten_san_pham} sx={{ width: 50, height: 50, borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>{r.ten_san_pham}</TableCell>
                    <TableCell>{r.ten_nguoi_dung}</TableCell>
                    <TableCell><Rating value={r.so_sao} readOnly size="small" /></TableCell>
                    <TableCell><Typography variant="body2">{r.binh_luan}</Typography></TableCell>
                    <TableCell>{r.trang_thai === "DA_DUYET" ? <Chip label="Đã duyệt" color="success" size="small" /> : r.trang_thai === "DA_HUY" ? <Chip label="Từ chối" color="error" size="small" /> : <Chip label="Chờ duyệt" color="warning" size="small" />}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton color="primary" size="small" onClick={() => xuLyChonDanhGia(r)}>
                          <EditOutlined />
                        </IconButton>
                        <IconButton color="error" size="small" onClick={() => xuLyXoaDanhGia(r.ma_danh_gia)}>
                          <DeleteOutlined />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Stack spacing={2} alignItems="center" sx={{ mt: 2, mb: 4 }}>
              <Pagination
                count={Math.ceil(tong / limit)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
              </Stack>
          </TableContainer>
        </>
      )}

      {tabDangChon === 1 && danhGiaDangChon && (
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              Chi tiết & Duyệt đánh giá
            </Typography>
            <Chip 
              label={`ID: #${danhGiaDangChon.ma_danh_gia}`} 
              variant="outlined" 
              sx={{ fontWeight: "bold" }} 
            />
          </Stack>

          <Divider sx={{ mb: 4 }} />

          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "300px 1fr" }} gap={4}>
            {/* Cột trái: Thông tin sản phẩm */}
            <Box sx={{ textAlign: "center", p: 2, bgcolor: "#f9f9f9", borderRadius: 2 }}>
              <Box 
                component="img" 
                src={danhGiaDangChon.hinh_anh} 
                sx={{ width: "100%", maxWidth: 200, height: "auto", borderRadius: 2, mb: 2, boxShadow: 1 }} 
              />
              <Typography variant="subtitle1" fontWeight="bold">{danhGiaDangChon.ten_san_pham}</Typography>
              <Typography variant="body2" color="text.secondary">Danh mục: {danhGiaDangChon.ten_danh_muc || "N/A"}</Typography>
            </Box>

            {/* Cột phải: Nội dung đánh giá */}
            <Stack spacing={3}>
              <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ width: 45, height: 45, bgcolor: "primary.main", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                      {danhGiaDangChon.ten_nguoi_dung?.charAt(0)}
                  </Box>
                  <Box>
                      <Typography fontWeight="bold">{danhGiaDangChon.ten_nguoi_dung}</Typography>
                      <Typography variant="caption" color="text.secondary">Ngày đánh giá: {danhGiaDangChon.ngay_danh_gia || "Vừa xong"}</Typography>
                  </Box>
                </Stack>
                
                <Rating value={danhGiaDangChon.so_sao} readOnly sx={{ mb: 1 }} />
                
                <Typography variant="body1" sx={{ fontStyle: "italic", color: "text.primary", bgcolor: "#fffbe6", p: 2, borderRadius: 1, borderLeft: "4px solid #ffe58f" }}>
                  "{danhGiaDangChon.binh_luan}"
                </Typography>
              </Box>

              {/* Khu vực phản hồi hoặc ghi chú nội bộ (nếu cần) */}
              <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Lưu ý: Sau khi duyệt, đánh giá sẽ hiển thị công khai trên website.
              </Typography>

              {/* Nút thao tác */}
              <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                {danhGiaDangChon.trang_thai === "CHO_DUYET" ? (
                  <>
                    <Button 
                      variant="contained" 
                      color="success" 
                      fullWidth
                      size="large"
                      startIcon={<CheckCircleOutline />}
                      onClick={xuLyDuyetDanhGia}
                      sx={{ borderRadius: 2, py: 1.5 }}
                    >
                      Chấp nhận đánh giá
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      color="error" 
                      fullWidth
                      size="large"
                      startIcon={<CancelOutlined />}
                      onClick={xuLyTuChoiDanhGia}
                      sx={{ borderRadius: 2, py: 1.5 }}
                    >
                      Từ chối đánh giá
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="contained" 
                    fullWidth
                    disabled // Không cho click
                    size="large"
                    color={danhGiaDangChon.trang_thai === "DA_DUYET" ? "success" : "error"}
                    startIcon={danhGiaDangChon.trang_thai === "DA_DUYET" ? <CheckCircleOutline /> : <CancelOutlined />}
                    sx={{ 
                      borderRadius: 2, 
                      py: 1.5,
                      "&.Mui-disabled": {
                        bgcolor: danhGiaDangChon.trang_thai === "DA_DUYET" ? "success.light" : "error.light",
                        color: "white"
                      }
                    }}
                  >
                    {danhGiaDangChon.trang_thai === "DA_DUYET" ? "Đã chấp nhận đánh giá" : "Đã từ chối đánh giá"}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        </Paper>
      )}
    </PageWrapper>
  );
}
