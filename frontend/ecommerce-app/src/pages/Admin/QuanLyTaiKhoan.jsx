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
  InputAdornment
} from '@mui/material';
import { AddCircleOutline, LockOutlined, LockOpenOutlined, Visibility, VisibilityOff } from '@mui/icons-material';

import PageWrapper from '../../components/PageWrapper';
import api from '../../api';
import { getToken } from '../../utils/auth';

export default function AccountManage() {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [selectedRole, setSelectedRole] = useState("tatca");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = getToken();

  const ROLE_MAP = {
    QUAN_LY: "Quản lý",
    QUAN_TRI_VIEN: "Quản trị viên",
    NHAN_VIEN: "Nhân viên",
    KHACH_HANG: "Khách hàng",
  };

  const roleOptions = [
    { value: "tatca", label: "Tất cả" },
    { value: "NHAN_VIEN", label: "Nhân viên" },
    { value: "QUAN_LY", label: "Quản lý chi nhánh" },
    { value: "QUAN_TRI_VIEN", label: "Quản trị viên" },
    { value: "KHACH_HANG", label: "Khách hàng" },
  ];

  const filteredRoleOptions = activeTab === 0
  ? roleOptions // Tab 0 giữ tất cả
  : roleOptions.filter(role => role.value !== "tatca"); // Tab 1 bỏ "Tất cả"

  const handleRole = (role) => ROLE_MAP[role] || "Khách hàng";

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      setSelectedRole(null);
    } else {
      setSelectedRole("tatca");
    }
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
    vai_tro: "",
    ma_chi_nhanh: 0,
  })
  
  useEffect(() => {
    fetchUsersList();
    fetchBranchList();
  }, []);

  const fetchUsersList = async ()=>{
    try{
      const res = await api.get(`/admins/danh-sach-nguoi-dung`, {
        headers:{ Authorization: `Bearer ${token}` },
      })
      if (res.data.success){
        setUsers(res.data.data);
      }
    }catch(error){
      console.log("Lấy danh sách người dùng thất bại", error);
    }
  }

  const fetchBranchList = async () =>{
    try{
      const res = await api.get(`/admins/danh-sach-chi-nhanh`, {
        headers:{ Authorization: `Bearer ${token}` },
      })
      if(res.data.success){
        setBranches(res.data.data);
      }
    }catch(error){
      console.log("Lấy danh sách chi nhánh thất bại", error);
    }
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10,11}$/; // chỉ cho phép 9-12 chữ số
    return re.test(phone);
  };

  const handleSubmit = async () => {
     const { ho_ten, email, so_dien_thoai, mat_khau, nhap_lai_mat_khau, vai_tro } = formData;

    if (!ho_ten || !email || !so_dien_thoai || !mat_khau || !nhap_lai_mat_khau || !vai_tro) {
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
        `/admins/them-nguoi-dung`,
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
        setSelectedRole("tatca");
        fetchUsersList();
      } else {
        alert(res.data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi khi tạo người dùng mới!");

    }
  };

  const handleToggleLockUser = async (user) => {
    try {
      const ma_nguoi_dung = user.ma_nguoi_dung;

      const url = user.trang_thai === "Đang hoạt động"
        ? `/admins/khoa-tai-khoan/${ma_nguoi_dung}`
        : `/admins/mo-khoa-tai-khoan/${ma_nguoi_dung}`;

      const res = await api.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert(res.data.message);
        fetchUsersList();
      }
    } catch (err) {
      console.log("Lỗi khi xử lý khóa/mở khóa:", err);
    }
  };


  const filteredUsers = users.filter(user => {
    if(selectedRole === "tatca") return true; // mặc định hiển thị tất cả
    return user.vai_tro === selectedRole;
  });

  const totalAccounts = filteredUsers.length;

  return (
    <PageWrapper title="Quản lý tài khoản">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="user management tabs">
          <Tab label="Danh sách tài khoản" />
          <Tab label="Tạo tài khoản mới" />
        </Tabs>
      </Box>
      {/* --- TAB 1: DANH SÁCH --- */}
      {activeTab === 0 && ( 
      <Box sx={{ overflowX: 'auto', mt: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 1 }}>
          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Lọc theo vị trí</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              label="Lọc theo vị trí"
            >
              {filteredRoleOptions.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              color: "text.secondary",
            }}
          >
            Tổng: {totalAccounts} tài khoản
          </Typography>
        </Stack>
            <TableContainer component={Paper} sx={{ borderRadius: 0, boxShadow: 'none', width: '100%' }}>
              <Table sx={{ minWidth: '100%' }} aria-label="user table">
                <TableHead>
                  <TableRow>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Vai trò</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.ma_nguoi_dung} hover>
                      <TableCell>{user.ho_ten}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={handleRole(user.vai_tro)}
                          color={
                            user.vai_tro === 'QUAN_TRI_VIEN'
                              ? 'error'
                              : user.vai_tro === 'QUAN_LY'
                              ? 'primary' 
                              : user.vai_tro === 'NHAN_VIEN'
                              ? 'success'
                              : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.trang_thai}
                          color={
                            user.trang_thai === "Đang hoạt động" ? "success" : "error"
                          }
                          size='small'
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color={user.trang_thai === "Đang hoạt động" ? "error" : "success"} 
                          size="small" 
                          onClick={() => handleToggleLockUser(user)}
                        >
                          {user.trang_thai === "Đang hoạt động" ? (
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

          <FormControl fullWidth>
            <InputLabel>Vai trò</InputLabel>
            <Select
              value={selectedRole || ""} // nếu chưa chọn thì dùng ""
              onChange={(e) => {
                const value = e.target.value;
                setSelectedRole(value);
                setFormData(prev => ({ ...prev, vai_tro: value })); // cập nhật formData
              }}
              label="Chọn vai trò"
            >
              {filteredRoleOptions.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(formData.vai_tro === 'NHAN_VIEN' || formData.vai_tro === 'QUAN_LY') && (
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Chi nhánh</InputLabel>
                <Select
                  value={selectedBranch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedBranch(value);
                    setFormData(prev => ({...prev, ma_chi_nhanh: value || null}));
                  }}
                  label="Chọn vai trò"
                  >
                  {branches.map((branch) => (
                  <MenuItem key={branch.ma_chi_nhanh} value={branch.ma_chi_nhanh}>
                    {branch.ten_chi_nhanh}
                  </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
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
