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
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Typography,
} from '@mui/material';
import { EditOutlined, DeleteOutlined, AddCircleOutline } from '@mui/icons-material';
import PageWrapper from '../../components/PageWrapper';
import BranchForm from '../../components/Admin/BranchForm';
import api from '../../api';
import { getToken } from '../../utils/auth';

export default function BranchManage() {
  const [activeTab, setActiveTab] = useState(0);
  const [branches, setBranches] = useState([]);
  const [editBranch, setEditBranch] = useState(null);
  const [locations, setLocations] = useState([]);

  const token = getToken();


  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/?depth=2')
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error('Lỗi khi tải dữ liệu:', err));
    fetchBranchList();
  }, []);

  const fetchBranchList = async () => {
    try{
      const res = await api.get(`/admins/danh-sach-chi-nhanh`, {
        headers:{ Authorization: `Bearer ${token}` },
      })
      if(res.data.success){
        setBranches(res.data.data);
      }
    }catch(error){  
      console.log("Không lấy được danh sách chi nhánh", error);
    }
  }

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setEditBranch(null);
  };

  const handleEditClick = (branch) => {
    setEditBranch(branch);
    setActiveTab(1);
  };


  return (
    <PageWrapper title="Quản lý chi nhánh">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Danh sách chi nhánh" />
          <Tab label={editBranch ? "Cập nhật chi nhánh" : "Thêm chi nhánh"} />
        </Tabs>
      </Box>

      {/* --- TAB 1: DANH SÁCH --- */}
      {activeTab === 0 && (
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
                {branches.map((b) => (
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

      {activeTab === 1 && (
      <BranchForm
        locations={locations}
        editBranch={editBranch}
        onSuccess={() => {
          setActiveTab(0);
          setEditBranch(null);
          fetchBranchList()
        }}
      />
    )}
    </PageWrapper>
  );
}
