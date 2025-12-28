import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import {
  Box, Tabs, Tab, Stack, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Divider,
  OutlinedInput, Chip, Dialog, DialogTitle, DialogContent, List,
  ListItemButton, ListItemText, Typography,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Pagination,
  Select,
  MenuItem
} from "@mui/material";
import { AddCircleOutline, EditOutlined } from "@mui/icons-material";
import { Search } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import api from "../../api";
import { getToken } from "../../utils/auth";

export default function QuanLyKhuyenMai() {
  const [tabHienTai, setTabHienTai] = useState(0);
  const [danhSachChiNhanh, setDanhSachChiNhanh] = useState([]);
  const [danhSachKhuyenMai, setDanhSachKhuyenMai] = useState([]);
  const [khuyenMaiDangSua, setKhuyenMaiDangSua] = useState(null);

  const [danhSachSanPham, setDanhSachSanPham] = useState([]);
  const [sanPhamDaChon, setSanPhamDaChon] = useState([]);
  const [chiNhanhDaChon, setChiNhanhDaChon] = useState(null);
  const [soLuongSanPham, setSoLuongSanPham] = useState({});

  const [moChonChiNhanh, setMoChonChiNhanh] = useState(false);
  const [moChonSanPham, setMoChonSanPham] = useState(false);
  const [timKiemChiNhanh, setTimKiemChiNhanh] = useState("");
  const [timKiemSanPham, setTimKiemSanPham] = useState("");

  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoLuong, setTongSoLuong] = useState(0);
  const gioiHan = 10;

  const [tieuDeAnh, setTieuDeAnh] = useState(null);
  const [xemTruocAnh, setXemTruocAnh] = useState("");

  const [moHuyKhuyenMai, setMoHuyKhuyenMai] = useState(false);
  const [lyDoHuy, setLyDoHuy] = useState("");

  const [locTrangThai, setLocTrangThai] = useState("TAT_CA");

  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  
  const maXacThuc = getToken();

  const [duLieuForm, setDuLieuForm] = useState({
    ten_khuyen_mai: '',
    ma_khuyen_mai: '',
    mo_ta: '',
    giam_gia: '',
    ngay_bat_dau: '',
    ngay_ket_thuc: '',
  });

  useEffect(() => {
    layDanhSachSanPham();
    layDanhSachChiNhanh();
  },[]);

  useEffect(() => {
    layDanhSachKhuyenMai();
  }, [trangHienTai, chiNhanhDaChon, locTrangThai]);

  const layDanhSachKhuyenMai = async () => {
    try {
      const offset = (trangHienTai - 1) * gioiHan; 
      const phanHoi = await api.get(`/admins/danh-sach-khuyen-mai`, {
        params: {
          limit: gioiHan,
          offset,
          tu_khoa: tuKhoaTimKiem || undefined,
          ma_chi_nhanh: chiNhanhDaChon?.ma_chi_nhanh || undefined,
          trang_thai: locTrangThai
        },
        headers: { Authorization: `Bearer ${maXacThuc}` }
      });
      if (phanHoi.data.success) {
        setDanhSachKhuyenMai(phanHoi.data.data.items)
        setTongSoLuong(phanHoi.data.data.total);
      }
    } catch (loi) {
      console.log("Có lỗi khi lấy danh sách khuyến mãi", loi);
    }
  };

  const layDanhSachSanPham = async () => {
    try {
      const phanHoi = await api.get(`/users/tat-ca-san-pham`);
      if (phanHoi.data.success) setDanhSachSanPham(phanHoi.data.data);
    } catch (loi) {
      console.error("Lấy danh sách sản phẩm thất bại", loi);
    }
  };

  const layDanhSachChiNhanh = async () => {
    try {
      const phanHoi = await api.get(`/admins/danh-sach-chi-nhanh`, {
        headers: { Authorization: `Bearer ${maXacThuc}` },
      });
      if (phanHoi.data.success) {
        setDanhSachChiNhanh(phanHoi.data.data);
      }
    } catch (loi) {
      console.log("Không lấy được danh sách chi nhánh", loi);
    }
  };

  const sanPhamLoc = danhSachSanPham.filter(sp =>
    sp.ten_san_pham.toLowerCase().includes(timKiemSanPham.toLowerCase())
  );

  const chiNhanhLoc = danhSachChiNhanh.filter(cn =>
    cn.ten_chi_nhanh.toLowerCase().includes(timKiemChiNhanh.toLowerCase()) ||
    cn.dia_chi.toLowerCase().includes(timKiemChiNhanh.toLowerCase())
  );

  const thayDoiTab = (_, giaTriMoi) => {
    setTabHienTai(giaTriMoi);
    setKhuyenMaiDangSua(null);

    if (giaTriMoi === 0) {
      setDuLieuForm({
        ten_khuyen_mai: "", ma_khuyen_mai: "", mo_ta: "",
        giam_gia: "", ngay_bat_dau: "", ngay_ket_thuc: "",
      });
      setSanPhamDaChon([]);
      setSoLuongSanPham({});
      setTieuDeAnh(null);
      setXemTruocAnh("");
    }
  };

  const xuLySuaKhuyenMai = (khuyenMai) => {
    setKhuyenMaiDangSua(khuyenMai);
    setDuLieuForm({
      ten_khuyen_mai: khuyenMai.ten_khuyen_mai,
      ma_khuyen_mai: khuyenMai.ma_code,
      mo_ta: khuyenMai.mo_ta || "",
      giam_gia: khuyenMai.giam_gia,
      ngay_bat_dau: khuyenMai.ngay_bat_dau.slice(0, 16),
      ngay_ket_thuc: khuyenMai.ngay_ket_thuc.slice(0, 16),
    });

    const chiNhanh = danhSachChiNhanh.find(cn => cn.ma_chi_nhanh == khuyenMai.ma_chi_nhanh);
    setChiNhanhDaChon(chiNhanh);

    if (khuyenMai.hinh_anhs?.length > 0) {
      setXemTruocAnh(khuyenMai.hinh_anhs[0].duong_dan);
    }

    const sanPhams = khuyenMai.san_phams?.map(sp => sp);
    setSanPhamDaChon(sanPhams);
    const soLuongs = {};
    khuyenMai.san_phams?.forEach(sp => {
      soLuongs[sp.ma_san_pham] = sp.so_luong;
    });
    setSoLuongSanPham(soLuongs);
    setTabHienTai(1);
  };

  const nhapDuLieuForm = (e) => {
    const { name, value } = e.target;
    setDuLieuForm(prev => ({ ...prev, [name]: value }));
  };

  const thayDoiAnh = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTieuDeAnh(file);
      setXemTruocAnh(URL.createObjectURL(file));
    }
  };

  const xuLyLuuKhuyenMai = async () => {
    try {
      const duLieuGui = new FormData();
      duLieuGui.append("ten_khuyen_mai", duLieuForm.ten_khuyen_mai);
      duLieuGui.append("ma_code", duLieuForm.ma_khuyen_mai);
      duLieuGui.append("mo_ta", duLieuForm.mo_ta || "");
      duLieuGui.append("giam_gia", duLieuForm.giam_gia);
      duLieuGui.append("ngay_bat_dau", new Date(duLieuForm.ngay_bat_dau).toISOString());
      duLieuGui.append("ngay_ket_thuc", new Date(duLieuForm.ngay_ket_thuc).toISOString());
      
      if (chiNhanhDaChon) 
        duLieuGui.append("ma_chi_nhanh", chiNhanhDaChon.ma_chi_nhanh);
      if (sanPhamDaChon) {
        duLieuGui.append("san_phams", JSON.stringify(
          sanPhamDaChon.map(p => ({
            ma_san_pham: p.ma_san_pham,
            so_luong: soLuongSanPham[p.ma_san_pham] || 1,
          }))
        ));
      }
      if (tieuDeAnh) duLieuGui.append("hinh_anh", tieuDeAnh);

      let phanHoi;
      if (khuyenMaiDangSua) {
        phanHoi = await api.put(`/admins/cap-nhat-khuyen-mai/${khuyenMaiDangSua.ma_khuyen_mai}`, duLieuGui, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${maXacThuc}` },
        });
        alert("Cập nhật khuyến mãi thành công!");
      } else {
        phanHoi = await api.post("/admins/tao-khuyen-mai", duLieuGui, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${maXacThuc}` },
        });
        alert("Thêm khuyến mãi thành công!");
      }

      layDanhSachKhuyenMai();
      thayDoiTab(null, 0); // Reset về danh sách
    } catch (loi) {
      alert(loi.phanHoi?.data?.message || loi.message || "Lưu khuyến mãi thất bại");
    }
  };

  const xuLyChonSanPham = (sanPham) => {
    setSanPhamDaChon(prev => {
      const tonTai = prev.find(p => p.ma_san_pham === sanPham.ma_san_pham);
      const soLuongsMoi = { ...soLuongSanPham };
      if (tonTai) {
        const danhSachMoi = prev.filter(p => p.ma_san_pham !== sanPham.ma_san_pham);
        delete soLuongsMoi[sanPham.ma_san_pham];
        setSoLuongSanPham(soLuongsMoi);
        return danhSachMoi;
      }
      soLuongsMoi[sanPham.ma_san_pham] = 1;
      setSoLuongSanPham(soLuongsMoi);
      return [...prev, sanPham];
    });
  };

  const xuLyDuyet = async () => {
    const phanHoi = await api.put(`/admins/duyet-khuyen-mai/${khuyenMaiDangSua.ma_khuyen_mai}`, {}, {
      headers: { Authorization: `Bearer ${maXacThuc}` }
    });
    if (phanHoi.data.success) {
      alert(phanHoi.data.message);
      thayDoiTab(null, 0);
      layDanhSachKhuyenMai();
    }
  };

  const xuLyTuChoi = async () => {
    const phanHoi = await api.put(`/admins/tu-choi-khuyen-mai/${khuyenMaiDangSua.ma_khuyen_mai}`, { ly_do: lyDoHuy }, {
      headers: { Authorization: `Bearer ${maXacThuc}` }
    });
    if (phanHoi.data.success) {
      alert(phanHoi.data.message);
      thayDoiTab(null, 0);
      layDanhSachKhuyenMai();
    }
  };

  const xuLyChonChiNhanh = (chiNhanh) => {
    setChiNhanhDaChon(chiNhanh);
    setMoChonChiNhanh(false);
    setTimKiemChiNhanh("");
  };

  const hienThiTrangThai = (trangThai) => {
    const anhXaTrangThai = {
      "CHO_XU_LY": { label: "Chờ duyệt", color: "warning" },
      "DA_DUYET": { label: "Đã duyệt", color: "success" },
      "DA_HUY": { label: "Từ chối", color: "error" },
    };
    const giaTri = anhXaTrangThai[trangThai] || { label: "Không xác định", color: "default" };
    return <Chip label={giaTri.label} color={giaTri.color} size="small" />;
  };

  return (
    <PageWrapper title="Admin - Quản lý khuyến mãi">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabHienTai} onChange={thayDoiTab}>
          <Tab label="Danh sách khuyến mãi" />
          <Tab label={khuyenMaiDangSua ? "Chi tiết khuyến mãi" : "Tạo khuyến mãi"} />
        </Tabs>
      </Box>

      {tabHienTai === 0 && (
        <>
          <Paper elevation={0} sx={{ mb: 1, borderRadius: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Tìm khuyến mãi"
                    placeholder="Nhập tên khuyến mãi..."
                    value={tuKhoaTimKiem}
                    onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setTrangHienTai(1);
                        layDanhSachKhuyenMai();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={(e) => {
                            setTrangHienTai(1);
                            layDanhSachKhuyenMai();
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
                        chiNhanhDaChon
                          ? chiNhanhDaChon.ten_chi_nhanh
                          : "Tất cả chi nhánh"
                      }
                      readOnly
                      endAdornment={
                        <IconButton onClick={() => setMoChonChiNhanh(true)}>
                          <ArrowDropDownIcon />
                        </IconButton>
                      }
                      onClick={() => setMoChonChiNhanh(true)}
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
                    <option value="CHO_XU_LY">Chờ duyệt</option>
                    <option value="DA_DUYET">Đã duyệt</option>
                    <option value="DA_HUY">Đã hủy</option>
                  </TextField>
                </Grid>
              </Grid>
          </Paper>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên khuyến mãi</TableCell>
                  <TableCell>Mã</TableCell>
                  <TableCell>Giảm (%)</TableCell>
                  <TableCell>Chi nhánh</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {danhSachKhuyenMai.map((km) => (
                  <TableRow key={km.ma_khuyen_mai} hover>
                    <TableCell>{km.ten_khuyen_mai}</TableCell>
                    <TableCell>{km.ma_code}</TableCell>
                    <TableCell>{km.giam_gia}%</TableCell>
                    <TableCell>{km.ten_chi_nhanh}</TableCell>
                    <TableCell>{hienThiTrangThai(km.trang_thai)}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => xuLySuaKhuyenMai(km)}>
                        <EditOutlined />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Stack spacing={2} alignItems="center" sx={{ mt: 2, mb: 4 }}>
              <Pagination
                count={Math.ceil(tongSoLuong / gioiHan)}
                page={trangHienTai}
                onChange={(_, v) => setTrangHienTai(v)}
                color="primary"
                shape="rounded"
              />
            </Stack>
          </TableContainer>
        </>
      )}

      {tabHienTai === 1 && (
        <Stack spacing={3}>
          <TextField label="Tên khuyến mãi" name="ten_khuyen_mai" value={duLieuForm.ten_khuyen_mai} onChange={nhapDuLieuForm} fullWidth />
          <TextField label="Mã khuyến mãi" name="ma_khuyen_mai" value={duLieuForm.ma_khuyen_mai} onChange={nhapDuLieuForm} fullWidth />
          <TextField label="Mô tả" name="mo_ta" value={duLieuForm.mo_ta} onChange={nhapDuLieuForm} fullWidth />
          <TextField label="Phần trăm giảm" name="giam_gia" type="number" value={duLieuForm.giam_gia} onChange={nhapDuLieuForm} fullWidth />
          <TextField label="Ngày bắt đầu" name="ngay_bat_dau" type="datetime-local" value={duLieuForm.ngay_bat_dau} onChange={nhapDuLieuForm} InputLabelProps={{ shrink: true }} />
          <TextField label="Ngày kết thúc" name="ngay_ket_thuc" type="datetime-local" value={duLieuForm.ngay_ket_thuc} onChange={nhapDuLieuForm} InputLabelProps={{ shrink: true }} />
          
          <Stack direction="row" spacing={2} alignItems="center">
            {xemTruocAnh && <img src={xemTruocAnh} alt="preview" style={{ width: 100, height: 100, borderRadius: 8 }} />}
            <Button variant="outlined" component="label">
              Tải ảnh lên
              <input type="file" hidden onChange={thayDoiAnh} />
            </Button>
          </Stack>

          <OutlinedInput
            placeholder="Chọn chi nhánh..."
            value={chiNhanhDaChon ? chiNhanhDaChon.ten_chi_nhanh : "Chọn chi nhánh..."}
            readOnly
            onClick={() => setMoChonChiNhanh(true)}
            endAdornment={<IconButton><ArrowDropDownIcon /></IconButton>}
          />

          <OutlinedInput
            placeholder="Chọn sản phẩm..."
            value={sanPhamDaChon.length > 0 ? `${sanPhamDaChon.length} sản phẩm đã chọn` : "Chọn sản phẩm..."}
            readOnly
            onClick={() => setMoChonSanPham(true)}
            endAdornment={<IconButton><ArrowDropDownIcon /></IconButton>}
          />

          {sanPhamDaChon.map((sp) => (
            <Box key={sp.ma_san_pham} sx={{ p: 2, border: "1px solid #eee", display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ flex: 1 }}>{sp.ten_san_pham}</Typography>
              <TextField
                type="number"
                size="small"
                label="Số lượng"
                value={soLuongSanPham[sp.ma_san_pham] || 1}
                onChange={(e) => setSoLuongSanPham({ ...soLuongSanPham, [sp.ma_san_pham]: e.target.value })}
              />
              <Button color="error" onClick={() => xuLyChonSanPham(sp)}>Xóa</Button>
            </Box>
          ))}

          <Divider />
          {khuyenMaiDangSua ? (
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="contained" color="primary" onClick={xuLyDuyet}>Duyệt</Button>
              <Button variant="outlined" color="error" onClick={() => setMoHuyKhuyenMai(true)}>Từ chối</Button>
            </Stack>
          ) : (
            <Button variant="contained" startIcon={<AddCircleOutline />} onClick={xuLyLuuKhuyenMai}>Lưu khuyến mãi</Button>
          )}
        </Stack>
      )}

      {/* Dialogs Chọn sản phẩm, chi nhánh và Lý do hủy tương tự (đã Việt hóa biến) */}
      <Dialog open={moChonSanPham} onClose={() => setMoChonSanPham(false)} fullWidth>
        <DialogTitle>Chọn sản phẩm</DialogTitle>
        <DialogContent>
           <TextField fullWidth placeholder="Tìm sản phẩm..." value={timKiemSanPham} onChange={(e) => setTimKiemSanPham(e.target.value)} sx={{ mb: 2 }} />
           <List>
             {sanPhamLoc.map(sp => (
               <ListItemButton key={sp.ma_san_pham} onClick={() => xuLyChonSanPham(sp)}>
                 <ListItemText primary={sp.ten_san_pham} />
               </ListItemButton>
             ))}
           </List>
        </DialogContent>
      </Dialog>

      <Dialog open={moChonChiNhanh} onClose={() => setMoChonChiNhanh(false)} fullWidth maxWidth="sm">
        <DialogTitle>Chọn chi nhánh</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Tìm theo tên hoặc địa chỉ..."
            value={timKiemChiNhanh}
            onChange={(e) => setTimKiemChiNhanh(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />
          {tabHienTai === 0 && (
            <>
              <ListItemButton onClick={() => xuLyChonChiNhanh(null)}>
                <ListItemText
                  primary="Tất cả chi nhánh"
                  secondary="Hiển thị toàn bộ dữ liệu tồn kho"

                />
              </ListItemButton>
              <Divider />
            </>
          )}

          <List>
            {chiNhanhLoc.map((branch) => (
              <React.Fragment key={branch.ma_chi_nhanh}>
                <ListItemButton onClick={() => xuLyChonChiNhanh(branch)}>
                  <ListItemText primary={branch.ten_chi_nhanh} secondary={branch.dia_chi} />
                </ListItemButton>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Dialog Lý do từ chối */}
      <Dialog open={moHuyKhuyenMai} onClose={() => setMoHuyKhuyenMai(false)}>
        <DialogTitle>Lý do từ chối</DialogTitle>
        <DialogContent>
          <TextField multiline rows={3} fullWidth value={lyDoHuy} onChange={(e) => setLyDoHuy(e.target.value)} sx={{ mt: 1 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button onClick={() => setMoHuyKhuyenMai(false)}>Hủy</Button>
            <Button variant="contained" color="error" onClick={xuLyTuChoi}>Xác nhận từ chối</Button>
          </Stack>
        </DialogContent>
      </Dialog>

    </PageWrapper>
  );
}