import React, { useEffect, useState } from "react";
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
    Stack,
    Typography,
    OutlinedInput, 
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    List,
    ListItemButton,
    ListItemText,
    Divider,
    Button,
    Pagination, 
    Grid,
    InputAdornment
} from '@mui/material';

import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { EditOutlined, DeleteOutlined, AddCircleOutline, Search } from "@mui/icons-material";

import PageWrapper from '../../components/PageWrapper';
import api from "../../api";
import { getToken } from "../../utils/auth";

export default function QuanLyTonKho() {
  const [tabDangChon, setTabDangChon] = useState(0);

  const [danhSachChiNhanh, setDanhSachChiNhanh] = useState([]);
  const [danhSachSanPham, setDanhSachSanPham] = useState([]);
  const [danhSachTonKho, setDanhSachTonKho] = useState([]);

  const [chiNhanhDangChon, setChiNhanhDangChon] = useState(null);
  const [tonKhoDangSua, setTonKhoDangSua] = useState(null);

  const [sanPhamDaChon, setSanPhamDaChon] = useState([]);
  const [soLuongTheoSanPham, setSoLuongTheoSanPham] = useState({});
  const [soLuong, setSoLuong] = useState("");

  const [moDialogChiNhanh, setMoDialogChiNhanh] = useState(false);
  const [moDialogSanPham, setMoDialogSanPham] = useState(false);

  const [timChiNhanh, setTimChiNhanh] = useState("");
  const [timSanPham, setTimSanPham] = useState("");

  const [trang, setTrang] = useState(1);
  const [tongSo, setTongSo] = useState(0);

  const token = getToken();
  const gioiHan = 10;

  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");


  const chiNhanhLoc  = danhSachChiNhanh.filter(
    (b) =>
      b.ten_chi_nhanh.toLowerCase().includes(timChiNhanh.toLowerCase()) ||
      b.dia_chi.toLowerCase().includes(timChiNhanh.toLowerCase())
  );

  const sanPhamLoc  = danhSachSanPham.filter(
    (b) =>
      b.ten_san_pham.toLowerCase().includes(timSanPham.toLowerCase())
  );

  const doiTab = (event, newValue) => {
    setTabDangChon(newValue);
    setChiNhanhDangChon(null);
    setTonKhoDangSua(null);
    setSanPhamDaChon([]);
  };

  const chonChiNhanh  = (branch) => {
    setChiNhanhDangChon(branch);
    setMoDialogChiNhanh(false);
    setTimChiNhanh("");
  };

  const chonSanPham  = (sanPham) => {
    setSanPhamDaChon((dsCu) => {
      const daChon  = dsCu.find((p) => p.ma_san_pham === sanPham.ma_san_pham);
      if (daChon ) {
        // Bỏ chọn
        const dsMoi  = dsCu.filter((p) => p.ma_san_pham !== sanPham.ma_san_pham);
        const slMoi  = { ...soLuongTheoSanPham };
        delete slMoi [sanPham.ma_san_pham];
        setSoLuongTheoSanPham(slMoi );
        return dsMoi ;
      }
      setSoLuongTheoSanPham((q) => ({
        ...q,
        [sanPham.ma_san_pham]: 1, // default = 1
      }));

      return [...dsCu, sanPham];
    });
  };

  const suaTonKho  = (item) => {
    setTonKhoDangSua(item);
    setSoLuong(item.so_luong_ton);
    setTabDangChon(2);
  };

  useEffect(() => {
    layDanhSachChiNhanh();
    layDanhSachSanPham();
  }, []);

  useEffect(() => {
    layDanhSachChiNhanh();
    layDanhSachSanPham();
    layDanhSachTonKho();
  }, [trang,chiNhanhDangChon]);

  const layDanhSachChiNhanh = async () => {
    try{
      const res = await api.get(`/admins/danh-sach-chi-nhanh`, {
        headers:{ Authorization: `Bearer ${token}` },
      });
      if(res.data.success){
        setDanhSachChiNhanh(res.data.data);
      }
    }catch(error){  
      console.log("Không lấy được danh sách chi nhánh", error);
    }
  };

  const layDanhSachSanPham = async () =>{
    try{
      const res = await api.get(`/users/tat-ca-san-pham`);
      if (res.data.success){
        setDanhSachSanPham(res.data.data);
      }
    }catch(error){
      console.log("Lấy danh sách sản phẩm thất bại", error)
    }
  };

  const layDanhSachTonKho = async () => {
    try {
      const offset = (trang - 1) * gioiHan;
      const res = await api.get(`/admins/danh-sach-ton-kho`, { 
        params: {
          limit: gioiHan,
          offset,
          tu_khoa: tuKhoaTimKiem || undefined,
          ma_chi_nhanh: chiNhanhDangChon?.ma_chi_nhanh || undefined
        },
        headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setDanhSachTonKho(res.data.data.items);
        setTongSo(res.data.data.total);
      }
    } catch (err) {
      console.error("Lấy tồn kho thất bại", err);
    }
  };

  const themTonKho  = async () => {
    if (sanPhamDaChon.length === 0 || !chiNhanhDangChon) {
      alert("Vui lòng chọn sản phẩm, chi nhánh và số lượng");
      return;
    }

    try {
      // chuẩn bị payload gửi API
      const payload = {
        items: sanPhamDaChon.map(p => ({
          ma_san_pham: p.ma_san_pham,
          ma_chi_nhanh: chiNhanhDangChon.ma_chi_nhanh,
          so_luong_ton: soLuongTheoSanPham[p.ma_san_pham] || 1
        }))
      };

      console.log("Payload gửi đi:", payload);

      const res = await api.post("/admins/them-nhieu-ton-kho", payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });

      console.log("Response từ API:", res.data);

      const { data = [], errors = [], message } = res.data;

      let alertMsg = "";

      if (data.length > 0) {
        alertMsg += `✅ Thêm thành công ${data.length} sản phẩm\n`;
      }

      if (errors.length > 0) {
        alertMsg += `❌ Thất bại ${errors.length} sản phẩm:\n`;
        errors.forEach((err, idx) => {
          alertMsg += `${idx + 1}. ${err}\n`;
        });
      }

      if (alertMsg) alert(alertMsg);

      layDanhSachTonKho();
      setSanPhamDaChon([]);
      setChiNhanhDangChon(null);
      setSoLuongTheoSanPham({});
      setTabDangChon(0);

    } catch (err) {
      console.error("Lỗi Axios:", err);
      let errorMsg = "Thêm thất bại";

      if (err.response?.data) {
        if (err.response.data.detail) errorMsg = err.response.data.detail;
        else if (err.response.data.message) errorMsg = err.response.data.message;
        else errorMsg = JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMsg = err.message;
      }

      alert(errorMsg);
    }
  };


  const capNhatTonKho  = async() => {
    if(soLuong === "")
      return alert("Vui lòng nhập số lượng");

    try{
      const ma_chi_nhanh = tonKhoDangSua.ma_chi_nhanh;
      const ma_san_pham = tonKhoDangSua.ma_san_pham;

      const res = await api.put(
        `/admins/cap-nhat-ton-kho/${ma_san_pham}/${ma_chi_nhanh}`,
        { so_luong_ton: parseInt(soLuong) },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if(res.data.success){
        alert(res.data.message);
        layDanhSachTonKho();
        setSoLuong("");
        setChiNhanhDangChon(null);
        setSanPhamDaChon([]);
        setTonKhoDangSua(null);
        setTabDangChon(0);
      }
    }catch(err){
      console.error("Lỗi Axios:", err);
      let errorMsg = "Cập nhật thất bại";

      if (err.response?.data) {
        if (err.response.data.detail) errorMsg = err.response.data.detail;
        else if (err.response.data.message) errorMsg = err.response.data.message;
        else errorMsg = JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMsg = err.message;
      }

      alert(errorMsg);
    }
  };


  return (
    <PageWrapper title="Quản lý tồn kho">

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabDangChon} onChange={doiTab}>
          <Tab label="Danh sách hàng tồn kho" />
          <Tab label="Thêm sản phẩm cho chi nhánh" />
          {tonKhoDangSua && <Tab label="Cập nhật tồn kho" />}
        </Tabs>
      </Box>

      {/* TAB 1 */}
      {tabDangChon === 0 && (
        <Box>
          <Paper elevation={0} sx={{ mb: 1, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Tìm sản phẩm"
                  placeholder="Nhập tên sản phẩm..."
                  value={tuKhoaTimKiem}
                  onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setTrang(1);
                      layDanhSachTonKho();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={(e) => {
                          setTrang(1);
                          layDanhSachTonKho();
                        }}>
                        <Search />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <OutlinedInput
                    placeholder="Chọn chi nhánh..."
                    value={ chiNhanhDangChon ? chiNhanhDangChon.ten_chi_nhanh : "Tất cả chi nhánh" }
                    readOnly
                    fullWidth
                    endAdornment={
                      <IconButton onClick={() => setMoDialogChiNhanh(true)}>
                        <ArrowDropDownIcon />
                      </IconButton>
                    }
                    onClick={() => setMoDialogChiNhanh(true)}
                    sx={{ cursor: "pointer" }}  
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
                  <TableCell>Chi nhánh</TableCell>
                  <TableCell align="center">Số lượng</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {danhSachTonKho.map((item) => (
                  <TableRow key={item.ma_san_pham} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={item.hinh_anhs?.[0]?.duong_dan || ""}
                        sx={{ width: 50, height: 50, objectFit: "cover" }}
                      />
                    </TableCell>

                    <TableCell>{item.ten_san_pham}</TableCell>
                    <TableCell>{item.ten_chi_nhanh}</TableCell>
                    <TableCell align="center">{item.so_luong_ton}</TableCell>

                    <TableCell align="right">
                      <IconButton color="primary" size="small" onClick={() => suaTonKho (item)}>
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
          <Stack spacing={2} alignItems="center" sx={{ mt: 2, mb: 4 }}>
              <Pagination
                count={Math.ceil(tongSo / gioiHan)}
                page={trang}
                onChange={(_, value) => setTrang(value)}
                color="primary"
                shape="rounded"
              />
            </Stack>
        </Box>
      )}

      {/* TAB 2 — THÊM TỒN KHO */}
      {tabDangChon === 1 && (
        <Stack spacing={3}>
          
          <OutlinedInput
            placeholder="Chọn sản phẩm..."
            value={
              sanPhamDaChon.length > 0
                ? `${sanPhamDaChon.length} sản phẩm đã chọn`
                : "Chọn sản phẩm..."
            }
            readOnly
            fullWidth
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
                    value={soLuongTheoSanPham[p.ma_san_pham] || 1}
                    onChange={(e) =>
                      setSoLuongTheoSanPham((prev) => ({
                        ...prev,
                        [p.ma_san_pham]: Math.max(1, parseInt(e.target.value) || 1),
                      }))
                    }
                  />

                  <Button
                    size="small"
                    color="error"
                    onClick={() =>
                      chonSanPham (p) // bỏ chọn
                    }
                  >
                    Xoá
                  </Button>
                </Box>
              ))}
            </Stack>
          )}


          {/* SELECT BRANCH */}
          <OutlinedInput
            placeholder="Chọn chi nhánh..."
            value={ chiNhanhDangChon ? chiNhanhDangChon.ten_chi_nhanh : "Chọn chi nhánh..." }
            readOnly
            fullWidth
            onClick={() => setMoDialogChiNhanh(true)}
            endAdornment={
              <IconButton onClick={() => setMoDialogChiNhanh(true)}>
                <ArrowDropDownIcon />
              </IconButton>
            }
            sx={{ cursor: "pointer" }}
          />

          <Divider />

          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={themTonKho }
          >
            Thêm
          </Button>
        </Stack>
      )}

      {/* --- TAB 3: UPDATE TỒN KHO --- */}
      {tabDangChon === 2 && tonKhoDangSua && (
        <Stack spacing={3}>
          {/* Sản phẩm */}
          <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 1 }} alignItems="center">
            <OutlinedInput
              id="sanpham"
              name="sanpham"
              placeholder="Chọn sản phẩm..."
              value={tonKhoDangSua.ten_san_pham}
              readOnly
              fullWidth
              endAdornment={
                <IconButton disabled>
                  <ArrowDropDownIcon />
                </IconButton>
              }
              sx={{
                cursor: "not-allowed",
                "& .MuiInputBase-input": { cursor: "not-allowed" },
              }}
            />
          </Stack>

          {/* Chi nhánh */}
          <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 1 }} alignItems="center">
            <OutlinedInput
              id="chinhanh"
              name="chinhanh"
              placeholder="Chọn chi nhánh..."
              value={tonKhoDangSua.ten_chi_nhanh}
              readOnly
              fullWidth
              endAdornment={
                <IconButton disabled>
                  <ArrowDropDownIcon />
                </IconButton>
              }
              sx={{
                cursor: "not-allowed",
                "& .MuiInputBase-input": { cursor: "not-allowed" },
              }}
            />
          </Stack>

          {/* Số lượng */}
          <TextField
            fullWidth
            label="Số lượng tồn kho"
            name="soluong"
            type="number"
            value={soLuong}
            onChange={(e) => setSoLuong(e.target.value)}
          />

          <Divider sx={{ my: 2 }} />

          {/* Nút lưu thay đổi */}
          <Stack justifyContent="center">
            <Button
              variant="contained"
              startIcon={<EditOutlined />}
              color="primary"
              onClick={capNhatTonKho }
            >
              Lưu thay đổi
            </Button>
          </Stack>
        </Stack>
      )}

      {/* DIALOG CHỌN CHI NHÁNH */}
      <Dialog open={moDialogChiNhanh} onClose={() => setMoDialogChiNhanh(false)} fullWidth maxWidth="sm">
        <DialogTitle>Chọn chi nhánh</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Tìm theo tên hoặc địa chỉ..."
            value={timChiNhanh}
            onChange={(e) => setTimChiNhanh(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />
          {tabDangChon === 0 && (
            <>
              <ListItemButton onClick={() => chonChiNhanh (null)}>
                <ListItemText
                  primary="Tất cả chi nhánh"
                  secondary="Hiển thị toàn bộ dữ liệu tồn kho"
                />
              </ListItemButton>
              <Divider />
            </>
          )}

          <List>
            {chiNhanhLoc .map((branch) => (
              <React.Fragment key={branch.ma_chi_nhanh}>
                <ListItemButton onClick={() => chonChiNhanh (branch)}>
                  <ListItemText primary={branch.ten_chi_nhanh} secondary={branch.dia_chi} />
                </ListItemButton>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={moDialogSanPham} onClose={() => setMoDialogSanPham(false)} fullWidth maxWidth="sm">
        <DialogTitle>Chọn sản phẩm</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Tìm sản phẩm..."
            value={timSanPham}
            onChange={(e) => setTimSanPham(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />

          <List>
            {sanPhamLoc .map((product) => {
              const isSelected = sanPhamDaChon.some(
                (p) => p.ma_san_pham === product.ma_san_pham
              );

              return (
                <React.Fragment key={product.ma_san_pham}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => chonSanPham (product)}
                  >
                    <ListItemText primary={product.ten_san_pham} />
                  </ListItemButton>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}



