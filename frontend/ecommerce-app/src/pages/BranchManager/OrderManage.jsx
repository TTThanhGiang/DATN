import React, { useState } from "react";
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
} from "@mui/material";
import PageWrapper from "../../components/PageWrapper";
import CartItem from "../../components/User/Cart/CartItem";
import { useNavigate } from "react-router-dom";

export default function OrderManage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = [
    {
      id: 1,
      customer: "Nguyễn Văn A",
      phone: "0901234567",
      address: "123 Nguyễn Trãi, Hà Nội",
      payment: "COD",
      total: 25000,
      status: 2,
      items: [
        {
          id: 101,
          name: "Bắp cải thảo bắp từ 500g trở lên",
          price: 25000,
          weight: "500g",
          image: "/images/thumb-bananas.png",
        },
      ],
    },
  ];

  const handleView = (order) => {
    setSelectedOrder(order);
    setActiveTab(1);
  };

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const steps = ["Đặt hàng", "Xác nhận", "Đang giao", "Hoàn thành"];

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
              {orders.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell>{o.phone}</TableCell>
                  <TableCell>{o.total.toLocaleString()}đ</TableCell>
                  <TableCell>{steps[o.status]}</TableCell>
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
              🚚 Trạng thái đơn hàng
            </Typography>
            <Stepper activeStep={selectedOrder.status} alternativeLabel>
              {steps.map((l) => (
                <Step key={l}>
                  <StepLabel>{l}</StepLabel>
                </Step>
              ))}
            </Stepper>
      </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" mb={2}>
              👤 Thông tin khách hàng
            </Typography>
            <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
              <TextField label="Tên khách hàng" value={selectedOrder.customer} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Số điện thoại" value={selectedOrder.phone} fullWidth InputProps={{ readOnly: true }} />
            </Stack>
            <Stack spacing={2} direction={{ xs: "column", md: "row" }} sx={{ mt: 2 }}>
              <TextField label="Địa chỉ" value={selectedOrder.address} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Thanh toán" value={selectedOrder.payment} fullWidth InputProps={{ readOnly: true }} />
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" mb={2}>
              🛍️ Sản phẩm đã đặt
            </Typography>
            {selectedOrder.items.map((i) => (
              <Box
                key={i.id}
                sx={{ border: "1px solid #eee", borderRadius: 2, p: 2, mb: 2, cursor: "pointer", "&:hover": { background: "#f9f9f9" } }}
                onClick={() => navigate(`/product/${i.id}`)}
              >
                <CartItem name={i.name} pricePerKg={i.price} weight={i.weight} image={i.image} />
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">Tổng tiền:</Typography>
              <Typography fontWeight="bold" color="primary.main">
                {selectedOrder.total.toLocaleString()}đ
              </Typography>
            </Stack>
          </Paper>
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            <Button
                variant="contained"
                color="success"
                onClick={() => {
                const updated = { ...selectedOrder, status: selectedOrder.status + 1 };
                setSelectedOrder(updated);
                alert("✅ Đã duyệt đơn!");
                }}
            >Duyệt đơn</Button>
            <Button
                variant="outlined"
                color="error"
                onClick={() => setCancelOpen(true)}
            >Hủy đơn</Button>
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
                  alert("❌ Đơn đã bị hủy: " + cancelReason);
                  setCancelOpen(false);
                  setSelectedOrder(null);
                  setActiveTab(0);
                }}
              >Xác nhận</Button>
            </Stack>
          </Paper>
        </Box>
      )}
    </PageWrapper>
  );
}
