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

export default function EmployeeManage() {
  const [activeTab, setActiveTab] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const token = getToken();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setFormData({
          ho_ten:"",
          email:"",
          mat_khau:"",
          nhap_lai_mat_khau:"",
          ma_chi_nhanh:"",
          vai_tro:"",
          so_dien_thoai:""
        })
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  const [formData, setFormData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    mat_khau: "",
    nhap_lai_mat_khau: "",
  })

  useEffect(() => {
    fetchEmployee();
  },[])

  const fetchEmployee = async () => {
    try{
      const res = await api.get(`/manager/danh-sach-nhan-vien`,{
        headers: {
            Authorization: `Bearer ${token}`
          },
      })
      if (res.data.success){
        setEmployees(res.data.data);
      } else{
        alert(res.data.message);
      }
    }catch(err){
      console.log("Lỗi khi lấy danh sách nhân viên", err);
    }
  }

  const handleToggleLockUser = async (user) => {
    try {
      const ma_nguoi_dung = user.ma_nguoi_dung;

      const url = user.trang_thai
        ? `/manager/khoa-tai-khoan/${ma_nguoi_dung}`
        : `/manager/mo-khoa-tai-khoan/${ma_nguoi_dung}`;

      const res = await api.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert(res.data.message);
        fetchEmployee();
      }
    } catch (err) {
      console.log("Lỗi khi xử lý khóa/mở khóa:", err);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10,11}$/; // chỉ cho phép 9-12 chữ số
    return re.test(phone);
  };

  const handleSubmit = async () => {
     const { ho_ten, email, so_dien_thoai, mat_khau, nhap_lai_mat_khau } = formData;

    if (!ho_ten || !email || !so_dien_thoai || !mat_khau || !nhap_lai_mat_khau) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (!validateEmail(email)) {
      alert("Email không hợp lệ!");
      return;
    }
    if (!validatePhone(so_dien_thoai)) {
      alert("Số điện thoại không hợp lệ! Chỉ bao gồm 9-12 chữ số.");
      return;
    }
    if (mat_khau !== nhap_lai_mat_khau) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }
    console.log(formData);
    try {
      const res = await api.post(
        `/manager/them-nhan-vien`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (res.data.success) {
        alert("Tạo người dùng thành công!");
        setActiveTab(0);
        fetchEmployee();
      } else {
        alert(res.data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi khi tạo người dùng mới!");

    }
  };

  return (
    <PageWrapper title="Quản lý nhân viên">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="user management tabs">
          <Tab label="Danh sách nhân viên" />
          <Tab label="Thêm nhân viên mới" />
        </Tabs>
      </Box>
      {/* --- TAB 1: DANH SÁCH --- */}
      {activeTab === 0 && ( 
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
                  {employees.map((user) => (
                    <TableRow key={user.ma_nguoi_dung} hover>
                      <TableCell>{user.ho_ten}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.so_dien_thoai}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.trang_thai ? "Đang hoạt đông" : "Đã khóa"}
                          color={
                            user.trang_thai === true ? "success" : "error"
                          }
                          size='small'
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color={user.trang_thai === true ? "error" : "success"} 
                          size="small" 
                          onClick={() => handleToggleLockUser(user)}
                        >
                          {user.trang_thai === true ? (
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
        {activeTab === 1 && ( 
        <Stack spacing={3}>
          <TextField label="Họ tên" type='text' name="ho_ten" value={formData.ho_ten} onChange={handleChange} fullWidth />
          <TextField label="Email" type='email' name="email" value={formData.email} onChange={handleChange} fullWidth />
          <TextField label="Số điện thoại" name="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleChange} fullWidth />
          <TextField label="Mật khẩu" type={showPassword ? "text" : "password"} name="mat_khau" value={formData.mat_khau} onChange={handleChange} fullWidth 
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}/>
          <TextField label="Nhập lại mật khẩu" type={showConfirmPassword ? "text" : "password"} name="nhap_lai_mat_khau" value={formData.nhap_lai_mat_khau} onChange={handleChange} fullWidth 
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}/>
          <Divider sx={{ my: 2 }} />
          <Stack  justifyContent="center" >
            <Button variant="contained" startIcon={<AddCircleOutline />} color="primary" onClick={handleSubmit} >
              Tạo tài khoản
            </Button>
          </Stack>
          
        </Stack>
      )}
    </PageWrapper>
  );
}
