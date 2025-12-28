import React, { useState, useEffect } from "react";
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
  Stack,
  Pagination,
  IconButton,
  OutlinedInput,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import { EditOutlined, DeleteOutlined, Search } from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import PageWrapper from "../../components/PageWrapper";
import FormSanPham from "../../components/Admin/FormSanPham";
import CategorySelectorModal from "../../components/Admin/ModalChonDanhMuc";

import api from "../../api";
import { getToken } from "../../utils/auth";

export default function QuanLySanPham() {
  const [tabHienTai, setTabHienTai] = useState(0);
  const [danhSachSanPham, setDanhSachSanPham] = useState([]);
  const [danhSachDanhMuc, setDanhSachDanhMuc] = useState([]);
  const [sanPhamSua, setSanPhamSua] = useState(null);
  const [trang, setTrang] = useState(1);
  const [tongSo, setTongSo] = useState(0);

  const [chonDanhMuc, setChonDanhMuc] = useState(null);
  const [modalDanhMucMo, setModalDanhMucMo] = useState(false);

  const [tuKhoaSanPham, setTuKhoaSanPham] = useState(null);

  const limit = 10;
  const token = getToken();

  useEffect(() => {
    layDanhSachDanhMuc();
  }, []);

  useEffect(() => {
    layDanhSachSanPham();
  }, [trang, chonDanhMuc]);
  
  useEffect(() => {
    setTrang(1);
  }, [tuKhoaSanPham, chonDanhMuc]);

  const xuLyTimKiem = () => {
    setTrang(1);         
    layDanhSachSanPham(); 
  };

  const layDanhSachSanPham = async () => {
    try {
      const offset = (trang - 1) * limit;

      const res = await api.get("/admins/danh-sach-san-pham", {
        params: {
          limit,
          offset,
          ten_san_pham: tuKhoaSanPham || undefined,
          ma_danh_muc: chonDanhMuc?.ma_danh_muc || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setDanhSachSanPham(res.data.data.items);
        setTongSo(res.data.data.total);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm:", err);
    }
  };

  const layDanhSachDanhMuc = async () => {
    try {
      const res = await api.get("/users/danh-muc");
      if (res.data.success){
        const danhMuc = layDanhMucLa(res.data.data)
        const danhSachCoTatCa = [
          {
            ma_danh_muc: null,
            ten_danh_muc: "Tất cả danh mục",
          },
          ...danhMuc,
        ];
        setDanhSachDanhMuc(danhSachCoTatCa);
      }
        
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };

  const layDanhMucLa = (danhMuc) => {
    let ketQua = [];

    for (const dm of danhMuc) {
      if (!dm.danh_muc_con || dm.danh_muc_con.length === 0) {
        ketQua.push(dm);
      }

      if (dm.danh_muc_con && dm.danh_muc_con.length > 0) {
        ketQua = ketQua.concat(layDanhMucLa(dm.danh_muc_con));
      }
    }

    return ketQua;
  };

  const xuLyChuyenTab = (_, giaTri) => {
    setTabHienTai(giaTri);
    setSanPhamSua(null);
  };

  const xuLyChinhSuaClick = (sp) => {
    setSanPhamSua(sp);
    setTabHienTai(1); // chuyển sang tab sửa
  };

  const xuLyXoaSanPham = async (sp) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      const res = await api.delete(`/admins/xoa-san-pham/${sp.ma_san_pham}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        alert("Xóa sản phẩm thành công!");
        layDanhSachSanPham();
      } else {
        alert("Xóa thất bại: " + res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa sản phẩm!");
    }
  };

  return (
    <PageWrapper title="Quản lý sản phẩm">
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabHienTai} onChange={xuLyChuyenTab}>
          <Tab label="Danh sách sản phẩm" />
          <Tab label={sanPhamSua ? "Cập nhật sản phẩm" : "Thêm sản phẩm"} />
        </Tabs>
      </Box>

      {/* Tab danh sách sản phẩm */}
      {tabHienTai === 0 && (
        <Box>
          <Paper elevation={0} sx={{  mb: 1, borderRadius: 3,}}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <TextField 
                  fullWidth
                  label="Tìm sản phẩm" 
                  placeholder="Nhập tên sản phẩm..."
                  value={tuKhoaSanPham}
                  onChange={(e) => setTuKhoaSanPham(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      xuLyTimKiem();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={xuLyTimKiem}>
                          <Search />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Stack sx={{ gap: 1 }}>
                  <OutlinedInput
                    value={chonDanhMuc ? chonDanhMuc.ten_danh_muc : ""}
                    placeholder="Chọn danh mục..."
                    readOnly
                    fullWidth
                    endAdornment={
                      <IconButton onClick={() => setModalDanhMucMo(true)}>
                        <ArrowDropDownIcon />
                      </IconButton>
                    }
                    onClick={() => setModalDanhMucMo(true)}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #eee" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ảnh</TableCell>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Giảm giá</TableCell>
                <TableCell>Đơn vị</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {danhSachSanPham.map((sp) => (
                <TableRow key={sp.ma_san_pham} hover>
                  <TableCell>
                    <img
                      src={sp.hinh_anhs?.[0]?.duong_dan || ""}
                      alt={sp.ten_san_pham}
                      style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
                    />
                  </TableCell>
                  <TableCell>{sp.ten_san_pham}</TableCell>
                  <TableCell>{sp.ten_danh_muc}</TableCell>
                  <TableCell>{sp.don_gia}</TableCell>
                  <TableCell>{sp.giam_gia}</TableCell>
                  <TableCell>{sp.don_vi}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton color="primary" onClick={() => xuLyChinhSuaClick(sp)}>
                        <EditOutlined />
                      </IconButton>
                      <IconButton color="error" onClick={() => xuLyXoaSanPham(sp)}>
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
              count={Math.ceil(tongSo / limit)}
              page={trang}
              onChange={(_, value) => setTrang(value)}
              color="primary"
              shape="rounded"
            />
          </Stack>
        </TableContainer>
        </Box>
      )}

      {/* Tab Thêm / Sửa sản phẩm */}
      {tabHienTai === 1 && (
        <FormSanPham
          danhSachDanhMuc={danhSachDanhMuc}
          sanPhamSua={sanPhamSua}
          khiThanhCong={() => {
            setTabHienTai(0);
            setSanPhamSua(null);
            layDanhSachSanPham();
          }}
        />
      )}

      <CategorySelectorModal
        mo={modalDanhMucMo}
        dong={() => setModalDanhMucMo(false)}
        danhSachDanhMuc={danhSachDanhMuc}
        khiChon={(cat) => setChonDanhMuc(cat)}
      />
    </PageWrapper>
  );
}
