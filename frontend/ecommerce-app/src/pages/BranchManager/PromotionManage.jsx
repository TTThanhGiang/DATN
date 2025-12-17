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

} from "@mui/material";
import { AddCircleOutline, EditOutlined } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import api from "../../api";
import { getToken } from "../../utils/auth";

export default function PromotionManage() {
  const [activeTab, setActiveTab] = useState(0);
  const [promotionList, setPromotionList] = useState([]);

  const [editPromo, setEditPromo] = useState(null);

  const [productList, setProductList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productQuantities,setProductQuantities] = useState([]);
  const [openProduct, setOpenProduct] = useState(false);
  const [search, setSearch] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const token = getToken();

  const handleTabChange = (_, value) => {
    setActiveTab(value);
    setEditPromo(null);

    if (value === 0) {
      // reset form khi tạo mới
      setFormData({
        ten_khuyen_mai: "",
        ma_khuyen_mai: "",
        mo_ta: "",
        giam_gia: "",
        ngay_bat_dau: "",
        ngay_ket_thuc: "",
      });
      setSelectedProducts([]);
      setProductQuantities({});
      setImageFile(null);
      setImagePreview("");
    }
  };

  const [formData, setFormData] = useState({
    ten_khuyen_mai: '',
    ma_khuyen_mai: '',
    mo_ta: '',
    giam_gia: '',
    ngay_bat_dau: '',
    ngay_ket_thuc: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (promo) => {
    setEditPromo(promo);
    setFormData({
      ten_khuyen_mai: promo.ten_khuyen_mai,
      ma_khuyen_mai: promo.ma_code,
      mo_ta: promo.mo_ta || "",
      giam_gia: promo.giam_gia,
      ngay_bat_dau: promo.ngay_bat_dau.slice(0, 16), 
      ngay_ket_thuc: promo.ngay_ket_thuc.slice(0, 16),
    });

    // Set ảnh nếu có
    if (promo.hinh_anhs?.length > 0) {
      setImagePreview(promo.hinh_anhs[0].duong_dan);
    }

    // Set sản phẩm
    const selected = promo.san_phams?.map(sp => sp);
    setSelectedProducts(selected);

    console.log(selected);

    const quantities = {};
    promo.san_phams?.forEach(sp => {
      quantities[sp.ma_san_pham] = sp.so_luong;
    });
    setProductQuantities(quantities);

    setActiveTab(1);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    fetchProductList();
    fetchPromotionList();
  },[]);

  const fetchProductList = async () => {
    try {
      const res = await api.get(`/users/tat-ca-san-pham`);
      if (res.data.success) setProductList(res.data.data);
    } catch (err) {
      console.error("Lấy danh sách sản phẩm thất bại", err);
    }
  };

  const fetchPromotionList = async () => {
    try{
      const res = await api.get(`/manager/danh-sach-khuyen-mai`,{
        headers: { 
          Authorization: `Bearer ${token}`, 
        }
      })
      if(res.data.success){
        setPromotionList(res.data.data);
      }
    }catch(err){
      console.log("Có lỗi khi lấy danh sách khuyến mãi", err);
    }

  }

  const filteredProduct = productList.filter(p =>
    p.ten_san_pham.toLowerCase().includes(search.toLowerCase())
  );

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
    newQuantities[product.ma_san_pham] = 1;
    setProductQuantities(newQuantities);
    return [...prev, product];
    });
  };

  const renderStatusChip = (status) => {
    const mapBackendToFrontend = {
      "CHO_XU_LY": "pending",
      "DA_DUYET": "approved",
      "DA_HUY": "rejected",
    };

    const feStatus = mapBackendToFrontend[status];

    const map = {
      pending: { label: "Chờ duyệt", color: "warning" },
      approved: { label: "Đã duyệt", color: "success" },
      rejected: { label: "Từ chối", color: "error" },
    };

    return <Chip label={map[feStatus].label} color={map[feStatus].color} size="small" />;
  };

  const handleSavePromotion = async () => {
    try {
      const fd = new FormData();

      fd.append("ten_khuyen_mai", formData.ten_khuyen_mai);
      fd.append("ma_code", formData.ma_khuyen_mai);
      fd.append("mo_ta", formData.mo_ta || "");
      fd.append("giam_gia", formData.giam_gia);
      fd.append("ngay_bat_dau", new Date(formData.ngay_bat_dau).toISOString());
      fd.append("ngay_ket_thuc", new Date(formData.ngay_ket_thuc).toISOString());
      fd.append(
        "san_phams",
        JSON.stringify(
          selectedProducts.map(p => ({
            ma_san_pham: p.ma_san_pham,
            so_luong: productQuantities[p.ma_san_pham] || 1,
          }))
        )
      );

      if (imageFile) {
        fd.append("hinh_anh", imageFile);
      }
      let res;
      if (editPromo) {
        // UPDATE
        res = await api.put(`/manager/cap-nhat-khuyen-mai/${editPromo.ma_khuyen_mai}`, fd, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Cập nhật khuyến mãi thành công!");
      } else {
        // CREATE
        res = await api.post("/manager/tao-khuyen-mai", fd, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, 
          },
        });
        alert("Thêm khuyến mãi thành công!");
      }

      fetchPromotionList(); // load lại danh sách

      // Reset form
      setFormData({
        ten_khuyen_mai: "",
        ma_khuyen_mai: "",
        mo_ta: "",
        giam_gia: "",
        ngay_bat_dau: "",
        ngay_ket_thuc: "",
      });

      setSelectedProducts([]);
      setProductQuantities({});
      setImageFile(null);
      setImagePreview("");
      setEditPromo(null);
      setActiveTab(0);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Lưu khuyến mãi thất bại");
    }
  };
  return (
    <PageWrapper title="Quản lý khuyến mãi">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Danh sách khuyến mãi" />
          <Tab label={editPromo ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi"} />
        </Tabs>
      </Box>

      {/* Danh sách */}
      {activeTab === 0 && (
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
              {promotionList.map((promo) => (
                <TableRow key={promo.ma_khuyen_mai} hover>
                  <TableCell>{promo.ten_khuyen_mai}</TableCell>
                  <TableCell>{promo.ma_code}</TableCell>
                  <TableCell>{promo.giam_gia}%</TableCell>
                  <TableCell>{promo.ngay_bat_dau}</TableCell>
                  <TableCell>{promo.ngay_ket_thuc}</TableCell>
                  <TableCell>{renderStatusChip(promo.trang_thai)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(promo)}>
                      <EditOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Form thêm / sửa */}
      {activeTab === 1 && (
        <Stack spacing={3} >
          <TextField label="Tên khuyến mãi" name="ten_khuyen_mai" value={formData.ten_khuyen_mai}  onChange={handleInputChange} fullWidth />
          <TextField label="Mã khuyến mãi"  name="ma_khuyen_mai" value={formData.ma_khuyen_mai} onChange={handleInputChange} fullWidth />
          <TextField label="Mô tả" name="mo_ta" value={formData.mo_ta} onChange={handleInputChange} fullWidth />
          <TextField label="Phần trăm giảm" name="giam_gia" type="number" value={formData.giam_gia} onChange={handleInputChange} fullWidth />
          <TextField label="Ngày bắt đầu" name="ngay_bat_dau" type="datetime-local" value={formData.ngay_bat_dau} onChange={handleInputChange} InputLabelProps={{ shrink: true }}/>
          <TextField  label="Ngày kết thúc" name="ngay_ket_thuc" type="datetime-local" value={formData.ngay_ket_thuc} onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
          <Stack>
            {imagePreview && <img src={imagePreview} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 4 }} />}
            <TextField type="file" onChange={handleImageChange} />
          </Stack>
          <OutlinedInput
            fullWidth
            placeholder="Chọn sản phẩm..."
            readOnly
            value=
              {selectedProducts.length > 0
                ? `${selectedProducts.length} sản phẩm đã chọn`
                : "Chọn sản phẩm..."
              }
              onClick={() => setOpenProduct(true)}
              endAdornment={
              <IconButton onClick={() => setOpenProduct(true)}>
                <ArrowDropDownIcon />
              </IconButton>
              }
              sx={{ cursor: "pointer" }}
            />

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

            <Divider />
            <Button variant="contained" startIcon={<AddCircleOutline />} onClick={handleSavePromotion}>Lưu khuyến mãi</Button>
        </Stack>
      )}

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
