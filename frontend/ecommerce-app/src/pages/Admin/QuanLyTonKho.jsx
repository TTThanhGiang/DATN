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
    Pagination 
} from '@mui/material';

import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { EditOutlined, DeleteOutlined, AddCircleOutline } from "@mui/icons-material";

import PageWrapper from '../../components/PageWrapper';
import api from "../../api";
import { getToken } from "../../utils/auth";

export default function InventoryManage() {
  const [activeTab, setActiveTab] = useState(0);
  const [branches, setBranches] = useState([]);
  const [productList, setProductList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [productQuantities, setProductQuantities] = useState({});

  const [editInventory, setEditInventory] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [openBranch, setOpenBranch] = useState(false);
  const [openProduct, setOpenProduct] = useState(false);
  const [searchBranch, setSearchBranch] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const token = getToken();
  const limit = 10;

  const filteredBranches = branches.filter(
    (b) =>
      b.ten_chi_nhanh.toLowerCase().includes(searchBranch.toLowerCase()) ||
      b.dia_chi.toLowerCase().includes(searchBranch.toLowerCase())
  );

  const filteredProduct = productList.filter(
    (b) =>
      b.ten_san_pham.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedBranch(null);
    setEditInventory(null);
    setSelectedProducts([]);
  };

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    setOpenBranch(false);
    setSearchBranch("");
  };

  const handleSelectProduct = (product) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.ma_san_pham === product.ma_san_pham);
      if (exists) {
        // Bỏ chọn
        const updated = prev.filter((p) => p.ma_san_pham !== product.ma_san_pham);
        const newQuantities = { ...productQuantities };
        delete newQuantities[product.ma_san_pham];
        setProductQuantities(newQuantities);
        return updated;
      }
      setProductQuantities((q) => ({
        ...q,
        [product.ma_san_pham]: 1, // default = 1
      }));

      return [...prev, product];
    });
  };

  const handleEditClick = (item) => {
    setEditInventory(item);
    setQuantity(item.so_luong_ton);
    setActiveTab(2);
  };

  useEffect(() => {
    fetchBranchList();
    fetchProductList();
    fetchInventory();
  }, [page,selectedBranch]);

  const fetchBranchList = async () => {
    try{
      const res = await api.get(`/admins/danh-sach-chi-nhanh`, {
        headers:{ Authorization: `Bearer ${token}` },
      });
      if(res.data.success){
        setBranches(res.data.data);
      }
    }catch(error){  
      console.log("Không lấy được danh sách chi nhánh", error);
    }
  };

  const fetchProductList = async () =>{
    try{
      const res = await api.get(`/users/tat-ca-san-pham`);
      if (res.data.success){
        setProductList(res.data.data);
      }
    }catch(error){
      console.log("Lấy danh sách sản phẩm thất bại", error)
    }
  };

  const fetchInventory = async () => {
    try {
      const offset = (page - 1) * limit;
      let url = `/admins/danh-sach-ton-kho?limit=${limit}&offset=${offset}`;
      if (selectedBranch) {
        url += `&ma_chi_nhanh=${selectedBranch.ma_chi_nhanh}`;
      }

      const res = await api.get(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setInventoryList(res.data.data.items);
        setTotal(res.data.data.total);
      }
    } catch (err) {
      console.error("Lấy tồn kho thất bại", err);
    }
  };

  // ⭐ THÊM NHIỀU SẢN PHẨM CÙNG LÚC
  const handleAddInventory = async () => {
    if (selectedProducts.length === 0 || !selectedBranch) {
      alert("Vui lòng chọn sản phẩm, chi nhánh và số lượng");
      return;
    }

    try {
      // chuẩn bị payload gửi API
      const payload = {
        items: selectedProducts.map(p => ({
          ma_san_pham: p.ma_san_pham,
          ma_chi_nhanh: selectedBranch.ma_chi_nhanh,
          so_luong_ton: productQuantities[p.ma_san_pham] || 1
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

      // reset state
      fetchInventory();
      setSelectedProducts([]);
      setSelectedBranch(null);
      setProductQuantities({});
      setActiveTab(0);

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


  const handleUpdateInventory = async() => {
    if(quantity === "")
      return alert("Vui lòng nhập số lượng");

    try{
      const ma_chi_nhanh = editInventory.ma_chi_nhanh;
      const ma_san_pham = editInventory.ma_san_pham;

      const res = await api.put(
        `/admins/cap-nhat-ton-kho/${ma_san_pham}/${ma_chi_nhanh}`,
        { so_luong_ton: parseInt(quantity) },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if(res.data.success){
        alert(res.data.message);
        fetchInventory();
        setQuantity("");
        setSelectedBranch(null);
        setSelectedProducts([]);
        setEditInventory(null);
        setActiveTab(0);
      }
    }catch(err){
      alert(err.response?.data?.detail || "Cập nhật thất bại")
    }
  };

  const filteredData = selectedBranch
    ? inventoryList.filter(item => item.ma_chi_nhanh === selectedBranch?.ma_chi_nhanh)
    : inventoryList;



  return (
    <PageWrapper title="Quản lý tồn kho">

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Danh sách hàng tồn kho" />
          <Tab label="Thêm sản phẩm cho chi nhánh" />
          {editInventory && <Tab label="Cập nhật tồn kho" />}
        </Tabs>
      </Box>

      {/* TAB 1 */}
      {activeTab === 0 && (
        <Box sx={{ overflowX: "auto", mt: 2 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 1 }} alignItems="center">
            <OutlinedInput
              placeholder="Chọn chi nhánh..."
              value={ selectedBranch ? selectedBranch.ten_chi_nhanh : "Tất cả chi nhánh" }
              readOnly
              fullWidth
              endAdornment={
                <IconButton onClick={() => setOpenBranch(true)}>
                  <ArrowDropDownIcon />
                </IconButton>
              }
              onClick={() => setOpenBranch(true)}
              sx={{ width: 550, cursor: "pointer" }}
            />
            <Typography sx={{ color: "text.secondary" }}>
              Tổng: <strong>{total}</strong> sản phẩm
            </Typography>
          </Stack>

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
                {filteredData.map((item) => (
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
                      <IconButton color="primary" size="small" onClick={() => handleEditClick(item)}>
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

      {/* TAB 2 — THÊM TỒN KHO */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          
          {/* SELECT PRODUCTS */}
          <OutlinedInput
            placeholder="Chọn sản phẩm..."
            value={
              selectedProducts.length > 0
                ? `${selectedProducts.length} sản phẩm đã chọn`
                : "Chọn sản phẩm..."
            }
            readOnly
            fullWidth
            onClick={() => setOpenProduct(true)}
            endAdornment={
              <IconButton onClick={() => setOpenProduct(true)}>
                <ArrowDropDownIcon />
              </IconButton>
            }
            sx={{ cursor: "pointer" }}
          />

          {/* SHOW SELECTED PRODUCTS */}
          {selectedProducts.length > 0 && (
            <Stack spacing={1} sx={{ mt: 1 }}>
              {selectedProducts.map((p) => (
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
                    value={productQuantities[p.ma_san_pham] || 1}
                    onChange={(e) =>
                      setProductQuantities((prev) => ({
                        ...prev,
                        [p.ma_san_pham]: Math.max(1, parseInt(e.target.value) || 1),
                      }))
                    }
                  />

                  <Button
                    size="small"
                    color="error"
                    onClick={() =>
                      handleSelectProduct(p) // bỏ chọn
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
            value={ selectedBranch ? selectedBranch.ten_chi_nhanh : "Chọn chi nhánh..." }
            readOnly
            fullWidth
            onClick={() => setOpenBranch(true)}
            endAdornment={
              <IconButton onClick={() => setOpenBranch(true)}>
                <ArrowDropDownIcon />
              </IconButton>
            }
            sx={{ cursor: "pointer" }}
          />

          <Divider />

          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={handleAddInventory}
          >
            Thêm
          </Button>
        </Stack>
      )}

      {/* --- TAB 3: UPDATE TỒN KHO --- */}
      {activeTab === 2 && editInventory && (
        <Stack spacing={3}>
          {/* Sản phẩm */}
          <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 1 }} alignItems="center">
            <OutlinedInput
              id="sanpham"
              name="sanpham"
              placeholder="Chọn sản phẩm..."
              value={editInventory.ten_san_pham}
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
              value={editInventory.ten_chi_nhanh}
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
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <Divider sx={{ my: 2 }} />

          {/* Nút lưu thay đổi */}
          <Stack justifyContent="center">
            <Button
              variant="contained"
              startIcon={<EditOutlined />}
              color="primary"
              onClick={handleUpdateInventory}
            >
              Lưu thay đổi
            </Button>
          </Stack>
        </Stack>
      )}

      {/* DIALOG CHỌN CHI NHÁNH */}
      <Dialog open={openBranch} onClose={() => setOpenBranch(false)} fullWidth maxWidth="sm">
        <DialogTitle>Chọn chi nhánh</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Tìm theo tên hoặc địa chỉ..."
            value={searchBranch}
            onChange={(e) => setSearchBranch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />
          {activeTab === 0 && (
            <>
              <ListItemButton onClick={() => handleSelectBranch(null)}>
                <ListItemText
                  primary="Tất cả chi nhánh"
                  secondary="Hiển thị toàn bộ dữ liệu tồn kho"
                />
              </ListItemButton>
              <Divider />
            </>
          )}

          <List>
            {filteredBranches.map((branch) => (
              <React.Fragment key={branch.ma_chi_nhanh}>
                <ListItemButton onClick={() => handleSelectBranch(branch)}>
                  <ListItemText primary={branch.ten_chi_nhanh} secondary={branch.dia_chi} />
                </ListItemButton>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* DIALOG CHỌN SẢN PHẨM — MULTI SELECT */}
      <Dialog open={openProduct} onClose={() => setOpenProduct(false)} fullWidth maxWidth="sm">
        <DialogTitle>Chọn sản phẩm</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Tìm sản phẩm..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />

          <List>
            {filteredProduct.map((product) => {
              const isSelected = selectedProducts.some(
                (p) => p.ma_san_pham === product.ma_san_pham
              );

              return (
                <React.Fragment key={product.ma_san_pham}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => handleSelectProduct(product)}
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



