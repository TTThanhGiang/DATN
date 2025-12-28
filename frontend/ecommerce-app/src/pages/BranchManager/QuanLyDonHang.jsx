import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Stack, Button, Typography, TextField, Divider,
  Chip, Pagination, Grid, InputAdornment, IconButton, Dialog, 
  DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import PageWrapper from "../../components/PageWrapper";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { getToken } from "../../utils/auth";
import SanPhamDonHang from "../../components/User/Cart/SanPhamDonHang";
import { Search } from "@mui/icons-material";

export default function QuanLyDonHang() {
  const dieuHuong = useNavigate();
  const [danhSachDonHang, setDanhSachDonHang] = useState([]);
  const [tabDangChon, setTabDangChon] = useState(0);
  const [donHangDaChon, setDonHangDaChon] = useState(null);
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoLuong, setTongSoLuong] = useState(0);
  const [locTrangThai, setLocTrangThai] = useState("TAT_CA");
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [moDialogHuy, setMoDialogHuy] = useState(false);
  const [lyDoHuy, setLyDoHuy] = useState("");
  const gioiHan = 10;
  const token = getToken();

  const danhSachCanXuLy = useMemo(() => {
    return danhSachDonHang.filter((dh) => dh.trang_thai !== "HOAN_THANH" && dh.trang_thai !== "DA_HUY");
  }, [danhSachDonHang]);

  useEffect(() => {
    layDanhSachDonHang();
  }, [trangHienTai, locTrangThai]);

  const layDanhSachDonHang = async () => {
    try {
      const offset = (trangHienTai - 1) * gioiHan;
      const res = await api.get(`/manager/danh-sach-don-hang`, {
        params: {
          limit: gioiHan,
          offset,
          tu_khoa: tuKhoaTimKiem || undefined,
          trang_thai: locTrangThai
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDanhSachDonHang(res.data.data.items);
        setTongSoLuong(res.data.data.total);
      }
    } catch (loi) {
      console.log("Lỗi khi lấy danh sách đơn hàng", loi);
    }
  };

  const chuyenDoiTab = (_, giaTriMoi) => {
    setTabDangChon(giaTriMoi);
    if (giaTriMoi !== 2) setDonHangDaChon(null);
  };

  const chuyenDoiTrangThaiThanhToan = (trangThai) => {
    return trangThai === 'CHUA_THANH_TOAN' ? "Chưa thanh toán" : "Đã thanh toán";
  };

  const xuLyXem = (donHang) => {
    setDonHangDaChon(donHang);
    setTabDangChon(2);
  };

  const hienThiChipTrangThai = (trangThai) => {
    const cauHinh = {
      "CHO_XU_LY": { label: "Chờ xử lý", color: "warning" },
      "DA_XU_LY": { label: "Đã duyệt", color: "success" },
      "DA_HUY": { label: "Đã hủy", color: "error" },
      "HOAN_THANH": { label: "Hoàn thành", color: "primary" },
    };
    const status = cauHinh[trangThai] || { label: trangThai, color: "default" };
    return <Chip label={status.label} color={status.color} size="small" />;
  };

  const capNhatTrangThai = async (endpoint, payload = {}) => {
    try {
      const res = await api.put(`/manager/don-hang/${donHangDaChon.ma_don_hang}/${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert(res.data.message);
        setTabDangChon(0);
        setDonHangDaChon(null);
        layDanhSachDonHang();
      }
    } catch (e) {
      alert("Thao tác thất bại");
    }
  };

  const hienThiCacNutHanhDong = (trangThai) => {
    if (trangThai === "CHO_XU_LY") return (
      <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
        <Button variant="contained" color="success" onClick={() => capNhatTrangThai("duyet")}>Duyệt đơn</Button>
        <Button variant="outlined" color="error" onClick={() => setMoDialogHuy(true)}>Hủy đơn</Button>
      </Stack>
    );
    if (trangThai === "DA_XU_LY") return (
      <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
        <Button variant="contained" color="primary" onClick={() => capNhatTrangThai("hoan-thanh")}>Hoàn thành</Button>
        <Button variant="outlined" color="error" onClick={() => setMoDialogHuy(true)}>Hủy đơn</Button>
      </Stack>
    );
    return null;
  };

  const renderBangDonHang = (ds) => (
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã ĐH</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>SĐT</TableCell>
              <TableCell>Chi nhánh</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ds.map((dh) => (
              <TableRow key={dh.ma_don_hang} hover>
                <TableCell>#{dh.ma_don_hang}</TableCell>
                <TableCell>{dh.ho_ten}</TableCell>
                <TableCell>{dh.so_dien_thoai}</TableCell>
                <TableCell>{dh.ten_chi_nhanh}</TableCell>
                <TableCell>{dh.tong_tien.toLocaleString()}đ</TableCell>
                <TableCell>{hienThiChipTrangThai(dh.trang_thai)}</TableCell>
                <TableCell align="right">
                  <Button size="small" variant="contained" onClick={() => xuLyXem(dh)}>
                    Xem
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );

  return (
    <PageWrapper title="Quản lý đơn hàng">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabDangChon} onChange={chuyenDoiTab}>
          <Tab label="Danh sách đơn hàng" />
          <Tab label="Cần xử lý" />
          {donHangDaChon && <Tab label="Chi tiết đơn hàng" />}
        </Tabs>
      </Box>

      {tabDangChon === 0 && (
        <>
          <Paper elevation={0} sx={{ mb: 1, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Tìm đơn hàng"
                  placeholder="Nhập tên khách hàng hoặc số điện thoại..."
                  value={tuKhoaTimKiem}
                  onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setTrangHienTai(1);
                      layDanhSachDonHang();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={(e) => {
                          setTrangHienTai(1);
                          layDanhSachDonHang();
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
                    <option value="CHO_XU_LY">Chờ xử lý</option>
                    <option value="DA_XU_LY">Đã duyệt</option>
                    <option value="HOAN_THANH">Hoàn thành</option>
                    <option value="DA_HUY">Đã hủy</option>
                  </TextField>
              </Grid>
            </Grid>
          </Paper>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã ĐH</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>SĐT</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {danhSachDonHang.map((dh) => (
                  <TableRow key={dh.ma_don_hang} hover>
                    <TableCell>#{dh.ma_don_hang}</TableCell>
                    <TableCell>{dh.ho_ten}</TableCell>
                    <TableCell>{dh.so_dien_thoai}</TableCell>
                    <TableCell>{dh.tong_tien.toLocaleString()}đ</TableCell>
                    <TableCell>{hienThiChipTrangThai(dh.trang_thai)}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="contained" onClick={() => xuLyXem(dh)}>Xem</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack spacing={2} alignItems="center" sx={{ mt: 2, mb: 4 }}>
            <Pagination
              count={Math.ceil(tongSoLuong / gioiHan)}
              page={trangHienTai}
              onChange={(_, v) => setTrangHienTai(v)}
              color="primary"
              shape="rounded"
            />
          </Stack>
        </>
      )}

      {tabDangChon === 1 && (
        danhSachCanXuLy.length > 0 ? renderBangDonHang(danhSachCanXuLy) : 
        <Typography align="center" color="text.secondary" mt={4}>🎉 Không có đơn hàng cần xử lý</Typography>
      )}

      {tabDangChon === 2 && donHangDaChon && (
        <>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" mb={2}>👤 Thông tin khách hàng</Typography>
            <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
              <TextField label="Tên khách hàng" value={donHangDaChon.ho_ten} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Số điện thoại" value={donHangDaChon.so_dien_thoai} fullWidth InputProps={{ readOnly: true }} />
            </Stack>
            <Stack spacing={2} direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }}>
              <TextField label="Địa chỉ" value={donHangDaChon.dia_chi} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Thanh toán" value={chuyenDoiTrangThaiThanhToan(donHangDaChon.trang_thai_thanh_toan)} fullWidth InputProps={{ readOnly: true }} />
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" mb={2}>🛍️ Sản phẩm đã đặt</Typography>
            {donHangDaChon.chi_tiet.map((sanPham) => (
              <Box key={sanPham.ma_san_pham} sx={{ border: "1px solid #eee", borderRadius: 2, p: 2, mb: 2, cursor: "pointer", "&:hover": { background: "#f9f9f9" } }} onClick={() => dieuHuong(`/product/${sanPham.ma_san_pham}`)}>
                <SanPhamDonHang 
                  ten_san_pham={sanPham.ten_san_pham} 
                  gia_goc={sanPham.gia_goc}
                  gia_sau_giam={sanPham.gia_sau_giam} 
                  don_vi={sanPham.don_vi} 
                  hinh_anh={sanPham.hinh_anhs} 
                  so_luong={sanPham.so_luong} />
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            {donHangDaChon.tien_giam > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Giảm giá</Typography>
                <Typography color="error.main" fontWeight="500">-{donHangDaChon.tien_giam?.toLocaleString()} ₫</Typography>
              </Box>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">Tổng tiền:</Typography>
              <Typography fontWeight="bold" color="primary.main">{donHangDaChon.tong_tien.toLocaleString()}đ</Typography>
            </Stack>
          </Paper>
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            {hienThiCacNutHanhDong(donHangDaChon?.trang_thai)}
          </Stack>
        </>
      )}

      {/* Dialog Hủy */}
      <Dialog open={moDialogHuy} onClose={() => setMoDialogHuy(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Lý do hủy đơn</DialogTitle>
        <DialogContent>
          <TextField label="Nhập lý do" multiline rows={3} fullWidth value={lyDoHuy} onChange={(e) => setLyDoHuy(e.target.value)} sx={{ mt: 1 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button onClick={() => setMoDialogHuy(false)}>Thoát</Button>
            <Button color="error" variant="contained" onClick={() => { capNhatTrangThai("huy", { "ly_do": lyDoHuy }); setMoDialogHuy(false); }}>Xác nhận</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}