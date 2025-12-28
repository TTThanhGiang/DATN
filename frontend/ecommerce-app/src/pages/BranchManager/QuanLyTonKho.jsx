import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import {
  Box,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  Paper,
  Stack,
  IconButton,
  OutlinedInput,
  TextField,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  Typography,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  Pagination,
  Chip,
  Grid,
  InputAdornment
} from "@mui/material";
import { EditOutlined, Search } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { getToken } from "../../utils/auth";
import api from "../../api";

export default function QuanLyTonKho() {
  const [tabHienTai, setTabHienTai] = useState(0);

  const [danhSachTonKho, setDanhSachTonKho] = useState([]);
  const [danhSachSanPham, setDanhSachSanPham] = useState([]);

  const [tonKhoDangSua, setTonKhoDangSua] = useState(null);
  const [soLuongSua, setSoLuongSua] = useState("");

  const [soLuongSanPham, setSoLuongSanPham] = useState({});

  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoLuong, setTongSoLuong] = useState(0);
  const gioiHan = 10;

  const maXacThuc = getToken();

  useEffect(() => {
    taiDanhSachSanPham();
  }, []);

  useEffect(() => {
    taiDuLieuTonKho();
  }, [trangHienTai]);

  const taiDuLieuTonKho = async () => {
    try {
      const offset = (trangHienTai - 1) * gioiHan;
      const phanHoi = await api.get(`/manager/danh-sach-ton-kho`, {
        params:{
          limit:gioiHan,
          offset,
          tu_khoa: tuKhoaTimKiem || undefined
        },
        headers: { Authorization: `Bearer ${maXacThuc}` }
      });
      console.log("Sản phẩm", phanHoi.data.data.total)
      if (phanHoi.data.success) {
        setDanhSachTonKho(phanHoi.data.data.items);
        setTongSoLuong(phanHoi.data.data.total);
      }
    } catch (err) {
      console.error("Lấy tồn kho thất bại", err);
    }
  };

  const taiDanhSachSanPham = async () => {
    try {
      const phanHoi = await api.get(`/users/tat-ca-san-pham`);
      if (phanHoi.data.success) setDanhSachSanPham(phanHoi.data.data);
    } catch (err) {
      console.error("Lấy danh sách sản phẩm thất bại", err);
    }
  };

  const xuLyThayDoiTab = (_, giaTri) => {
    setTabHienTai(giaTri);
    setTonKhoDangSua(null);
    setSanPhamDaChon([]);
    setSoLuongSanPham({});
    setSoLuongSua("");
    setLyDoNhap("");
  };

  const xuLyKhiClickSua = (sanPham) => {
    setTonKhoDangSua(sanPham);
    setSoLuongSua(sanPham.so_luong_ton);
    setTabHienTai(1); // Chuyển sang tab cập nhật
  };

  const xuLyCapNhatTonKho = async () => {
    if (!soLuongSua) {
      alert("Vui lòng nhập số lượng");
      return;
    }
    try {
      const ma_san_pham = tonKhoDangSua.ma_san_pham;
      const phanHoi = await api.put(`/manager/cap-nhat-ton-kho/${ma_san_pham}`, 
        { so_luong_ton: parseInt(soLuongSua) }, 
        { headers: { Authorization: `Bearer ${maXacThuc}` } }
      );
      if (phanHoi.data.success) {
        alert(phanHoi.data.message);
        taiDuLieuTonKho();
        setTonKhoDangSua(null);
        setSoLuongSua("");
        setTabHienTai(0);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Cập nhật thất bại!");
    }
  };

  // Chọn nhiều sản phẩm gửi yêu cầu
  const xuLyChonSanPham = (sanPham) => {
    setSanPhamDaChon(truoc => {
      const tonTai = truoc.find(p => p.ma_san_pham === sanPham.ma_san_pham);
      const soLuongMoi = { ...soLuongSanPham };
      if (tonTai) {
        // bỏ chọn
        const danhSachCapNhat = truoc.filter(p => p.ma_san_pham !== sanPham.ma_san_pham);
        delete soLuongMoi[sanPham.ma_san_pham];
        setSoLuongSanPham(soLuongMoi);
        return danhSachCapNhat;
      }
      // thêm mới
      soLuongMoi[sanPham.ma_san_pham] = 1;
      setSoLuongSanPham(soLuongMoi);
      return [...truoc, sanPham];
    });
  };


  return (
    <PageWrapper title="Quản lý tồn kho">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabHienTai} onChange={xuLyThayDoiTab}>
          <Tab label="Danh sách hàng tồn kho" />
          {tonKhoDangSua && (<Tab label="Cập nhật tồn kho" />)}
        </Tabs>
      </Box>

      {/* --- Tab 0: Danh sách tồn kho --- */}
      {tabHienTai === 0 && (
        <Box>
          <Paper elevation={0} sx={{ mb: 1, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Tìm sản phẩm"
                  placeholder="Nhập tên sản phẩm..."
                  value={tuKhoaTimKiem}
                  onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setTrangHienTai(1);
                      taiDuLieuTonKho();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={(e) => {
                          setTrangHienTai(1);
                          taiDuLieuTonKho();
                        }}>
                        <Search />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #eee" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ảnh</TableCell>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell align="center">Số lượng</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {danhSachTonKho.map(item => (
                  <TableRow key={item.ma_san_pham} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={item.hinh_anhs?.[0]?.duong_dan || ""}
                        alt={item.ten_san_pham}
                        sx={{ width: 50, height: 50, objectFit: "cover", borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>{item.ten_san_pham}</TableCell>
                    <TableCell align="center">{item.so_luong_ton}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <IconButton color="primary" size="small" onClick={() => xuLyKhiClickSua(item)}>
                          <EditOutlined />
                        </IconButton>
                      </Stack>
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
                onChange={(_, giaTri) => setTrangHienTai(giaTri)}
                color="primary"
                shape="rounded"
              />
            </Stack>
        </Box>
      )}

      {/* --- Tab 1: Cập nhật tồn kho --- */}
      {tabHienTai === 1 && tonKhoDangSua && (
        <Stack spacing={3}>
          <OutlinedInput fullWidth value={tonKhoDangSua.ten_san_pham} readOnly />
          <TextField
            fullWidth
            label="Số lượng"
            type="number"
            value={soLuongSua}
            onChange={e => setSoLuongSua(e.target.value)}
          />
          <Divider sx={{ my: 2 }} />
          <Stack justifyContent="center">
            <Button variant="contained" startIcon={<EditOutlined />} color="primary" onClick={xuLyCapNhatTonKho}>
              Lưu thay đổi
            </Button>
          </Stack>
        </Stack>
      )}

    </PageWrapper>
  );
}