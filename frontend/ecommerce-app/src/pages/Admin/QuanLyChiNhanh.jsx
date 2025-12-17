import { useState, useEffect } from 'react';
import {
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
  IconButton,
} from '@mui/material';
import { EditOutlined, DeleteOutlined } from '@mui/icons-material';
import PageWrapper from '../../components/PageWrapper';
import BranchForm from '../../components/Admin/BranchForm';
import api from '../../api';
import { getToken } from '../../utils/auth';

export default function QuanLyChiNhanh() {
  const [tabDangChon, setTabDangChon] = useState(0);
  const [danhSachChiNhanh, setDanhSachChiNhanh] = useState([]);
  const [chiNhanhDangSua, setChiNhanhDangSua] = useState(null);
  const [danhSachTinhThanh, setDanhSachTinhThanh] = useState([]);

  const token = getToken();

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/?depth=2')
      .then((res) => res.json())
      .then((data) => setDanhSachTinhThanh(data))
      .catch((err) => console.error('Lỗi khi tải dữ liệu:', err));
    fetchBranchList();
  }, []);

  const fetchBranchList = async () => {
    try{
      const res = await api.get(`/admins/danh-sach-chi-nhanh`, {
        headers:{ Authorization: `Bearer ${token}` },
      })
      if(res.data.success){
        setDanhSachChiNhanh(res.data.data);
      }
    }catch(error){  
      console.log("Không lấy được danh sách chi nhánh", error);
    }
  }

  const handleTabChange = (_, newValue) => {
    setTabDangChon(newValue);
    setChiNhanhDangSua(null);
  };

  const handleEditClick = (branch) => {
    setChiNhanhDangSua(branch);
    setTabDangChon(1);
  };


  return (
    <PageWrapper title="Quản lý chi nhánh">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabDangChon} onChange={handleTabChange}>
          <Tab label="Danh sách chi nhánh" />
          <Tab label={chiNhanhDangSua ? "Cập nhật chi nhánh" : "Thêm chi nhánh"} />
        </Tabs>
      </Box>

      {/* --- TAB 1: DANH SÁCH --- */}
      {tabDangChon === 0 && (
        <Box sx={{ overflowX: 'auto', mt: 2 }}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #eee' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên chi nhánh</TableCell>
                  <TableCell>Địa chỉ</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {danhSachChiNhanh.map((b) => (
                  <TableRow key={b.ma_chi_nhanh} hover>
                    <TableCell>{b.ten_chi_nhanh}</TableCell>
                    <TableCell>{b.dia_chi}</TableCell>
                    <TableCell>{b.so_dien_thoai}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" size="small" onClick={() => handleEditClick(b)}>
                        <EditOutlined />
                      </IconButton>
                      <IconButton color="error" size="small">
                        <DeleteOutlined />
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
      <BranchForm
        danhSachTinhThanh={danhSachTinhThanh}
        chiNhanhDangSua={chiNhanhDangSua}
        khiThanhCong={() => {
          setTabDangChon(0);
          setChiNhanhDangSua(null);
          fetchBranchList()
        }}
      />
    )}
    </PageWrapper>
  );
}
