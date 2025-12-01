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
  const [cartItems, setCartItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [tab, setTab] = useState("Giao hàng tận nơi");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const navigate = useNavigate();

  const user = getUser()
  const token = user.token

  const filteredBranches = branches.filter(
    (branch) =>
      branch.ten_chi_nhanh.toLocaleLowerCase().includes(search.toLocaleLowerCase()) || 
      branch.dia_chi.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  );

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    setOpen(false);
  }

  useEffect(() => {
    const fetchCart = async () => {
      const userId = getUserId();
      try {
        const response = await api.get(`/users/gio-hang`, {
          headers:{
            Authorization: `Bearer ${token}`,
          }
        });
        if (response.data.success) {
          setCartItems(response.data.data); // data có so_luong
        }
        const branchesResponse = await api.get("/users/danh-sach-chi-nhanh");
        if (branchesResponse.data.success) {
          setBranches(branchesResponse.data.data);
        }
        console.log("Cart items:", branchesResponse.data.data);
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
      }
    };
    fetchCart();
  }, []);

  const handleQuantityChange = async (ma_san_pham, newQty) => {
    const userId = parseInt(getUserId());
    const quantity = parseInt(newQty);

    try {
      const response = await api.put("/users/cap-nhat-so-luong-gio-hang", null, {
        params: {
          ma_san_pham: ma_san_pham,
          so_luong: quantity
        },
        headers:{
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.data.success) {
        const updatedQty = response.data.data.so_luong;

        // Update state cartItems
        if (updatedQty === 0) {
          // Nếu backend trả về số lượng 0, xóa khỏi state
          setCartItems(prev => prev.filter(item => item.ma_san_pham !== ma_san_pham));
        } else {
          setCartItems(prev =>
            prev.map(item =>
              item.ma_san_pham === ma_san_pham ? { ...item, so_luong: updatedQty } : item
            )
          );
        }
      }
    } catch (error) {
      console.error("Cập nhật số lượng thất bại:", error.response?.data || error.message);
    }
  };


  const handleDelete = async (ma_san_pham) => {
    setCartItems(prev => prev.filter(item => item.ma_san_pham !== ma_san_pham));
    try {
      const response = await api.delete(`/users/xoa-san-pham-gio-hang/`,{
        params:{
          ma_san_pham : ma_san_pham
        },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (response.data.success) {
        console.log("Xóa sản phẩm thành công");
      }
    }catch (error) {
      console.error("Xóa sản phẩm thất bại:", error);
    }
  };

  const handleThanhToan = async () => {
    if (!fullName.trim()) {
      alert("Vui lòng nhập họ và tên!");
      return;
    }
    if (!phone.trim()) {
      alert("Vui lòng nhập số điện thoại!");
      return;
    }
    if (!address.trim()) {
      alert("Vui lòng nhập địa chỉ!");
      return;
    }
    try {
      const payload = {
        ma_chi_nhanh: selectedBranch ? selectedBranch.ma_chi_nhanh : null,
        ho_ten: fullName,
        dia_chi_giao_hang: address,
        so_dien_thoai: phone,
      };
      const response = await api.post("/users/thanh-toan", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        alert("Thanh toán thành công!");
        navigate("/");
        
      }
    } catch (error) {
      console.error("Thanh toán thất bại:", error);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.gia_tien * item.so_luong, 0);

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
  if (cartItems.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" align="center" mt={4}>
          Giỏ hàng của bạn đang trống.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      className="d-flex justify-content-center"
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "rgba(0,0,0,0.05)", // 🌫 nền mờ nhẹ
        py: 4,
      }}
    >
      {/* Khung giỏ hàng tổng */}
      <Box
        sx={{
          width: "50%",
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
        <Box sx={{ p: 3, bgcolor: "#fafafa" }}>
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
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
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
                      value={selectedBranch ? `${selectedBranch.ten_chi_nhanh} - ${selectedBranch.dia_chi}` : ""}
                      readOnly
                      fullWidth
                      endAdornment={
                        <IconButton onClick={() => setOpen(true)}>
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
              <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
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
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                    }}
                    sx={{ mb: 2 }}
                  />

                  <List>
                    {filteredBranches.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Không tìm thấy chi nhánh nào.
                      </Typography>
                    ) : (
                      filteredBranches.map((branch) => (
                        <React.Fragment key={branch.ma_chi_nhanh}>
                          <ListItemButton onClick={() => handleSelectBranch(branch)}>
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
            {cartItems.length === 0 ? (
              <Typography color="text.secondary">
                Giỏ hàng của bạn đang trống.
              </Typography>
            ) : (
              <Stack sx={{ gap: 2 }}>
                {cartItems.map(item => (
                  <CartItem
                    key={item.ma_san_pham}
                    name={item.ten_san_pham}
                    pricePerKg={item.gia_tien}
                    weight={item.don_vi}
                    image={item.hinh_anhs[0]?.duong_dan}
                    quantity={item.so_luong}
                    onQuantityChange={(newQty) => handleQuantityChange(item.ma_san_pham, newQty)}
                    onDelete={() => handleDelete(item.ma_san_pham)}
                  />
                ))}
              </Stack>
            )}
          </Paper>
          {/* ✅ Phương thức thanh toán */}
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
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
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
              <Typography fontWeight="bold">{total.toLocaleString()} ₫</Typography>
            </Box>
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
                {total.toLocaleString()} ₫
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              sx={{ borderRadius: 2 }}
              onClick={handleThanhToan}
            >
              Thanh toán ngay
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
