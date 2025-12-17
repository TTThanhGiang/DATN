import { useEffect, useState } from "react";
import PageWrapper from "../../components/PageWrapper";

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
  IconButton,
  Stack,
  Pagination,
} from "@mui/material";
import { EditOutlined, DeleteOutlined } from "@mui/icons-material";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import api from "../../api";
import { getToken } from "../../utils/auth";
import CategoryForm from "../../components/Admin/CategoryForm";


export default function CategoryManage() {
  const [tatCaDanhMuc, setTatCaDanhMuc] = useState([]);

  const [tabDangChon, setTabDangChon] = useState(0);
  const [danhSachDanhMuc, setDanhSachDanhMuc] = useState([]);
  const [danhMucDangSua, setDanhMucDangSua] = useState(null);

  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoLuong, setTongSoLuong] = useState(0);

  const gioiHan = 10;
  const token = getToken();
  const xuLyDoiTab  = (_, value) => {
    setTabDangChon(value);
    setDanhMucDangSua(null);
  };


  const xuLySuaDanhMuc  = (category) => {
    setDanhMucDangSua(category);
    setTabDangChon(1);
  };

  useEffect(() => {
    fetchCategories();
    fetchCategoriesFull();
  },[trangHienTai]);

  const fetchCategories = async() => {
    try{
      const offset = (trangHienTai-1)* gioiHan;
      const res = await api.get(`admins/danh-muc?limit=${gioiHan}&offset=${offset}`, {
        headers:{ Authorization: `Bearer ${token}` },
      })
      if(res.data.success){
        setDanhSachDanhMuc(res.data.data.items);
        setTongSoLuong(res.data.data.total);
      }
    }catch(err){
      console.error("Lỗi lấy danh mục:", err);
    }
  }
  const fetchCategoriesFull = async () => {
    try {
      const res = await api.get("/users/danh-muc");
      if (res.data.success) setTatCaDanhMuc(res.data.data);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };


  return (
    <PageWrapper title="Quản lý danh mục">
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabDangChon} onChange={xuLyDoiTab}>
          <Tab label="Danh sách danh mục" />
          <Tab label={danhMucDangSua ? "Cập nhật danh mục": "Thêm danh mục"}/>
        </Tabs>
      </Box>

      {/* --- TAB 1: DANH SÁCH --- */}
      {tabDangChon === 0 && (
        <Box sx={{ overflowX: "auto", mt: 2 }}>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              boxShadow: "none",
              width: "100%",
              border: "1px solid #eee",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hình ảnh</TableCell>
                  <TableCell>Tên danh mục</TableCell>
                  <TableCell>Danh mục cha</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {danhSachDanhMuc.map((c) => (
                  <TableRow key={c.ma_danh_muc} hover>
                    <TableCell>
                      <img
                      src={c.hinh_anhs?.[0]?.duong_dan || ""}
                      alt={c.ten_san_pham}
                      style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
                    />
                    </TableCell>
                    <TableCell>{c.ten_danh_muc}</TableCell>
                    <TableCell>{c.danh_muc_cha ? c.danh_muc_cha : "—" }</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => xuLySuaDanhMuc(c)}
                        >
                          <EditOutlined />
                        </IconButton>
                        <IconButton color="error" size="small">
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
                count={Math.ceil(tongSoLuong / gioiHan)}
                page={trangHienTai}
                onChange={(_, value) => setTrangHienTai(value)}
                color="primary"
                shape="rounded"
              />
            </Stack>
          </TableContainer>
        </Box>
      )}

      {/* Tab Thêm / Sửa */}
            {tabDangChon === 1 && (
              <CategoryForm
                categories={tatCaDanhMuc}
                editCategory={danhMucDangSua} 
                onSuccess={() => {
                  setTabDangChon(0);
                  setDanhMucDangSua(null);
                  fetchCategories();
                }}
              />
            )}
    </PageWrapper>
  );
}
