import React, { useEffect, useState, useMemo } from "react";
import {
  Paper, Grid, Stack, InputLabel, OutlinedInput, IconButton, Dialog,
  DialogTitle, DialogContent, TextField, List, ListItemButton, ListItemText,
  Divider, Typography, Box, FormControl, RadioGroup, FormControlLabel,
  Radio, Button,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GioHangItem from "../../../components/User/Cart/GioHangItem";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../utils/auth";
import api from "../../../api";

export default function Cart() {
  const navigate = useNavigate();
  const user = getUser();
  const token = user?.token;

  const [danhSachSanPham, setDanhSachSanPham] = useState([]);
  const [danhSachChiNhanh, setDanhSachChiNhanh] = useState([]);
  const [hoTen, setHoTen] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [chiNhanhDaChon, setChiNhanhDaChon] = useState(null);
  const [moDialogChiNhanh, setMoDialogChiNhanh] = useState(false);
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState("cod");

  // Voucher states
  const [maGiamGiaInput, setMaGiamGiaInput] = useState(""); // Dùng cho TextField
  const [voucherHienTai, setVoucherHienTai] = useState(null); // Lưu object voucher đang áp dụng
  const [moDialogVoucher, setMoDialogVoucher] = useState(false);
  const [tatCaKhuyenMai, setTatCaKhuyenMai] = useState([]);

  /* ===================== LOAD DATA ===================== */
  useEffect(() => {
    if (!token) return;
    layGioHang();
    layThongTinNguoiDung();
    layDanhSachKhuyenMai();
  }, [token]);

  const layGioHang = async () => {
    try {
      const res = await api.get("/users/gio-hang", { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setDanhSachSanPham(res.data.data);
      const cn = await api.get("/users/danh-sach-chi-nhanh");
      if (cn.data.success) setDanhSachChiNhanh(cn.data.data);
    } catch (e) { console.error(e); }
  };

  const layThongTinNguoiDung = async () => {
    try {
      const res = await api.get("/users/thong-tin-ca-nhan", { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setHoTen(res.data.data.ho_ten || "");
        setSoDienThoai(res.data.data.so_dien_thoai || "");
        setDiaChi(res.data.data.dia_chi || "");
      }
    } catch (e) { console.error(e); }
  };

  const layDanhSachKhuyenMai = async () => {
    try {
      const res = await api.get("/users/danh-sach-khuyen-mai");
      if (res.data.success) setTatCaKhuyenMai(res.data.data);
    } catch (e) { console.error(e); }
  };

  /* ===================== TÍNH TIỀN ===================== */
  const tinhTien = useMemo(() => {
    let tamTinh = 0;
    let tienGiam = 0;

    danhSachSanPham.forEach((item) => {
      const rowPrice = item.gia_tien * item.so_luong;
      tamTinh += rowPrice;

      if (voucherHienTai) {
        const listApDung = voucherHienTai.san_pham_ap_dung || [];
        // Nếu list rỗng = áp dụng tất cả, nếu có list thì check ma_san_pham
        const duocGiam = listApDung.length === 0 || listApDung.includes(item.ma_san_pham);
        if (duocGiam) {
          tienGiam += rowPrice * (voucherHienTai.giam_gia / 100);
        }
      }
    });

    return {
      tongTamTinh: tamTinh,
      soTienGiam: Math.round(tienGiam),
      tongTien: tamTinh - tienGiam,
    };
  }, [danhSachSanPham, voucherHienTai]);

  const { tongTamTinh, soTienGiam, tongTien } = tinhTien;

  /* ===================== ÁP DỤNG MÃ GIẢM GIÁ ===================== */
  const apDungMaGiamGia = async (code) => {
    const maToProcess = (code || maGiamGiaInput).trim().toUpperCase();
    if (!maToProcess) return;

    try {
      const res = await api.get(`/users/khuyen-mai/${maToProcess}`);
      const km = res.data.data;

      if (!km) {
        alert("Mã không tồn tại");
        return;
      }

      // Kiểm tra xem giỏ hàng có sản phẩm nào thuộc diện được giảm không
      const listSP = km.san_pham_ap_dung || [];
      if (listSP.length > 0) {
        const coSPHopLe = danhSachSanPham.some(sp => listSP.includes(sp.ma_san_pham));
        if (!coSPHopLe) {
          alert("Mã này không áp dụng cho các sản phẩm trong giỏ hàng của bạn.");
          return;
        }
      }

      // Cập nhật voucher đang sử dụng
      setVoucherHienTai(km);
      setMaGiamGiaInput(km.ma_code);
      setMoDialogVoucher(false);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi áp dụng mã");
    }
  };

  const huyMaGiamGia = () => {
    setVoucherHienTai(null);
    setMaGiamGiaInput("");
  };

  /* ===================== GIỎ HÀNG ===================== */
  const capNhatSoLuong = async (ma, sl) => {
    if (sl < 1) return xoaSanPham(ma);
    try {
      await api.put("/users/cap-nhat-so-luong-gio-hang", null, {
        params: { ma_san_pham: ma, so_luong: sl },
        headers: { Authorization: `Bearer ${token}` },
      });
      layGioHang();
    } catch (e) { console.error(e); }
  };

  const xoaSanPham = async (ma) => {
    try {
      await api.delete("/users/xoa-san-pham-gio-hang", {
        params: { ma_san_pham: ma },
        headers: { Authorization: `Bearer ${token}` },
      });
      layGioHang();
    } catch (e) { console.error(e); }
  };

  /* ===================== THANH TOÁN ===================== */
  const thanhToan = async () => {
    if (!hoTen || !soDienThoai || !diaChi || !chiNhanhDaChon)
      return alert("Vui lòng điền đầy đủ thông tin");

    const payload = {
      ma_chi_nhanh: chiNhanhDaChon.ma_chi_nhanh,
      ho_ten: hoTen,
      dia_chi_giao_hang: diaChi,
      so_dien_thoai: soDienThoai,
      ma_khuyen_mai: voucherHienTai ? voucherHienTai.ma_code : null,
      tien_giam: soTienGiam,
      tong_tien: tongTien,
      phuong_thuc_thanh_toan: phuongThucThanhToan,
      chi_tiet_san_pham: danhSachSanPham.map((sp) => {
        const listApDung = voucherHienTai?.san_pham_ap_dung || [];
        const duocGiam = voucherHienTai && (listApDung.length === 0 || listApDung.includes(sp.ma_san_pham));
        const giaSauGiam = duocGiam 
          ? Math.round(sp.gia_tien * (1 - voucherHienTai.giam_gia / 100)) 
          : sp.gia_tien;
        return {
          ma_san_pham: sp.ma_san_pham,
          so_luong: sp.so_luong,
          gia_goc: sp.gia_tien,
          gia_sau_giam: giaSauGiam,
        };
      }),
    };

    try {
      const res = await api.post("/users/thanh-toan", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const { payment_url, ma_don_hang } = res.data.data;
        if (payment_url) {
          window.location.href = payment_url;
        } else {
          alert("🎉 Đặt hàng thành công (Thanh toán khi nhận hàng)");
          navigate("/");
        }
      }
    } catch (e) {
      alert(e.response?.data?.message || "Lỗi đặt hàng");
    }
  };

  if (!token) return <Box sx={{ p: 5 }}><Typography align="center">Vui lòng đăng nhập</Typography></Box>;
  if (danhSachSanPham.length === 0) return <Box sx={{ p: 5 }}><Typography align="center">Giỏ hàng trống</Typography></Box>;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", py: 4, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: { xs: "95%", md: "85%", lg: "70%" }, bgcolor: "white", borderRadius: 3, boxShadow: 3, overflow: "hidden" }}>
        
        <Box sx={{ bgcolor: "primary.main", color: "white", p: 2, display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: "white", mr: 1 }}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" fontWeight="bold">Giỏ hàng & Thanh toán</Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={4}>
            {/* Left Column: Info & Products */}
            <Grid size={{ xs: 12, md: 12 }}>
              <Stack spacing={3}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>🧍 Thông tin người nhận</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6}}><TextField label="Họ tên" fullWidth value={hoTen} onChange={(e) => setHoTen(e.target.value)}  /></Grid>
                    <Grid size={{ xs: 12, md: 6}}><TextField label="SĐT" fullWidth value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)}  /></Grid>
                    <Grid size={{ xs: 12, md: 6}}><TextField label="Địa chỉ" fullWidth value={diaChi} onChange={(e) => setDiaChi(e.target.value)}  /></Grid>
                    <Grid size={{ xs: 12, md: 6}}>
                      <Button fullWidth variant="outlined" sx={{ justifyContent: 'space-between' }} onClick={() => setMoDialogChiNhanh(true)}>
                        {chiNhanhDaChon ? chiNhanhDaChon.ten_chi_nhanh : "Chọn chi nhánh nhận hàng"}
                        <ArrowDropDownIcon />
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>🛍️ Sản phẩm</Typography>
                  <Stack divider={<Divider />} spacing={2}>
                    {danhSachSanPham.map(item => {
                      const giaGocRow = item.gia_tien * item.so_luong;
                      const isItemDiscounted = voucherHienTai && (voucherHienTai.san_pham_ap_dung.length === 0 || voucherHienTai.san_pham_ap_dung.includes(item.ma_san_pham));
                      const giaSauGiam = isItemDiscounted ? giaGocRow * (1 - voucherHienTai.giam_gia/100) : null;

                      return (
                        <GioHangItem
                          key={item.ma_san_pham}
                          tenSanPham={item.ten_san_pham}
                          giaMotKg={item.gia_tien}
                          hinhAnh={item.hinh_anhs[0]?.duong_dan}
                          soLuong={item.so_luong}
                          giaGocTong={giaGocRow}
                          giaSauGiam={giaSauGiam}
                          khiThayDoiSoLuong={(q) => capNhatSoLuong(item.ma_san_pham, q)}
                          khiXoa={() => xoaSanPham(item.ma_san_pham)}
                        />
                      );
                    })}
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            {/* Right Column: Payment & Summary */}
            <Grid size={{ xs: 12, md: 12}}> 
              <Stack spacing={3}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fffcf5" }}>
                  <Typography variant="subtitle1" fontWeight="bold">💳 Thanh toán</Typography>
                  <RadioGroup value={phuongThucThanhToan} onChange={(e) => setPhuongThucThanhToan(e.target.value)}>
                    <FormControlLabel value="cod" control={<Radio />} label="Tiền mặt (COD)" />
                    <FormControlLabel value="vnpay" control={<Radio />} label="VNPay" />
                  </RadioGroup>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>🎟️ Voucher</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      color={voucherHienTai ? "success" : "primary"}
                      onClick={() => setMoDialogVoucher(true)}
                      sx={{ borderStyle: 'dashed', textTransform: 'none' }}
                    >
                      {voucherHienTai ? `Mã: ${voucherHienTai.ma_code} (-${voucherHienTai.giam_gia}%)` : "Chọn hoặc nhập mã"}
                    </Button>
                    {voucherHienTai && (
                      <Button variant="contained" color="error" onClick={huyMaGiamGia}>Hủy</Button>
                    )}
                  </Box>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa" }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Tạm tính</Typography>
                      <Typography>{tongTamTinh.toLocaleString()} ₫</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Giảm giá</Typography>
                      <Typography color="error">-{soTienGiam.toLocaleString()} ₫</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight="bold">Tổng cộng</Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">{tongTien.toLocaleString()} ₫</Typography>
                    </Box>
                    <Button variant="contained" color="success" fullWidth size="large" sx={{ mt: 1, fontWeight: 'bold' }} onClick={thanhToan}>ĐẶT HÀNG NGAY</Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Dialog Voucher */}
      <Dialog open={moDialogVoucher} onClose={() => setMoDialogVoucher(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Chọn khuyến mãi</DialogTitle>
        <DialogContent dividers sx={{ bgcolor: "#f8f9fa" }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField 
              fullWidth size="small" placeholder="Nhập mã..." 
              value={maGiamGiaInput} 
              onChange={(e) => setMaGiamGiaInput(e.target.value)} 
              sx={{ bgcolor: "white" }}
            />
            <Button variant="contained" onClick={() => apDungMaGiamGia()}>Áp dụng</Button>
          </Box>
          <Stack spacing={2}>
            {tatCaKhuyenMai.map((km) => (
              <Paper 
                key={km.ma_khuyen_mai}
                onClick={() => apDungMaGiamGia(km.ma_code)}
                sx={{ 
                  p: 1.5, display: 'flex', cursor: 'pointer',
                  border: voucherHienTai?.ma_code === km.ma_code ? '2px solid #2e7d32' : '1px solid #ddd',
                  '&:hover': { boxShadow: 2 }
                }}
              >
                <Box sx={{ bgcolor: 'error.main', color: 'white', p: 1, borderRadius: 1, minWidth: 50, textAlign: 'center', mr: 2 }}>
                  <Typography variant="body2" fontWeight="bold">{km.giam_gia}%</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">{km.ma_code}</Typography>
                  <Typography variant="caption" color="text.secondary">{km.mo_ta}</Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Dialog Chi Nhánh */}
      <Dialog open={moDialogChiNhanh} onClose={() => setMoDialogChiNhanh(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Chi nhánh</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth size="small" placeholder="Tìm kiếm..." sx={{ mb: 2 }} onChange={(e) => setTuKhoaTimKiem(e.target.value)} />
          <List>
            {danhSachChiNhanh.filter(b => b.ten_chi_nhanh.toLowerCase().includes(tuKhoaTimKiem.toLowerCase())).map(b => (
              <ListItemButton key={b.ma_chi_nhanh} onClick={() => { setChiNhanhDaChon(b); setMoDialogChiNhanh(false); }}>
                <ListItemText primary={b.ten_chi_nhanh} secondary={b.dia_chi} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
}