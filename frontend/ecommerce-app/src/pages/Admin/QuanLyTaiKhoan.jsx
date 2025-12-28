import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  InputAdornment,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  OutlinedInput,
  Pagination,
} from "@mui/material";
import {
  AddCircleOutline,
  LockOutlined,
  LockOpenOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import PageWrapper from "../../components/PageWrapper";
import api from "../../api";
import { getToken } from "../../utils/auth";

export default function QuanLyTaiKhoan() {
  /* ================= STATE ================= */
  const [tabDangChon, setTabDangChon] = useState(0);

  const [danhSachNguoiDung, setDanhSachNguoiDung] = useState([]);
  const [danhSachChiNhanh, setDanhSachChiNhanh] = useState([]);

  const [vaiTroDangChon, setVaiTroDangChon] = useState("tatca");
  const [chiNhanhDangChon, setChiNhanhDangChon] = useState(null);

  const [tongSo, setTongSo] = useState(0);
  const [trang, setTrang] = useState(1);
  const limit = 10;

  const [moDialogChiNhanh, setMoDialogChiNhanh] = useState(false);
  const [timChiNhanh, setTimChiNhanh] = useState("");

  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [hienXacNhanMatKhau, setHienXacNhanMatKhau] = useState(false);

  const token = getToken();

  const [duLieuForm, setDuLieuForm] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    mat_khau: "",
    nhap_lai_mat_khau: "",
    vai_tro: "",
    ma_chi_nhanh: null,
  });

  /* ================= CONST ================= */
  const MAP_VAI_TRO = {
    QUAN_LY: "Quản lý",
    QUAN_TRI_VIEN: "Quản trị viên",
    NHAN_VIEN: "Nhân viên",
    KHACH_HANG: "Khách hàng",
  };

  const DANH_SACH_VAI_TRO_LOC = [
    { value: "tatca", label: "Tất cả vai trò" },
    { value: "KHACH_HANG", label: "Khách hàng" },
    { value: "NHAN_VIEN", label: "Nhân viên" },
    { value: "QUAN_LY", label: "Quản lý chi nhánh" },
    { value: "QUAN_TRI_VIEN", label: "Quản trị viên" },
  ];

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (tabDangChon === 0) {
      layDanhSachNguoiDung();
    }
  }, [trang, vaiTroDangChon, chiNhanhDangChon, tabDangChon]);

  useEffect(() => {
    layDanhSachChiNhanh();
  }, []);

  const layDanhSachNguoiDung = async () => {
    const offset = (trang - 1) * limit;

    const res = await api.get("/admins/danh-sach-nguoi-dung", {
      params: {
        limit,
        offset,
        vai_tro: vaiTroDangChon !== "tatca" ? vaiTroDangChon : undefined,
        ma_chi_nhanh:
          vaiTroDangChon !== "KHACH_HANG"
            ? chiNhanhDangChon?.ma_chi_nhanh
            : undefined,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      setDanhSachNguoiDung(res.data.data.items);
      setTongSo(res.data.data.total);
    }
  };

  const layDanhSachChiNhanh = async () => {
    const res = await api.get("/admins/danh-sach-chi-nhanh", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.success) setDanhSachChiNhanh(res.data.data);
  };

  /* ================= HANDLER ================= */
  const doiTab = (_, value) => {
    setTabDangChon(value);
    setTrang(1);
    setVaiTroDangChon("tatca");
    setChiNhanhDangChon(null);
  };

  const handleChangeVaiTro = (value) => {
    setVaiTroDangChon(value);
    setTrang(1);
    if (value === "KHACH_HANG") setChiNhanhDangChon(null);
  };

  const khoaMoTaiKhoan = async (nd) => {
    const url =
      nd.trang_thai === "Đang hoạt động"
        ? `/admins/khoa-tai-khoan/${nd.ma_nguoi_dung}`
        : `/admins/mo-khoa-tai-khoan/${nd.ma_nguoi_dung}`;

    const res = await api.put(url, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) layDanhSachNguoiDung();
  };

  const xuLyTaoTaiKhoan = async () => {
    if (duLieuForm.mat_khau !== duLieuForm.nhap_lai_mat_khau) {
      alert("Mật khẩu không khớp");
      return;
    }

    const payload = {
      ...duLieuForm,
      ma_chi_nhanh:
        ["NHAN_VIEN", "QUAN_LY"].includes(duLieuForm.vai_tro)
          ? duLieuForm.ma_chi_nhanh
          : null,
    };

    const res = await api.post("/admins/them-nguoi-dung", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      alert("Tạo tài khoản thành công");
      setTabDangChon(0);
      layDanhSachNguoiDung();
    }
  };

  const chiNhanhLoc = danhSachChiNhanh.filter(
    (b) =>
      b.ten_chi_nhanh.toLowerCase().includes(timChiNhanh.toLowerCase()) ||
      b.dia_chi.toLowerCase().includes(timChiNhanh.toLowerCase())
  );

  /* ================= RENDER ================= */
  return (
    <PageWrapper title="Quản lý tài khoản">
      <Tabs value={tabDangChon} onChange={doiTab} sx={{ mb: 3 }}>
        <Tab label="Danh sách tài khoản" />
        <Tab label="Tạo tài khoản mới" />
      </Tabs>

      {/* ================= TAB DANH SÁCH ================= */}
      {tabDangChon === 0 && (
        <>
          <Paper elevation={0} sx={{ mb: 1, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Vai trò</InputLabel>
                  <Select
                    value={vaiTroDangChon}
                    label="Vai trò"
                    onChange={(e) => handleChangeVaiTro(e.target.value)}
                  >
                    {DANH_SACH_VAI_TRO_LOC.map((v) => (
                      <MenuItem key={v.value} value={v.value}>
                        {v.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth disabled={vaiTroDangChon === "KHACH_HANG"}>
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
            </Grid>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Chi nhánh</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {danhSachNguoiDung.map((nd) => (
                  <TableRow key={nd.ma_nguoi_dung}>
                    <TableCell>{nd.ho_ten}</TableCell>
                    <TableCell>{nd.email}</TableCell>
                    <TableCell>{nd.ten_chi_nhanh}</TableCell>
                    <TableCell>
                      <Chip label={MAP_VAI_TRO[nd.vai_tro]} color={ nd.vai_tro === 'QUAN_TRI_VIEN' ? 'error' : nd.vai_tro === 'QUAN_LY' ? 'primary' : nd.vai_tro === 'NHAN_VIEN' ? 'success' : 'default' } size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={nd.trang_thai}
                        color={nd.trang_thai === "Đang hoạt động" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => khoaMoTaiKhoan(nd)}>
                        {nd.trang_thai === "Đang hoạt động" ? (
                          <LockOutlined />
                        ) : (
                          <LockOpenOutlined />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Stack alignItems="center" sx={{ my: 2 }}>
              <Pagination
                page={trang}
                count={Math.ceil(tongSo / limit)}
                onChange={(_, p) => setTrang(p)}
                color="primary"
                shape="rounded"
              />
            </Stack>
          </TableContainer>
        </>
      )}

      {/* ================= TAB TẠO ================= */}
      {tabDangChon === 1 && (
        <Stack spacing={3}>
          <TextField label="Họ tên" onChange={(e) => setDuLieuForm({ ...duLieuForm, ho_ten: e.target.value })} />
          <TextField label="Email" onChange={(e) => setDuLieuForm({ ...duLieuForm, email: e.target.value })} />
          <TextField label="SĐT" onChange={(e) => setDuLieuForm({ ...duLieuForm, so_dien_thoai: e.target.value })} />

          <Autocomplete
            options={DANH_SACH_VAI_TRO_LOC.filter(v => v.value !== "tatca")}
            getOptionLabel={(o) => o.label}
            onChange={(_, v) =>
              setDuLieuForm({ ...duLieuForm, vai_tro: v?.value || "" })
            }
            renderInput={(params) => <TextField {...params} label="Vai trò" />}
          />

          {["NHAN_VIEN", "QUAN_LY"].includes(duLieuForm.vai_tro) && (
            <OutlinedInput
              readOnly
              value={chiNhanhDangChon?.ten_chi_nhanh || "Chọn chi nhánh"}
              onClick={() => setMoDialogChiNhanh(true)}
            />
          )}

          <TextField
            label="Mật khẩu"
            type={hienMatKhau ? "text" : "password"}
            onChange={(e) => setDuLieuForm({ ...duLieuForm, mat_khau: e.target.value })}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setHienMatKhau(!hienMatKhau)}>
                  {hienMatKhau ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />

          <TextField
            label="Nhập lại mật khẩu"
            type={hienXacNhanMatKhau ? "text" : "password"}
            onChange={(e) =>
              setDuLieuForm({ ...duLieuForm, nhap_lai_mat_khau: e.target.value })
            }
          />

          <Button variant="contained" startIcon={<AddCircleOutline />} onClick={xuLyTaoTaiKhoan}>
            Tạo tài khoản
          </Button>
        </Stack>
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
              <ListItemButton onClick={() => {
                setChiNhanhDangChon (null);
                setMoDialogChiNhanh(false);
              }}>
                <ListItemText
                  primary="Tất cả chi nhánh"
                  secondary="Hiển thị toàn bộ tài khoản"
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
                    setDuLieuForm({ ...duLieuForm, ma_chi_nhanh: b.ma_chi_nhanh });
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
