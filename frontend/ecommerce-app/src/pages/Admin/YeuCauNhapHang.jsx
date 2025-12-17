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
    Chip,
    Button,
    Stack,
    OutlinedInput,
    IconButton,
    Divider,
    Typography,
    TextField ,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    ListItemButton, 
    ListItemText,
    List,


} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SearchIcon from "@mui/icons-material/Search";
import { EditOutlined, AddCircleOutline } from "@mui/icons-material";

import api from "../../api";
import { getToken } from "../../utils/auth";


export default function YeuCauNhapHang(){
    const [activeTab, setActiveTab] = useState(0);
    const [productQuantities,setProductQuantities] = useState([]);

    const [requestList, setRequestList] = useState([])
    const [branches, setBranches] = useState([]);

    const [selectedProducts,setSelectedProducts] = useState([]);
    const [reason,setReason] = useState("");
    const [requestDetail, setRequestDetail] = useState(null);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const [openBranch, setOpenBranch] = useState(false);
    const [searchBranch, setSearchBranch] = useState("");
    const [selectedBranch, setSelectedBranch] = useState(null);

    const token = getToken()

    const limit = 10;
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchRequestList();
        fetchBranchList();
    },[page]);

    const fetchRequestList = async () => {
        try {
            const offset = (page-1)* limit;
            const res = await api.get(`/admins/danh-sach-yeu-cau?limit=${limit}&offset=${offset}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setRequestList(res.data.data.items);
                setTotal(res.data.data.total);
            }
        } catch (err) {
        console.error("Lỗi khi lấy danh sách yêu cầu nhập hàng", err);
        }
    };

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

    const handleView = (request) => {
        setRequestDetail(request);
        setSelectedProducts(request.san_pham_yeu_caus);
        setReason(request.ly_do);
        setActiveTab(1);
    }

    const handleTabChange = (_,value) =>{
        setActiveTab(value);
        setRequestDetail(null);
    }

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

    const handleDuyet = async() =>{
        const res = await api.put(`/admins/duyet-yeu-cau/${requestDetail.ma_yeu_cau}`,{},{
            headers: {Authorization: `Bearer ${token}`}
        });
        if (res.data.success){
            alert(res.data.message);
            setActiveTab(0);
            setRequestDetail(null);
            fetchRequestList();
        } else {
            alert(res.data.message);
        }
    }

    const handleTuChoi = async() =>{
        const res = await api.put(`/admins/tu-choi-yeu-cau/${requestDetail.ma_yeu_cau}`,{"ly_do": cancelReason},{
            headers: {Authorization: `Bearer ${token}`}
        });
        if (res.data.success){
            alert(res.data.message);
            setActiveTab(0);
            setRequestDetail(null);
            fetchRequestList();
        }
        else {
            alert(res.data.message);
        }
    }

    const handleSelectBranch = (branch) => {
        setSelectedBranch(branch);
        setOpenBranch(false);
        setSearchBranch("");
    };

    const filteredBranches = branches.filter(
        (b) =>
        b.ten_chi_nhanh.toLowerCase().includes(searchBranch.toLowerCase()) ||
        b.dia_chi.toLowerCase().includes(searchBranch.toLowerCase())
    );

    const filteredData = selectedBranch
    ? requestList.filter(item => item.ma_chi_nhanh === selectedBranch?.ma_chi_nhanh)
    : requestList;

    return(
        <PageWrapper title="Yêu cầu nhập hàng">
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Danh sách yêu cầu" />
                {requestDetail && <Tab label="Chi tiết yêu cầu" />}
                </Tabs>
            </Box>
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
                    Tổng: <strong>{total}</strong> yêu cầu
                    </Typography>
                </Stack>
                <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #eee" }}>
                    <Table>
                        <TableHead>
                        <TableRow>
                            <TableCell>Tên chi nhánh</TableCell>
                            <TableCell>Lý do</TableCell>
                            <TableCell>Ngày Tạo</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData.map(item => (
                            <TableRow key={item.ma_yeu_cau} hover>
                                <TableCell>{item.ten_chi_nhanh}</TableCell>
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
            {activeTab === 1 && (
            <Stack spacing={3}>
                <TextField
                    fullWidth
                    label="Tên chi nhánh"
                    value={requestDetail.ten_chi_nhanh}
                />
                <TextField
                    fullWidth
                    label="Ngày tạo"
                    value={requestDetail.ngay_tao}
                />
                <TextField
                    fullWidth
                    label="Trạng thái"
                    value={requestDetail.trang_thai}
                />
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
                    disabled
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
                            disabled
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
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                    <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDuyet}
                    >
                    Duyệt
                    </Button>

                    <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setCancelOpen(true)}
                    >
                    Từ chối
                    </Button>
                </Stack>
                </Stack>
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
                    <Typography fontWeight="bold" mb={2}>Lý do từ chối</Typography>
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
                        handleTuChoi();
                        setCancelOpen(false);
                        }}
                    >Xác nhận</Button>
                    </Stack>
                </Paper>
                </Box>
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
        </PageWrapper>
    );
}