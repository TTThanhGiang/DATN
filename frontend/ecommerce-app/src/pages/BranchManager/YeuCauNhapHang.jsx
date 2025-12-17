import React, { useEffect, useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import { 
    Box,
    Tabs,
    Tab,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    List,
    ListItemButton,
    ListItemText,
    Chip,
    Stack,
    OutlinedInput,
    IconButton,
    Divider,
    Button,
    Typography,


} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { EditOutlined, AddCircleOutline } from "@mui/icons-material";

import api from "../../api";
import { getToken } from "../../utils/auth";


export default function YeuCauNhapHang(){
    const [activeTab, setActiveTab] = useState(0);
    const [requestList, setRequestList] = useState([])
    const [productList, setProductList] = useState([]);

    const [selectedProducts,setSelectedProducts] = useState([]);
    const [productQuantities,setProductQuantities] = useState([]);
    const [reason,setReason] = useState("");
    const [requestDetail, setRequestDetail] = useState(null);

    const [openProduct, setOpenProduct] = useState(false);
    const [search, setSearch] = useState("");

    const token = getToken();

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

    const handleTabChange = (_,value) =>{
        setActiveTab(value);
        setRequestDetail(null);
        setSelectedProducts([]);
        setReason("");
        setSearch("");
    }

    const filteredProduct = productList.filter(p =>
        p.ten_san_pham.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        fetchRequestList();
        fetchProductList();
    },[]);

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

    const fetchProductList = async () => {
        try {
        const res = await api.get(`/users/tat-ca-san-pham`);
        if (res.data.success) setProductList(res.data.data);
        } catch (err) {
        console.error("Lấy danh sách sản phẩm thất bại", err);
        }
    };

    const handleView = (request) => {
        setRequestDetail(request);
        setSelectedProducts(request.san_pham_yeu_caus);
        setReason(request.ly_do);
        setActiveTab(1);
    }
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
        setActiveTab(0);
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

    const handleUpdateRequest = async () => {
        if (selectedProducts.length === 0 || !reason) {
            alert("Vui lòng chọn sản phẩm và nhập lý do.");
            return;
        }

        const payload = {
            ly_do: reason,
            san_phams: selectedProducts.map(p => ({
                ma_san_pham: p.ma_san_pham,
                so_luong: productQuantities[p.ma_san_pham] || 1
            }))
        };

        try {
            const ma_yeu_cau = requestDetail.ma_yeu_cau;

            const res = await api.put(`/manager/cap-nhat-yeu-cau/${ma_yeu_cau}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { data = [], errors = [], message } = res.data;

            let alertMsg = "";

            if (data.length > 0) {
                alertMsg += `✅ Cập nhật thành công ${data.length} sản phẩm\n`;
            }

            if (errors.length > 0) {
                alertMsg += `❌ Thất bại ${errors.length} sản phẩm:\n`;
                errors.forEach((err, idx) => {
                    alertMsg += `${idx + 1}. ${err}\n`;
                });
            }

            alert(alertMsg || message);

            setActiveTab(0);
            fetchRequestList();

        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert(err.response?.data?.message || "Lỗi cập nhật yêu cầu");
        }
    };
    return(
        <PageWrapper title="Yêu cầu nhập hàng">
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Danh sách yêu cầu" />
                    <Tab label={requestDetail ? "Chi tiết yêu cầu" : "Gửi yêu cầu nhập hàng"}/>
                </Tabs>
            </Box>
            {activeTab === 0 && (
            <Box sx={{ overflowX: "auto", mt: 2 }}>
                <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #eee" }}>
                    <Table>
                    <TableHead>
                        <TableRow>
                        <TableCell>Mã yêu cầu</TableCell>
                        <TableCell>Lý do</TableCell>
                        <TableCell>Ngày Tạo</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requestList.map(item => (
                        <TableRow key={item.ma_yeu_cau} hover>
                            <TableCell>{item.ma_yeu_cau}</TableCell>
                            <TableCell>{item.ly_do}</TableCell>
                            <TableCell>{item.ngay_tao}</TableCell>
                            <TableCell>{renderStatusChip(item.trang_thai)}</TableCell>
                            <TableCell>
                                <Button size="small" variant="contained" onClick={() => handleView(item)}>
                                    Xem
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
                </Box>
            )}
            {/* --- Tab 2: Gửi yêu cầu nhập hàng --- */}
            {activeTab === 1 && (
                <Stack spacing={3}>
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
                <TextField
                    fullWidth
                    label="Lý do"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                />
                {requestDetail && (
                <TextField
                    fullWidth
                    label="Lý do từ chối"
                    value={requestDetail.ly_do_tu_choi || ""}
                    disabled
                    sx={{ mt: 2 }}
                />
                )}
                <Divider sx={{ my: 2 }} />
                <Stack justifyContent="center">
                    {requestDetail ? (
                    <Button variant="contained" startIcon={<EditOutlined />} color="primary" onClick={handleUpdateRequest}>
                        Lưu thay đổi
                    </Button>
                    ): (
                    <Button variant="contained" startIcon={<AddCircleOutline />} color="primary" onClick={handleSendRequestMultiple}>
                        Gửi yêu cầu
                    </Button>
                    )}
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