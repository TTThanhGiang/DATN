import React, { useEffect, useState } from "react";
import {
  Paper,
  Grid,
  Stack,
  InputLabel,
  OutlinedInput,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CartItem from "../../../components/User/Cart/CartItem";
import { useNavigate } from "react-router-dom";

import { getUser, getUserId } from "../../../utils/auth";
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

  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState("cash");

  const [maGiamGia, setMaGiamGia] = useState("");
  const [daApDungMa, setDaApDungMa] = useState(false);
  const [phanTramGiam, setPhanTramGiam] = useState(0);
  const [soTienGiam, setSoTienGiam] = useState(0);

  const [tongTamTinh, setTongTamTinh] = useState(0);

  const locChiNhanhs = danhSachChiNhanh.filter(
    (branch) =>
      branch.ten_chi_nhanh.toLocaleLowerCase().includes(tuKhoaTimKiem.toLocaleLowerCase()) || 
      branch.dia_chi.toLocaleLowerCase().includes(tuKhoaTimKiem.toLocaleLowerCase())
  );

  const chonChiNhanh = (chiNhanh) => {
    setChiNhanhDaChon(chiNhanh);
    setMoDialogChiNhanh(false);
  };

  useEffect(() => {
    layGioHang();
    layThongTinNguoiDung();
  }, []);

  const layGioHang = async () => {
    try {
      const response = await api.get("/users/gio-hang", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setDanhSachSanPham(response.data.data);
      }

      const chiNhanhRes = await api.get("/users/danh-sach-chi-nhanh");
      if (chiNhanhRes.data.success) {
        setDanhSachChiNhanh(chiNhanhRes.data.data);
      }

    } catch (loi) {
      console.error("Không lấy được giỏ hàng:", loi);
    }
  };

  const layThongTinNguoiDung = async () => {
    try {
      const res = await api.get("/users/thong-tin-ca-nhan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setHoTen(res.data.data.ho_ten);
        setSoDienThoai(res.data.data.so_dien_thoai);
        setDiaChi(res.data.data.dia_chi);
      }
    } catch (loi) {
      console.log("Lấy thông tin cá nhân thất bại", loi);
    }
  };

  useEffect(() => {
    const tamTinh = danhSachSanPham.reduce(
      (tong, sp) => tong + sp.gia_tien * sp.so_luong, 0
    );
    setTongTamTinh(tamTinh);
    if (daApDungMa) {
      const tienGiamMoi = tamTinh * phanTramGiam;
      setSoTienGiam(tienGiamMoi);
    }
    }, [danhSachSanPham]);

  const capNhatSoLuong = async (ma_san_pham, soLuongMoi) => {
    try {
      const res = await api.put(
        "/users/cap-nhat-so-luong-gio-hang",
        null,
        {
          params: {
            ma_san_pham,
            so_luong: parseInt(soLuongMoi),
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        const soLuongCapNhat = res.data.data.so_luong;

        if (soLuongCapNhat === 0) {
          setDanhSachSanPham((ds) =>
            ds.filter((sp) => sp.ma_san_pham !== ma_san_pham)
          );
        } else {
          setDanhSachSanPham((ds) =>
            ds.map((sp) =>
              sp.ma_san_pham === ma_san_pham
                ? { ...sp, so_luong: soLuongCapNhat }
                : sp
            )
          );
        }
      }
      window.dispatchEvent(new Event("cart-updated"));
    } catch (loi) {
      console.error("Cập nhật số lượng thất bại:", loi);
    }
  };

  const xoaSanPham = async (ma_san_pham) => {
    setDanhSachSanPham((ds) =>
      ds.filter((sp) => sp.ma_san_pham !== ma_san_pham)
    );

    try {
      await api.delete("/users/xoa-san-pham-gio-hang", {
        params: { ma_san_pham },
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (loi) {
      console.error("Xóa sản phẩm thất bại:", loi);
    }
    window.dispatchEvent(new Event("cart-updated"));
  };

  const thanhToan = async () => {
    if (!hoTen) {
      alert("Vui lòng nhập họ và tên.");
      return;
    }

    if (!soDienThoai) {
      alert("Vui lòng nhập số điện thoại.");
      return;
    }

    const regexSoDienThoai = /^(0|\+84)[0-9]{9}$/;
    if (!regexSoDienThoai.test(soDienThoai)) {
      alert("Số điện thoại không hợp lệ.");
      return;
    }

    if (!diaChi) {
      alert("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }

    if (!chiNhanhDaChon) {
      alert("Vui lòng chọn chi nhánh nhận hàng.");
      return;
    }

    try {
      const payload = {
        ma_chi_nhanh: chiNhanhDaChon.ma_chi_nhanh,
        ho_ten: hoTen,
        dia_chi_giao_hang: diaChi,
        so_dien_thoai: soDienThoai,
        tong_tien: tongTien
      };

      const res = await api.post("/users/thanh-toan", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        alert("🎉 Thanh toán thành công!");
        navigate("/");
      }
    } catch (loi) {
      alert("Thanh toán thất bại, vui lòng thử lại.");
      console.error(loi);
    }
  };

  const apDungMaGiamGia = async () => {
    if (!maGiamGia.trim()) return alert("Vui lòng nhập mã giảm giá");
    try {
      const res = await api.get(`/users/khuyen-mai/${maGiamGia}`);
      const km = res.data.data;

      if (!km) {
        alert(res.data.message || "Mã khuyến mãi không hợp lệ.");
        return;
      }

      const ngayHetHan = new Date(km.ngay_ket_thuc);
      if (new Date() > ngayHetHan) 
        return alert("Mã đã hết hạn");

      if (km.san_pham_ap_dung) {
        const danhSachMaSPTrongGio = danhSachSanPham.map(
          (item) => item.ma_san_pham
        );

        const coSanPhamHopLe = danhSachMaSPTrongGio.some((maSP) =>
          km.san_pham_ap_dung.includes(maSP)
        );

        if (!coSanPhamHopLe) {
          alert("Mã khuyến mãi không áp dụng cho sản phẩm trong giỏ hàng.");
          return;
        }
      }

      const phanTram = km.giam_gia; // ví dụ 0.1 = 10%
      const tienGiam = tongTamTinh * (phanTram/100);
      setPhanTramGiam(phanTram);
      setSoTienGiam(tienGiam);
      setDaApDungMa(true);
      alert("Áp dụng mã khuyến mãi thành công 🎉");

    } catch (error) {
      console.error("Áp dụng mã giảm giá thất bại:", error);
    }
  };

  const tongTien = tongTamTinh - soTienGiam

  // 1. Nếu chưa đăng nhập
  if (!getUser()) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" align="center" mt={4} color="error">
          Vui lòng đăng nhập để xem giỏ hàng.
        </Typography>
      </Box>
    );
  }

  // 2. Nếu đã đăng nhập nhưng giỏ hàng trống
  if (danhSachSanPham.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" align="center" mt={4}>
          Giỏ hàng của bạn đang trống.
        </Typography>
      </Box>
    );
  }

  if (!user || !token) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" align="center" mt={4} color="error">
          Vui lòng đăng nhập để xem giỏ hàng.
        </Typography>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "rgba(0,0,0,0.05)",
        display: "flex",
        justifyContent: "center",
        alignItems: { xs: "flex-start", md: "center" },
        py: { xs: 2, md: 0 },
      }}
    >
      <Box
        sx={{
          width: {
            xs: "100%",
            sm: "90%",
            md: "70%",
            lg: "60%",
          },
          bgcolor: "white",
          borderRadius: { xs: 0, sm: 3 },
          boxShadow: { xs: 0, sm: 6 },
          overflow: "hidden",
          display: "flex",
          m: 1
        }}
      >
        {/* Khung giỏ hàng tổng */}
        <Box
          sx={{
            width: "100%",
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: 6,
            overflow: "hidden",
          }}
        >
          {/* Thanh tiêu đề */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "primary.main",
              color: "white",
              px: 2,
              py: 1.5,
            }}
          >
            <IconButton
              size="small"
              sx={{ color: "white", mr: 1 }}
              onClick={() => window.history.back()}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">
              Giỏ hàng
            </Typography>
          </Box>

          {/* Nội dung chính */}
          <Box 
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              bgcolor: "#fafafa",
            }}
          >
            {/* Cụm: Thông tin người dùng */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                mb: 3,
                bgcolor: "white",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="primary.main"
                mb={2}
              >
                🧍 Thông tin người nhận
              </Typography>
              <form noValidate>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="hoten">Họ và tên</InputLabel>
                      <OutlinedInput 
                        id="hoten" 
                        type="text" 
                        name="hoten" 
                        placeholder="Họ và tên" 
                        fullWidth
                        value={hoTen}
                        onChange={(e) => setHoTen(e.target.value)}
                        />
                    </Stack>
                  </Grid>

                  <Grid size={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="sodienthoai">Số điện thoại</InputLabel>
                      <OutlinedInput 
                        id="sodienthoai" 
                        type="text" 
                        name="sodienthoai" 
                        placeholder="Nhập số điện thoại" 
                        fullWidth
                        value={soDienThoai}
                        onChange={(e) => setSoDienThoai(e.target.value)}
                      />
                    </Stack>
                  </Grid>

                  <Grid size={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="diachi">Địa chỉ</InputLabel>
                      <OutlinedInput 
                      id="diachi" 
                      type="text" 
                      name="diachi" 
                      placeholder="Nhập địa chỉ" 
                      fullWidth
                      value={diaChi}
                      onChange={(e) => setDiaChi(e.target.value)}
                      />
                    </Stack>
                  </Grid>
                  <Grid size={12}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="branch">Chi nhánh nhận hàng</InputLabel>
                      <OutlinedInput
                        id="branch"
                        name="branch"
                        placeholder="Chọn chi nhánh..."
                        value={chiNhanhDaChon ? `${chiNhanhDaChon.ten_chi_nhanh} - ${chiNhanhDaChon.dia_chi}` : ""}
                        readOnly
                        fullWidth
                        endAdornment={
                          <IconButton onClick={() => setMoDialogChiNhanh(true)}>
                            <ArrowDropDownIcon />
                          </IconButton>
                        }
                      />
                    </Stack>
                  </Grid>
                </Grid>
                
              </form>
            </Paper>
            {/* Dialog chọn chi nhánh */}
            <Dialog open={moDialogChiNhanh} onClose={() => setMoDialogChiNhanh(false)} fullWidth maxWidth="sm">
                  <DialogTitle>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <LocationOnIcon color="primary" />
                      <Typography variant="h6">Chọn chi nhánh nhận hàng</Typography>
                    </Stack>
                  </DialogTitle>
                  <DialogContent>
                    <TextField
                      fullWidth
                      placeholder="Tìm theo tên hoặc địa chỉ..."
                      value={tuKhoaTimKiem}
                      onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                      }}
                      sx={{ mb: 2 }}
                    />

                    <List>
                      {locChiNhanhs.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Không tìm thấy chi nhánh nào.
                        </Typography>
                      ) : (
                        locChiNhanhs.map((branch) => (
                          <React.Fragment key={branch.ma_chi_nhanh}>
                            <ListItemButton onClick={() => chonChiNhanh(branch)}>
                              <ListItemText
                                primary={branch.ten_chi_nhanh}
                                secondary={branch.dia_chi}
                              />
                            </ListItemButton>
                            <Divider />
                          </React.Fragment>
                        ))
                      )}
                    </List>
                  </DialogContent>
            </Dialog>

            {/* Cụm: Danh sách sản phẩm */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                mb: 3,
                bgcolor: "white",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="primary.main"
                mb={2}
              >
                🛍️ Sản phẩm trong giỏ
              </Typography>
              {danhSachSanPham.length === 0 ? (
                <Typography color="text.secondary">
                  Giỏ hàng của bạn đang trống.
                </Typography>
              ) : (
                <Stack sx={{ gap: 2 }}>
                  {danhSachSanPham.map(item => (
                    <CartItem
                      key={item.ma_san_pham}
                      name={item.ten_san_pham}
                      pricePerKg={item.gia_tien}
                      weight={item.don_vi}
                      image={item.hinh_anhs[0]?.duong_dan}
                      quantity={item.so_luong}
                      onQuantityChange={(newQty) => capNhatSoLuong(item.ma_san_pham, newQty)}
                      onDelete={() => xoaSanPham(item.ma_san_pham)}
                    />
                  ))}
                </Stack>
              )}
            </Paper>

            {/* Phương thức thanh toán */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography
              variant="subtitle1"
                fontWeight="bold"
                color="primary.main"
                mb={2}
              >
                💳 Phương thức thanh toán
              </Typography>
              <FormControl>
                <RadioGroup
                  value={phuongThucThanhToan}
                  onChange={(e) => setPhuongThucThanhToan(e.target.value)}
                >
                  <FormControlLabel
                    value="cash"
                    control={<Radio color="primary" />}
                    label="Thanh toán tiền mặt khi nhận hàng"
                  />
                  <FormControlLabel
                    value="vnpay"
                    control={<Radio color="primary" />}
                    label="Thanh toán qua VNPAY"
                  />
                </RadioGroup>
              </FormControl>
            </Paper>

            {/* Khuyễn mãi*/}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="primary.main"
                mb={2}
              >
                🎟️ Mã giảm giá
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  placeholder="Nhập mã giảm giá"
                  size="small"  
                  fullWidth
                  value={maGiamGia}
                  onChange={(e) => setMaGiamGia(e.target.value.toUpperCase())}
                />

                <Button
                  variant="contained"
                  disabled={daApDungMa}
                  onClick={apDungMaGiamGia}
                  sx={{
                    minWidth: 110,
                    height: 40,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                    background: "linear-gradient(90deg, #00C853, #009624)",
                    boxShadow: "0 4px 10px rgba(0, 200, 83, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(90deg, #00E676, #00C853)",
                      boxShadow: "0 6px 14px rgba(0, 200, 83, 0.4)",
                    },
                    "&.Mui-disabled": {
                      background: "#e0e0e0",
                      color: "#9e9e9e",
                      boxShadow: "none",
                    },
                  }}
                >
                  Áp dụng
                </Button>
              </Stack>
            </Paper>

            {/* Cụm: Tổng thanh toán */}
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "white",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="primary.main"
                mb={2}
              >
                💰 Tổng thanh toán
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="body1">Tạm tính</Typography>
                <Typography fontWeight="bold">{tongTamTinh.toLocaleString()} ₫</Typography>
              </Box>
              {soTienGiam > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="body1">Khuyến mãi</Typography>
                <Typography fontWeight="#d9bdbdff">- {soTienGiam.toLocaleString()} ₫</Typography>
              </Box>
              )}
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Tổng cộng
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {tongTien.toLocaleString()} ₫
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                sx={{ borderRadius: 2 }}
                onClick={thanhToan}
              >
                Thanh toán ngay
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );

}
