import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import {
  Box,
  Tabs,
  Tab,
  Stack,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  OutlinedInput,
  Typography,
  Grid,
  InputAdornment,
  Pagination,
} from "@mui/material";
import { AddCircleOutline, EditOutlined, Search } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import api from "../../api";
import { getToken } from "../../utils/auth";

export default function QuanLyKhuyenMai() {
  const [tabHienTai, setTabHienTai] = useState(0);
  const [danhSachKhuyenMai, setDanhSachKhuyenMai] = useState([]);

  const [khuyenMaiDangSua, setKhuyenMaiDangSua] = useState(null);

  const [danhSachSanPham, setDanhSachSanPham] = useState([]);
  const [sanPhamDaChon, setSanPhamDaChon] = useState([]);
  const [soLuongSanPham, setSoLuongSanPham] = useState({});
  const [moDialogSanPham, setMoDialogSanPham] = useState(false);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

  const [tệpHinhAnh, setTepHinhAnh] = useState(null);
  const [xemTruocHinhAnh, setXemTruocHinhAnh] = useState("");

  const [locTrangThai, setLocTrangThai] = useState("TAT_CA");

  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tongSoLuong, setTongSoLuong] = useState(0);
  const gioiHan = 10;

  const maXacThuc = getToken();

  const xuLyThayDoiTab = (_, giaTri) => {
    setTabHienTai(giaTri);
    setKhuyenMaiDangSua(null);

    if (giaTri === 0) {
      // reset form khi tạo mới
      setDuLieuForm({
        ten_khuyen_mai: "",
        ma_khuyen_mai: "",
        mo_ta: "",
        giam_gia: "",
        ngay_bat_dau: "",
        ngay_ket_thuc: "",
      });
      setSanPhamDaChon([]);
      setSoLuongSanPham({});
      setTepHinhAnh(null);
      setXemTruocHinhAnh("");
    }
  };

  const [duLieuForm, setDuLieuForm] = useState({
    ten_khuyen_mai: '',
    ma_khuyen_mai: '',
    mo_ta: '',
    giam_gia: '',
    ngay_bat_dau: '',
    ngay_ket_thuc: '',
  });

  const xuLyThayDoiNhapLieu = (e) => {
    const { name, value } = e.target;
    setDuLieuForm(truoc => ({
      ...truoc,
      [name]: value,
    }));
  };

  const xuLySua = (khuyenMai) => {
    setKhuyenMaiDangSua(khuyenMai);
    setDuLieuForm({
      ten_khuyen_mai: khuyenMai.ten_khuyen_mai,
      ma_khuyen_mai: khuyenMai.ma_code,
      mo_ta: khuyenMai.mo_ta || "",
      giam_gia: khuyenMai.giam_gia,
      ngay_bat_dau: khuyenMai.ngay_bat_dau.slice(0, 16), 
      ngay_ket_thuc: khuyenMai.ngay_ket_thuc.slice(0, 16),
    });

    // Set ảnh nếu có
    if (khuyenMai.hinh_anhs?.length > 0) {
      setXemTruocHinhAnh(khuyenMai.hinh_anhs[0].duong_dan);
    }

    // Set sản phẩm
    const danhSachChon = khuyenMai.san_phams?.map(sp => sp);
    setSanPhamDaChon(danhSachChon);

    const soLuong = {};
    khuyenMai.san_phams?.forEach(sp => {
      soLuong[sp.ma_san_pham] = sp.so_luong;
    });
    setSoLuongSanPham(soLuong);

    setTabHienTai(1);
  };

  const xuLyThayDoiHinhAnh = (e) => {
    const tệp = e.target.files[0];
    if (tệp) {
      setTepHinhAnh(tệp);
      setXemTruocHinhAnh(URL.createObjectURL(tệp));
    }
  };

  useEffect(() => {
    taiDanhSachSanPham();
  },[]);

  useEffect(() => {
    taiDanhSachKhuyenMai();
  }, [trangHienTai, locTrangThai]);

  const taiDanhSachSanPham = async () => {
    try {
      const phanHoi = await api.get(`/users/tat-ca-san-pham`);
      if (phanHoi.data.success) setDanhSachSanPham(phanHoi.data.data);
    } catch (err) {
      console.error("Lấy danh sách sản phẩm thất bại", err);
    }
  };

  const taiDanhSachKhuyenMai = async () => {
    try {
      const offset = (trangHienTai - 1) * gioiHan;
      const phanHoi = await api.get(`/manager/danh-sach-khuyen-mai`, {
        params:{
          limit: gioiHan,
          offset,
          tu_khoa: tuKhoaTimKiem || undefined,
          trang_thai: locTrangThai
        },
        headers: { 
          Authorization: `Bearer ${maXacThuc}`, 
        }
      });
      if (phanHoi.data.success) {
        setDanhSachKhuyenMai(phanHoi.data.data.items);
        setTongSoLuong(phanHoi.data.data.total);
      }
    } catch (err) {
      console.log("Có lỗi khi lấy danh sách khuyến mãi", err);
    }
  };

  const danhSachSanPhamLoc = danhSachSanPham.filter(p =>
    p.ten_san_pham.toLowerCase().includes(tuKhoaTimKiem.toLowerCase())
  );

  const xuLyChonSanPham = (sanPham) => {
    setSanPhamDaChon(truoc => {
      const tonTai = truoc.find(p => p.ma_san_pham === sanPham.ma_san_pham);
      const soLuongMoi = { ...soLuongSanPham };
      if (tonTai) {
        // bỏ chọn
        const capNhat = truoc.filter(p => p.ma_san_pham !== sanPham.ma_san_pham);
        delete soLuongMoi[sanPham.ma_san_pham];
        setSoLuongSanPham(soLuongMoi);
        return capNhat;
      }
      soLuongMoi[sanPham.ma_san_pham] = 1;
      setSoLuongSanPham(soLuongMoi);
      return [...truoc, sanPham];
    });
  };

  const hienThiChipTrangThai = (trangThai) => {
    const anhXaBackendSangFrontend = {
      "CHO_XU_LY": "pending",
      "DA_DUYET": "approved",
      "DA_HUY": "rejected",
    };

    const trangThaiFe = anhXaBackendSangFrontend[trangThai];

    const anhXa = {
      pending: { label: "Chờ duyệt", color: "warning" },
      approved: { label: "Đã duyệt", color: "success" },
      rejected: { label: "Từ chối", color: "error" },
    };

    return <Chip label={anhXa[trangThaiFe].label} color={anhXa[trangThaiFe].color} size="small" />;
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
      duLieuGui.append(
        "san_phams",
        JSON.stringify(
          sanPhamDaChon.map(p => ({
            ma_san_pham: p.ma_san_pham,
            so_luong: soLuongSanPham[p.ma_san_pham] || 1,
          }))
        )
      );

      if (tệpHinhAnh) {
        duLieuGui.append("hinh_anh", tệpHinhAnh);
      }

      let phanHoi;
      if (khuyenMaiDangSua) {
        phanHoi = await api.put(`/manager/cap-nhat-khuyen-mai/${khuyenMaiDangSua.ma_khuyen_mai}`, duLieuGui, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${maXacThuc}`,
          },
        });
        alert("Cập nhật khuyến mãi thành công!");
      } else {
        phanHoi = await api.post("/manager/tao-khuyen-mai", duLieuGui, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${maXacThuc}`, 
          },
        });
        alert("Thêm khuyến mãi thành công!");
      }

      taiDanhSachKhuyenMai();

      setDuLieuForm({
        ten_khuyen_mai: "",
        ma_khuyen_mai: "",
        mo_ta: "",
        giam_gia: "",
        ngay_bat_dau: "",
        ngay_ket_thuc: "",
      });

      setSanPhamDaChon([]);
      setSoLuongSanPham({});
      setTepHinhAnh(null);
      setXemTruocHinhAnh("");
      setKhuyenMaiDangSua(null);
      setTabHienTai(0);

    } catch (err) {
      console.error(err);
      alert(err.phanHoi?.data?.message || err.message || "Lưu khuyến mãi thất bại");
    }
  };

  return (
    <PageWrapper title="Quản lý khuyến mãi">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabHienTai} onChange={xuLyThayDoiTab}>
          <Tab label="Danh sách khuyến mãi" />
          <Tab label={khuyenMaiDangSua ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi"} />
        </Tabs>
      </Box>

      {/* Danh sách */}
      {tabHienTai === 0 && (
        <>
        <Paper elevation={0} sx={{ mb: 1, borderRadius: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    label="Tìm khuyến mãi"
                    placeholder="Nhập tên khuyến mãi..."
                    value={tuKhoaTimKiem}
                    onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setTrangHienTai(1);
                        taiDanhSachKhuyenMai();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={(e) => {
                            setTrangHienTai(1);
                            taiDanhSachKhuyenMai();
                          }}>
                          <Search />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
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
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #eee" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên khuyến mãi</TableCell>
                <TableCell>Mã</TableCell>
                <TableCell>Giảm (%)</TableCell>
                <TableCell>Ngày bắt đầu</TableCell>
                <TableCell>Ngày kết thúc</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {danhSachKhuyenMai.map((promo) => (
                <TableRow key={promo.ma_khuyen_mai} hover>
                  <TableCell>{promo.ten_khuyen_mai}</TableCell>
                  <TableCell>{promo.ma_code}</TableCell>
                  <TableCell>{promo.giam_gia}%</TableCell>
                  <TableCell>{promo.ngay_bat_dau}</TableCell>
                  <TableCell>{promo.ngay_ket_thuc}</TableCell>
                  <TableCell>{hienThiChipTrangThai(promo.trang_thai)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => xuLySua(promo)}>
                      <EditOutlined />
                    </IconButton>
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
                onChange={(_, v) => setTrangHienTai(v)}
                color="primary"
                shape="rounded"
              />
            </Stack>
        </>
        
      )}

      {/* Form thêm / sửa */}
      {tabHienTai === 1 && (
        <Stack spacing={3} >
          <TextField label="Tên khuyến mãi" name="ten_khuyen_mai" value={duLieuForm.ten_khuyen_mai} onChange={xuLyThayDoiNhapLieu} fullWidth />
          <TextField label="Mã khuyến mãi" name="ma_khuyen_mai" value={duLieuForm.ma_khuyen_mai} onChange={xuLyThayDoiNhapLieu} fullWidth />
          <TextField label="Mô tả" name="mo_ta" value={duLieuForm.mo_ta} onChange={xuLyThayDoiNhapLieu} fullWidth />
          <TextField label="Phần trăm giảm" name="giam_gia" type="number" value={duLieuForm.giam_gia} onChange={xuLyThayDoiNhapLieu} fullWidth />
          <TextField label="Ngày bắt đầu" name="ngay_bat_dau" type="datetime-local" value={duLieuForm.ngay_bat_dau} onChange={xuLyThayDoiNhapLieu} InputLabelProps={{ shrink: true }}/>
          <TextField label="Ngày kết thúc" name="ngay_ket_thuc" type="datetime-local" value={duLieuForm.ngay_ket_thuc} onChange={xuLyThayDoiNhapLieu} InputLabelProps={{ shrink: true }} />
          <Stack>
            {xemTruocHinhAnh && <img src={xemTruocHinhAnh} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 4 }} />}
            <TextField type="file" onChange={xuLyThayDoiHinhAnh} />
          </Stack>
          <OutlinedInput
            fullWidth
            placeholder="Chọn sản phẩm..."
            readOnly
            value=
              {sanPhamDaChon.length > 0
                ? `${sanPhamDaChon.length} sản phẩm đã chọn`
                : "Chọn sản phẩm..."
              }
              onClick={() => setMoDialogSanPham(true)}
              endAdornment={
              <IconButton onClick={() => setMoDialogSanPham(true)}>
                <ArrowDropDownIcon />
              </IconButton>
              }
              sx={{ cursor: "pointer" }}
            />

            {sanPhamDaChon.length > 0 && (
              <Stack spacing={1} sx={{ mt: 1 }}>
                {sanPhamDaChon.map((p) => (
                  <Box
                    key={p.ma_san_pham}
                    sx={{
                      p: 1,
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2
                      }}
                   >
                    <Typography sx={{ flex: 1 }}>{p.ten_san_pham}</Typography>
                      {/* Ô nhập số lượng */}
                      <TextField
                        type="number"
                        size="small"
                        sx={{ width: 100 }}
                        value={soLuongSanPham[p.ma_san_pham] || 1}
                        onChange={(e) =>
                        setSoLuongSanPham((truoc) => ({
                          ...truoc,
                          [p.ma_san_pham]: Math.max(1, parseInt(e.target.value) || 1),
                          }))
                        }
                      />

                      <Button
                        size="small"
                        color="error"
                        onClick={() =>
                          xuLyChonSanPham(p)
                        }
                      >
                        Xoá
                      </Button>
                    </Box>
                ))}
              </Stack>
            )}

            <Divider />
            <Button variant="contained" startIcon={<AddCircleOutline />} onClick={xuLyLuuKhuyenMai}>Lưu khuyến mãi</Button>
        </Stack>
      )}

      <Dialog open={moDialogSanPham} onClose={() => setMoDialogSanPham(false)} fullWidth maxWidth="sm">
        <DialogTitle>Chọn sản phẩm</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Tìm theo tên sản phẩm..."
            value={tuKhoaTimKiem}
            onChange={(e) => setTuKhoaTimKiem(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />
          <List>
            {danhSachSanPhamLoc.map(product => {
              const laSanPhamDaChon = sanPhamDaChon.some(p => p.ma_san_pham === product.ma_san_pham);
              return (
                <React.Fragment key={product.ma_san_pham}>
                  <ListItemButton selected={laSanPhamDaChon} onClick={() => xuLyChonSanPham(product)}>
                    <ListItemText primary={product.ten_san_pham} />
                  </ListItemButton>
                </React.Fragment>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}