import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import {
  Box,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  Paper,
  Stack,
  IconButton,
  OutlinedInput,
  TextField,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  Typography,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  Pagination,
  Chip
} from "@mui/material";
import { EditOutlined } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { getToken } from "../../utils/auth";
import api from "../../api";

export default function InventoryManage() {
  const [activeTab, setActiveTab] = useState(0);

  const [inventoryList, setInventoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [requestList, setRequestList] = useState([]);

  const [editInventory, setEditInventory] = useState(null);
  const [quantity, setQuantity] = useState("");

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");

  const [openProduct, setOpenProduct] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const token = getToken();

  // Lọc sản phẩm search
  const filteredProduct = productList.filter(p =>
    p.ten_san_pham.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchInventory();
    fetchProductList();
    fetchRequestList();
  }, [page]);

  // API lấy danh sách tồn kho
  const fetchInventory = async () => {
    try {
      const offset = (page - 1) * limit;
      const res = await api.get(`/manager/danh-sach-ton-kho?limit=${limit}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setInventoryList(res.data.data.items);
        setTotal(res.data.data.total);
      }
    } catch (err) {
      console.error("Lấy tồn kho thất bại", err);
    }
  };

  // API lấy danh sách sản phẩm
  const fetchProductList = async () => {
    try {
      const res = await api.get(`/users/tat-ca-san-pham`);
      if (res.data.success) setProductList(res.data.data);
    } catch (err) {
      console.error("Lấy danh sách sản phẩm thất bại", err);
    }
  };

  // API lấy danh sách yêu cầu nhập hàng
  const fetchRequestList = async () => {
    try {
      const res = await api.get(`/manager/danh-sach-yeu-cau`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setRequestList(res.data.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách yêu cầu nhập hàng", err);
    }
  };

  const handleTabChange = (_, value) => {
    setActiveTab(value);
    setEditInventory(null);
    setSelectedProducts([]);
    setProductQuantities({});
    setQuantity("");
    setReason("");
  };

  // Chọn 1 sản phẩm để cập nhật tồn kho
  const handleEditClick = (item) => {
    setEditInventory(item);
    setQuantity(item.so_luong_ton);
    setActiveTab(1); // Chuyển sang tab cập nhật
  };

  const handleUpdateInventory = async () => {
    if (!quantity) {
      alert("Vui lòng nhập số lượng");
      return;
    }
    try {
      const ma_san_pham = editInventory.ma_san_pham;
      const res = await api.put(`/manager/cap-nhat-ton-kho/${ma_san_pham}`, { so_luong_ton: parseInt(quantity) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchInventory();
        setEditInventory(null);
        setQuantity("");
        setActiveTab(0);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Cập nhật thất bại!");
    }
  };

  // Chọn nhiều sản phẩm gửi yêu cầu
  const handleSelectProduct = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.ma_san_pham === product.ma_san_pham);
      const newQuantities = { ...productQuantities };
      if (exists) {
        // bỏ chọn
        const updated = prev.filter(p => p.ma_san_pham !== product.ma_san_pham);
        delete newQuantities[product.ma_san_pham];
        setProductQuantities(newQuantities);
        return updated;
      }
      // thêm mới
      newQuantities[product.ma_san_pham] = 1;
      setProductQuantities(newQuantities);
      return [...prev, product];
    });
  };

  const handleSendRequestMultiple = async () => {
    if (selectedProducts.length === 0 || !reason) {
      alert("Vui lòng chọn sản phẩm và nhập lý do.");
      return;
    }

    try {
      const payload = {
        ly_do: reason,
        san_phams: selectedProducts.map(p => ({
        ma_san_pham: p.ma_san_pham,
        so_luong: productQuantities[p.ma_san_pham] || 1,
      }))
    };

      const res = await api.post("/manager/gui-yeu-cau-nhap-hang", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Payload gửi đi:", payload);

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

      setSelectedProducts([]);
      setProductQuantities({});
      setReason("");
      setActiveTab(3);
      fetchRequestList();

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

  return (
    <PageWrapper title="Quản lý tồn kho">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Danh sách hàng tồn kho" />
          <Tab label="Cập nhật tồn kho" />
        </Tabs>
      </Box>

      {/* --- Tab 0: Danh sách tồn kho --- */}
      {activeTab === 0 && (
        <Box sx={{ overflowX: "auto", mt: 2 }}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #eee" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ảnh</TableCell>
                  <TableCell>Tên sản phẩm</TableCell>
                  <TableCell align="center">Số lượng</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryList.map(item => (
                  <TableRow key={item.ma_san_pham} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={item.hinh_anhs?.[0]?.duong_dan || ""}
                        alt={item.ten_san_pham}
                        sx={{ width: 50, height: 50, objectFit: "cover", borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>{item.ten_san_pham}</TableCell>
                    <TableCell align="center">{item.so_luong_ton}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <IconButton color="primary" size="small" onClick={() => handleEditClick(item)}>
                          <EditOutlined />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Stack spacing={2} alignItems="center" sx={{ mt: 2, mb: 4 }}>
              <Pagination
                count={Math.ceil(total / limit)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Stack>
          </TableContainer>
        </Box>
      )}

      {/* --- Tab 1: Cập nhật tồn kho --- */}
      {activeTab === 1 && editInventory && (
        <Stack spacing={3}>
          <OutlinedInput fullWidth value={editInventory.ten_san_pham} readOnly />
          <TextField
            fullWidth
            label="Số lượng"
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />
          <Divider sx={{ my: 2 }} />
          <Stack justifyContent="center">
            <Button variant="contained" startIcon={<EditOutlined />} color="primary" onClick={handleUpdateInventory}>
              Lưu thay đổi
            </Button>
          </Stack>
        </Stack>
      )}

      {/* --- DIALOG chọn nhiều sản phẩm --- */}
      <Dialog open={openProduct} onClose={() => setOpenProduct(false)} fullWidth maxWidth="sm">
        <DialogTitle>Chọn sản phẩm</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Tìm theo tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />
          <List>
            {filteredProduct.map(product => {
              const isSelected = selectedProducts.some(p => p.ma_san_pham === product.ma_san_pham);
              return (
                <React.Fragment key={product.ma_san_pham}>
                  <ListItemButton selected={isSelected} onClick={() => handleSelectProduct(product)}>
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
