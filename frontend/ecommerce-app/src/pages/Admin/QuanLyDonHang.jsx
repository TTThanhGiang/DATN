import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Button,
  Typography,
  TextField,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Pagination,
  Grid,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  Select,
  MenuItem
} from "@mui/material";
import PageWrapper from "../../components/PageWrapper";
import CartItem from "../../components/User/Cart/GioHangItem";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { getToken } from "../../utils/auth";
import SanPhamDonHang from "../../components/User/Cart/SanPhamDonHang";

import { Search } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function QuanLyDonHang() {
  const dieuHuong = useNavigate();
  const [danhSachDonHang, setDanhSachDonHang] = useState([]);
  const [danhSachChiNhanh, setDanhSachChiNhanh] = useState([]);

  const [tabDangChon, setTabDangChon] = useState(0);
  const [donHangDaChon, setDonHangDaChon] = useState(null);
  const [chiNhanhDangChon, setChiNhanhDangChon] = useState(null);

  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoLuong, setTongSoLuong] = useState(0);
  const gioiHan = 10;

  const [moDialogHuy, setMoDialogHuy] = useState(false);
  const [moDialogChiNhanh, setMoDialogChiNhanh] = useState(false);
  
  const [timChiNhanh, setTimChiNhanh] = useState("");
  const [lyDoHuy, setLyDoHuy] = useState("");

  const [locTrangThai, setLocTrangThai] = useState("TAT_CA");

  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  const token = getToken();

  const danhSachCanXuLy = useMemo(() => {
    return danhSachDonHang.filter(
      (dh) => dh.trang_thai !== "HOAN_THANH"
    );
  }, [danhSachDonHang]);

  const chuyenDoiTab = (_, giaTriMoi) => {
    setTabDangChon(giaTriMoi);

    if (giaTriMoi !== 2) {
      setDonHangDaChon(null);
    }
  };

  const chuyenDoiTrangThaiThanhToan = (trangThai) => {
    let trang_thai_hien_thi;
    if (trangThai === 'CHUA_THANH_TOAN')
      return trang_thai_hien_thi = "Chưa thanh toán";
    return trang_thai_hien_thi = "Đã thanh toán";
  }

  const xuLyXem = (donHang) => {
    setDonHangDaChon(donHang);
    setTabDangChon(2);
  };

  useEffect(() => {
    layDanhSachChiNhanh();
  }, []);

  useEffect(() => {
    layDanhSachDonHang();
  }, [trangHienTai, chiNhanhDangChon, locTrangThai]);


  const layDanhSachDonHang = async () => {
    try {
      const offset = (trangHienTai - 1) * gioiHan; 
      const res = await api.get(`/admins/danh-sach-don-hang`, {
        params: {
          limit: gioiHan,
          offset,
          tu_khoa: tuKhoaTimKiem || undefined,
          ma_chi_nhanh: chiNhanhDangChon?.ma_chi_nhanh || undefined,
          trang_thai: locTrangThai
        },
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setDanhSachDonHang(res.data.data.items);
        setTongSoLuong(res.data.data.total);
      }
    } catch (loi) {
      console.log("Lỗi khi lấy danh sách đơn hàng", loi);
    }
  }
  const layDanhSachChiNhanh = async () => {
      const res = await api.get("/admins/danh-sach-chi-nhanh", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setDanhSachChiNhanh(res.data.data);
    };

  const chiNhanhLoc = danhSachChiNhanh.filter(
    (b) =>
      b.ten_chi_nhanh.toLowerCase().includes(timChiNhanh.toLowerCase()) ||
      b.dia_chi.toLowerCase().includes(timChiNhanh.toLowerCase())
  );

  const hienThiChipTrangThai = (trangThai) => {
    const mapBackendToFrontend = {
      "CHO_XU_LY": "pending",
      "DA_XU_LY": "approved",
      "DA_HUY": "rejected",
      "HOAN_THANH": "completed", // thêm trạng thái hoàn thành
    };

    const trangThaiGiaoDien = mapBackendToFrontend[trangThai] || "pending"; // default fallback

    // Map frontend key sang label & color
    const danhSachTrangThai = {
      pending: { label: "Chờ xử lý", color: "warning" },
      approved: { label: "Đã duyệt", color: "success" },
      rejected: { label: "Đã hủy", color: "error" },
      completed: { label: "Hoàn thành", color: "primary" }, // thêm màu cho hoàn thành
    };

    return <Chip label={danhSachTrangThai[trangThaiGiaoDien].label} color={danhSachTrangThai[trangThaiGiaoDien].color} size="small" />;
  };

  const xuLyDuyet = async () => {
    const ma_don_hang = donHangDaChon.ma_don_hang;
    const res = await api.put(`/admins/don-hang/${ma_don_hang}/duyet`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data.success) {
      alert(res.data.message);
      setTabDangChon(0);
      setDonHangDaChon(null);
      layDanhSachDonHang();
    } else (
      alert(res.data.message)
    )
  };

  const xuLyHoanThanh = async () => {
    const ma_don_hang = donHangDaChon.ma_don_hang;
    const res = await api.put(`/admins/don-hang/${ma_don_hang}/hoan-thanh`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data.success) {
      alert(res.data.message);
      setTabDangChon(0);
      setDonHangDaChon(null);
      layDanhSachDonHang();
    } else (
      alert(res.data.message)
    )
  };

  const xuLyHuy = async () => {
    const ma_don_hang = donHangDaChon.ma_don_hang;
    const res = await api.put(`/admins/don-hang/${ma_don_hang}/huy`, { "ly_do": lyDoHuy }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data.success) {
      alert(res.data.message);
      setTabDangChon(0);
      setDonHangDaChon(null);
      layDanhSachDonHang();
    } else (
      alert(res.data.message)
    )
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

  const hienThiCacNutHanhDong = (trangThai) => {
    switch (trangThai) {
      case "CHO_XU_LY":
        return (
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            <Button
              variant="contained"
              color="success"
              onClick={() => xuLyDuyet()}
            >
              Duyệt đơn
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={() => setMoDialogHuy(true)}
            >
              Hủy đơn
            </Button>
          </Stack>
        );

      case "DA_XU_LY":
        return (
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => xuLyHoanThanh()}
            >
              Hoàn thành
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={() => setMoDialogHuy(true)}
            >
              Hủy đơn
            </Button>
          </Stack>
        );

      case "HOAN_THANH":
        return (
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            <Button
              variant="contained"
              color="primary"
              disabled
            >
              Hoàn thành
            </Button>
          </Stack>
        );
      case "DA_HUY":
        return (
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            <Button
              variant="outlined"
              color="error"
              disabled
            >
              Đã hủy
            </Button>
          </Stack>
        );

      default:
        return null;
    }
  };


  return (
    <PageWrapper title="Quản lý đơn hàng">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabDangChon} onChange={chuyenDoiTab}>
          <Tab label="Danh sách đơn hàng" />
          <Tab label="Cần xử lý"/>
          {donHangDaChon && <Tab label="Chi tiết đơn hàng" />}
        </Tabs>
      </Box>


      {tabDangChon === 0 && (
        <>
          <Paper elevation={0} sx={{ mb: 1, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
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
                <FormControl fullWidth>
                  <InputLabel>Chi nhánh</InputLabel>
                  <OutlinedInput
                    label="Chi nhánh"
                    value={
                      chiNhanhDangChon
                        ? chiNhanhDangChon.ten_chi_nhanh
                        : "Tất cả chi nhánh"
                    }
                    readOnly
                    endAdornment={
                      <IconButton onClick={() => setMoDialogChiNhanh(true)}>
                        <ArrowDropDownIcon />
                      </IconButton>
                    }
                    onClick={() => setMoDialogChiNhanh(true)}
                  />
                </FormControl>
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
          {renderBangDonHang(danhSachDonHang)}
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
        danhSachCanXuLy.length > 0 ? (
          renderBangDonHang(danhSachCanXuLy)
        ) : (
          <Typography align="center" color="text.secondary" mt={4}>
            🎉 Không có đơn hàng cần xử lý
          </Typography>
        )
      )}

      {tabDangChon === 2 && donHangDaChon && (
        <>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" mb={2}>
              👤 Thông tin khách hàng
            </Typography>
            <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
              <TextField label="Tên khách hàng" value={donHangDaChon.ho_ten} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Số điện thoại" value={donHangDaChon.so_dien_thoai} fullWidth InputProps={{ readOnly: true }} />
            </Stack>
            <Stack spacing={2} direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }}>
              <TextField label="Địa chỉ" value={donHangDaChon.dia_chi} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Thanh toán" value={chuyenDoiTrangThaiThanhToan(donHangDaChon.trang_thai_thanh_toan)} fullWidth InputProps={{ readOnly: true }} />
            </Stack>
            <Stack spacing={2} direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }}>
              <TextField label="Chi nhánh nhận hàng" value={donHangDaChon.ten_chi_nhanh} fullWidth InputProps={{ readOnly: true }} ></TextField>
            </Stack>
            
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" mb={2}>
              🛍️ Sản phẩm đã đặt
            </Typography>
            {donHangDaChon.chi_tiet.map((sanPham) => (
              <Box
                key={sanPham.ma_san_pham}
                sx={{ border: "1px solid #eee", borderRadius: 2, p: 2, mb: 2, cursor: "pointer", "&:hover": { background: "#f9f9f9" } }}
                onClick={() => dieuHuong(`/product/${sanPham.ma_san_pham}`)}
              >
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
            {donHangDaChon.tien_giam && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Giảm giá</Typography>
              <Typography color="error.main" fontWeight="500">-{donHangDaChon.tien_giam?.toLocaleString()} ₫</Typography>
            </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">Tổng tiền:</Typography>
              <Typography fontWeight="bold" color="primary.main">
                {donHangDaChon.tong_tien.toLocaleString()}đ
              </Typography>
            </Stack>
          </Paper>
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            {hienThiCacNutHanhDong(donHangDaChon?.trang_thai)}
          </Stack>
        </>
      )}
      {/* Dialog Hủy */}
      {moDialogHuy && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <Paper sx={{ p: 3, width: 400, borderRadius: 2 }}>
            <Typography fontWeight="bold" mb={2}>Lý do hủy đơn</Typography>
            <TextField
              label="Nhập lý do"
              multiline
              rows={3}
              fullWidth
              value={lyDoHuy}
              onChange={(e) => setLyDoHuy(e.target.value)}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button onClick={() => setMoDialogHuy(false)}>Thoát</Button>
              <Button
                color="error"
                variant="contained"
                onClick={() => {
                  xuLyHuy();
                  setMoDialogHuy(false);
                }}
              >Xác nhận</Button>
            </Stack>
          </Paper>
        </Box>
      )}
      {/* ================= DIALOG CHI NHÁNH ================= */}
      <Dialog open={moDialogChiNhanh} onClose={() => setMoDialogChiNhanh(false)} fullWidth>
        <DialogTitle>Chọn chi nhánh</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Tìm kiếm..."
            value={timChiNhanh}
            onChange={(e) => setTimChiNhanh(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon /> }}
            sx={{ mb: 2 }}
          />
          {tabDangChon === 0 && (
            <>
              <ListItemButton  onClick={() => {
                    setChiNhanhDangChon(null);
                    setMoDialogChiNhanh(false);
                  }}>
                <ListItemText
                  primary="Tất cả chi nhánh"
                  secondary="Hiển thị toàn bộ đơn hàng"

                />
              </ListItemButton>
              <Divider />
            </>
          )}
          <List>
            {chiNhanhLoc.map((b) => (
              <React.Fragment key={b.ma_chi_nhanh}>
                <ListItemButton
                  onClick={() => {
                    setChiNhanhDangChon(b);
                    setMoDialogChiNhanh(false);
                  }}
                >
                  <ListItemText primary={b.ten_chi_nhanh} secondary={b.dia_chi} />
                </ListItemButton>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}