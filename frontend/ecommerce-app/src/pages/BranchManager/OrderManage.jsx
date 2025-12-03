import React, { useEffect, useState } from "react";
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
  Stack,
  Button,
  Typography,
  TextField,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Chip
} from "@mui/material";
import PageWrapper from "../../components/PageWrapper";
import CartItem from "../../components/User/Cart/CartItem";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { getToken } from "../../utils/auth";
import SanPhamDonHang from "../../components/User/Cart/SanPhamDonHang";

export default function OrderManage() {
  const navigate = useNavigate();
  const [orderList, setOrderList] = useState([]);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const token = getToken();

  const mapTrangThaiThanhToan = (status) =>{
      let trang_thai
      if (status === 'CHUA_THANH_TOAN')
        return trang_thai = "Chưa thanh toán"
      return trang_thai = "Đã thanh toán"
  }

  const handleView = (order) => {
    setSelectedOrder(order);
    setActiveTab(1);
  };

  useEffect(() => {
    fetchOrderList();
  },[]);

  const fetchOrderList = async () => {
    try{
      const res = await api.get(`/manager/danh-sach-don-hang`,{
        headers: { Authorization: `Bearer ${token}`}
      })
      if(res.data.success){
        setOrderList(res.data.data);
      }
    }catch(err){
      console.log("Lỗi khi lấy danh sách đơn hàng", err);
    }
  }

  const renderStatusChip = (status) => {
    const mapBackendToFrontend = {
      "CHO_XU_LY": "pending",
      "DA_XU_LY": "approved",
      "DA_HUY": "rejected",
      "HOAN_THANH": "completed", // thêm trạng thái hoàn thành
    };

    const feStatus = mapBackendToFrontend[status] || "pending"; // default fallback

    // Map frontend key sang label & color
    const map = {
      pending: { label: "Chờ xử lý", color: "warning" },
      approved: { label: "Đã duyệt", color: "success" },
      rejected: { label: "Đã hủy", color: "error" },
      completed: { label: "Hoàn thành", color: "primary" }, // thêm màu cho hoàn thành
    };

    return <Chip label={map[feStatus].label} color={map[feStatus].color} size="small" />;
  };
  

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleDuyet = async () => {
    const ma_don_hang = selectedOrder.ma_don_hang;
    const res = await api.put(`/manager/don-hang/${ma_don_hang}/duyet`,{}, {
      headers: {Authorization: `Bearer ${token}`}
    })
    if(res.data.success){
      alert(res.data.message);
      setActiveTab(0);
      setSelectedOrder(null);
      fetchOrderList();
    } else(
      alert(res.data.message)
    )
  };

  const handleHoanThanh = async () => {
    const ma_don_hang = selectedOrder.ma_don_hang;
    const res = await api.put(`/manager/don-hang/${ma_don_hang}/hoan-thanh`,{}, {
      headers: {Authorization: `Bearer ${token}`}
    })
    if(res.data.success){
      alert(res.data.message);
      setActiveTab(0);
      setSelectedOrder(null);
      fetchOrderList();
    } else(
      alert(res.data.message)
    )
  };

  const handleHuy = async () => {
    const ma_don_hang = selectedOrder.ma_don_hang;
    const res = await api.put(`/manager/don-hang/${ma_don_hang}/huy`, {"ly_do": cancelReason},{
      headers: {Authorization: `Bearer ${token}`}
    })
    if(res.data.success){
      alert(res.data.message);
      setActiveTab(0);
      setSelectedOrder(null);
      fetchOrderList();
    } else(
      alert(res.data.message)
    )
  };
  const renderActionButtons = (status) => {
    switch (status) {
      case "CHO_XU_LY":
        return (
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleDuyet()}
            >
              Duyệt đơn
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={() => setCancelOpen(true)}
            >
              Hủy đơn
            </Button>
          </Stack>
        );

      case "DA_XU_LY":
        return (
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleHoanThanh()}
            >
              Hoàn thành
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={() => setCancelOpen(true)}
            >
              Hủy đơn
            </Button>
          </Stack>
        );

      case "HOAN_THANH":
         return (
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            <Button
              variant="contained"
              color="primary"
              disabled  
            >
              Hoàn thành
            </Button>
          </Stack>
        );
      case "DA_HUY":
        return (
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            <Button
              variant="outlined"
              color="error"
              disabled
            >
              Đã hủy
            </Button>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <PageWrapper title="Quản lý đơn hàng">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Danh sách đơn hàng" />
          {selectedOrder && <Tab label="Chi tiết đơn hàng" />}
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>SĐT</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderList.map((o) => (
                <TableRow key={o.ma_don_hang} hover>
                  <TableCell>{o.ma_don_hang}</TableCell>
                  <TableCell>{o.ho_ten}</TableCell>
                  <TableCell>{o.so_dien_thoai}</TableCell>
                  <TableCell>{o.tong_tien.toLocaleString()}đ</TableCell>
                  <TableCell>{renderStatusChip(o.trang_thai)}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="contained" onClick={() => handleView(o)}>
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 1 && selectedOrder && (
        <>
          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" mb={2}>
              👤 Thông tin khách hàng
            </Typography>
            <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
              <TextField label="Tên khách hàng" value={selectedOrder.ho_ten} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Số điện thoại" value={selectedOrder.so_dien_thoai} fullWidth InputProps={{ readOnly: true }} />
            </Stack>
            <Stack spacing={2} direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }}>
              <TextField label="Địa chỉ" value={selectedOrder.dia_chi} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Thanh toán" value={mapTrangThaiThanhToan(selectedOrder.trang_thai_thanh_toan)} fullWidth InputProps={{ readOnly: true }} />
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" mb={2}>
              🛍️ Sản phẩm đã đặt
            </Typography>
            {selectedOrder.chi_tiet.map((i) => (
              <Box
                key={i.ma_san_pham}
                sx={{ border: "1px solid #eee", borderRadius: 2, p: 2, mb: 2, cursor: "pointer", "&:hover": { background: "#f9f9f9" } }}
                onClick={() => navigate(`/product/${i.ma_san_pham}`)}
              >
                <SanPhamDonHang name={i.ten_san_pham} pricePerKg={i.gia_tien} weight={i.don_vi}  image={i.hinh_anhs} quantity={i.so_luong} />
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">Tổng tiền:</Typography>
              <Typography fontWeight="bold" color="primary.main">
                {selectedOrder.tong_tien.toLocaleString()}đ
              </Typography>
            </Stack>
          </Paper>
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            {renderActionButtons(selectedOrder?.trang_thai)}
        </Stack>
        </>
      )}
    {/* Cancel Dialog */}
      {cancelOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <Paper sx={{ p: 3, width: 400, borderRadius: 2 }}>
            <Typography fontWeight="bold" mb={2}>Lý do hủy đơn</Typography>
            <TextField
              label="Nhập lý do"
              multiline
              rows={3}
              fullWidth
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button onClick={() => setCancelOpen(false)}>Thoát</Button>
              <Button
                color="error"
                variant="contained"
                onClick={() => {
                  handleHuy();
                  setCancelOpen(false);
                }}
              >Xác nhận</Button>
            </Stack>
          </Paper>
        </Box>
      )}
    </PageWrapper>
  );
}
