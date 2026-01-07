import { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
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

} from '@mui/material';
import { AddCircleOutline, LockOutlined, LockOpenOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import PageWrapper from '../../components/PageWrapper';
import api from '../../api';
import { getToken } from '../../utils/auth';

export default function QuanLyNhanVien() {
  const [tabDangChon, setTabDangChon] = useState(0);
  const [danhSachNhanVien, setDanhSachNhanVien] = useState([]);
  const [hienThiMatKhau, setHienThiMatKhau] = useState(false);
  const [hienThiXacNhanMatKhau, setHienThiXacNhanMatKhau] = useState(false);
  const token = getToken();

  const xuLyDoiTab = (event, giaTriMoi) => {
    setTabDangChon(giaTriMoi);
    setDuLieuForm({
      ho_ten: "",
      email: "",
      mat_khau: "",
      nhap_lai_mat_khau: "",
      ma_chi_nhanh: "",
      vai_tro: "",
      so_dien_thoai: ""
    })
  };

  const xuLyThayDoi = (e) => {
    const { name, value } = e.target;
    setDuLieuForm((duLieuTruoc) => ({
      ...duLieuTruoc,
      [name]: value,
    }));
  }

  const [duLieuForm, setDuLieuForm] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    mat_khau: "",
    nhap_lai_mat_khau: "",
  })

  useEffect(() => {
    layDanhSachNhanVien();
  }, [])

  const layDanhSachNhanVien = async () => {
    try {
      const res = await api.get(`/manager/danh-sach-nhan-vien`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      })
      if (res.data.success) {
        setDanhSachNhanVien(res.data.data);
      } else {
        alert(res.data.message);
      }
    } catch (loi) {
      console.log("Lỗi khi lấy danh sách nhân viên", loi);
    }
  }

  const xuLyKhoaMoKhoaNguoiDung = async (nguoiDung) => {
    try {
      const ma_nguoi_dung = nguoiDung.ma_nguoi_dung;

      const url = nguoiDung.trang_thai
        ? `/manager/khoa-tai-khoan/${ma_nguoi_dung}`
        : `/manager/mo-khoa-tai-khoan/${ma_nguoi_dung}`;

      const res = await api.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert(res.data.message);
        layDanhSachNhanVien();
      }
    } catch (loi) {
      console.log("Lỗi khi xử lý khóa/mở khóa:", loi);
    }
  };

  const kiemTraEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const kiemTraSoDienThoai = (soDienThoai) => {
    const re = /^[0-9]{10,11}$/; // chỉ cho phép 9-12 chữ số
    return re.test(soDienThoai);
  };

  const xuLyGuiForm = async () => {
    const { ho_ten, email, so_dien_thoai, mat_khau, nhap_lai_mat_khau } = duLieuForm;

    if (!ho_ten || !email || !so_dien_thoai || !mat_khau || !nhap_lai_mat_khau) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (!kiemTraEmail(email)) {
      alert("Email không hợp lệ!");
      return;
    }
    if (!kiemTraSoDienThoai(so_dien_thoai)) {
      alert("Số điện thoại không hợp lệ! Chỉ bao gồm 9-12 chữ số.");
      return;
    }
    if (mat_khau !== nhap_lai_mat_khau) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }
    console.log(duLieuForm);
    try {
      const res = await api.post(
        `/manager/them-nhan-vien`,
        duLieuForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (res.data.success) {
        alert("Tạo người dùng thành công!");
        setTabDangChon(0);
        layDanhSachNhanVien();
      } else {
        alert(res.data.message || "Có lỗi xảy ra!");
      }
    } catch (loi) {
      const message = loi.response?.data?.detail || 
                      loi.response?.data?.message || 
                      "Đã có lỗi xảy ra, vui lòng thử lại";
      
      alert(message);

    }
  };

  return (
    <PageWrapper title="Quản lý nhân viên">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabDangChon} onChange={xuLyDoiTab} aria-label="user management tabs">
          <Tab label="Danh sách nhân viên" />
          <Tab label="Thêm nhân viên mới" />
        </Tabs>
      </Box>
      {/* --- TAB 1: DANH SÁCH --- */}
      {tabDangChon === 0 && (
        <Box sx={{ overflowX: 'auto', mt: 2 }}>
          <TableContainer component={Paper} sx={{ borderRadius: 0, boxShadow: 'none', width: '100%' }}>
            <Table sx={{ minWidth: '100%' }} aria-label="user table">
              <TableHead>
                <TableRow>
                  <TableCell>Tên đăng nhập</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {danhSachNhanVien.map((nguoiDung) => (
                  <TableRow key={nguoiDung.ma_nguoi_dung} hover>
                    <TableCell>{nguoiDung.ho_ten}</TableCell>
                    <TableCell>{nguoiDung.email}</TableCell>
                    <TableCell>{nguoiDung.so_dien_thoai}</TableCell>
                    <TableCell>
                      <Chip
                        label={nguoiDung.trang_thai ? "Đang hoạt đông" : "Đã khóa"}
                        color={
                          nguoiDung.trang_thai === true ? "success" : "error"
                        }
                        size='small'
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color={nguoiDung.trang_thai === true ? "error" : "success"}
                        size="small"
                        onClick={() => xuLyKhoaMoKhoaNguoiDung(nguoiDung)}
                      >
                        {nguoiDung.trang_thai === true ? (
                          <LockOutlined />      // đang kích hoạt → hiển thị icon LOCK
                        ) : (
                          <LockOpenOutlined />  // đang khóa → hiển thị icon UNLOCK
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {tabDangChon === 1 && (
        <Stack spacing={3}>
          <TextField label="Họ tên" type='text' name="ho_ten" value={duLieuForm.ho_ten} onChange={xuLyThayDoi} fullWidth />
          <TextField label="Email" type='email' name="email" value={duLieuForm.email} onChange={xuLyThayDoi} fullWidth />
          <TextField label="Số điện thoại" name="so_dien_thoai" value={duLieuForm.so_dien_thoai} onChange={xuLyThayDoi} fullWidth />
          <TextField label="Mật khẩu" type={hienThiMatKhau ? "text" : "password"} name="mat_khau" value={duLieuForm.mat_khau} onChange={xuLyThayDoi} fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setHienThiMatKhau(!hienThiMatKhau)}>
                    {hienThiMatKhau ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }} />
          <TextField label="Nhập lại mật khẩu" type={hienThiXacNhanMatKhau ? "text" : "password"} name="nhap_lai_mat_khau" value={duLieuForm.nhap_lai_mat_khau} onChange={xuLyThayDoi} fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setHienThiXacNhanMatKhau(!hienThiXacNhanMatKhau)}>
                    {hienThiXacNhanMatKhau ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }} />
          <Divider sx={{ my: 2 }} />
          <Stack justifyContent="center" >
            <Button variant="contained" startIcon={<AddCircleOutline />} color="primary" onClick={xuLyGuiForm} >
              Tạo tài khoản
            </Button>
          </Stack>

        </Stack>
      )}
    </PageWrapper>
  );
}