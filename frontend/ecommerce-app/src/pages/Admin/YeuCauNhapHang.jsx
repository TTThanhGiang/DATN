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
    TextField,
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

import api from "../../api";
import { getToken } from "../../utils/auth";


export default function YeuCauNhapHang(){
    const [tabDangChon, setTabDangChon] = useState(0);
    const [soLuongSanPham, setSoLuongSanPham] = useState([]);

    const [danhSachYeuCau, setDanhSachYeuCau] = useState([]);
    const [danhSachChiNhanh, setDanhSachChiNhanh] = useState([]);

    const [sanPhamDaChon, setSanPhamDaChon] = useState([]);
    const [lyDo, setLyDo] = useState("");
    const [chiTietYeuCau, setChiTietYeuCau] = useState(null);
    const [moDialogHuy, setMoDialogHuy] = useState(false);
    const [lyDoHuy, setLyDoHuy] = useState("");

    const [moDialogChiNhanh, setMoDialogChiNhanh] = useState(false);
    const [timKiemChiNhanh, setTimKiemChiNhanh] = useState("");
    const [chiNhanhDaChon, setChiNhanhDaChon] = useState(null);

    const token = getToken();

    const soLuongMoiTrang = 10;
    const [trangHienTai, setTrangHienTai] = useState(1);
    const [tongSoYeuCau, setTongSoYeuCau] = useState(0);

    useEffect(() => {
        layDanhSachYeuCau();
        layDanhSachChiNhanh();
    }, [trangHienTai]);

    const layDanhSachYeuCau = async () => {
        try {
            const viTri = (trangHienTai - 1) * soLuongMoiTrang;
            const res = await api.get(`/admins/danh-sach-yeu-cau?limit=${soLuongMoiTrang}&offset=${viTri}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setDanhSachYeuCau(res.data.data.items);
                setTongSoYeuCau(res.data.data.total);
            }
        } catch (loi) {
            console.error("Lỗi khi lấy danh sách yêu cầu nhập hàng", loi);
        }
    };

    const layDanhSachChiNhanh = async () => {
        try {
            const res = await api.get(`/admins/danh-sach-chi-nhanh`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                setDanhSachChiNhanh(res.data.data);
            }
        } catch (loi) {  
            console.log("Không lấy được danh sách chi nhánh", loi);
        }
    };

    const xuLyXem = (yeuCau) => {
        setChiTietYeuCau(yeuCau);
        setSanPhamDaChon(yeuCau.san_pham_yeu_caus);
        setLyDo(yeuCau.ly_do);
        setTabDangChon(1);
    }

    const xuLyDoiTab = (_, giaTri) => {
        setTabDangChon(giaTri);
        setChiTietYeuCau(null);
    }

    const hienThiChipTrangThai = (trangThai) => {
        const mapBackendToFrontend = {
            "CHO_XU_LY": "pending",
            "DA_DUYET": "approved",
            "DA_HUY": "rejected",
        };
    
        const trangThaiGiaoDien = mapBackendToFrontend[trangThai];
    
        const danhSachTrangThai = {
            pending: { label: "Chờ duyệt", color: "warning" },
            approved: { label: "Đã duyệt", color: "success" },
            rejected: { label: "Từ chối", color: "error" },
        };
    
        return <Chip label={danhSachTrangThai[trangThaiGiaoDien].label} color={danhSachTrangThai[trangThaiGiaoDien].color} size="small" />;
    };

    const xuLyDuyet = async () => {
        const res = await api.put(`/admins/duyet-yeu-cau/${chiTietYeuCau.ma_yeu_cau}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
            alert(res.data.message);
            setTabDangChon(0);
            setChiTietYeuCau(null);
            layDanhSachYeuCau();
        } else {
            alert(res.data.message);
        }
    }

    const xuLyTuChoi = async () => {
        const res = await api.put(`/admins/tu-choi-yeu-cau/${chiTietYeuCau.ma_yeu_cau}`, { "ly_do": lyDoHuy }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
            alert(res.data.message);
            setTabDangChon(0);
            setChiTietYeuCau(null);
            layDanhSachYeuCau();
        }
        else {
            alert(res.data.message);
        }
    }

    const xuLyChonChiNhanh = (chiNhanh) => {
        setChiNhanhDaChon(chiNhanh);
        setMoDialogChiNhanh(false);
        setTimKiemChiNhanh("");
    };

    const danhSachChiNhanhDaLoc = danhSachChiNhanh.filter(
        (cn) =>
            cn.ten_chi_nhanh.toLowerCase().includes(timKiemChiNhanh.toLowerCase()) ||
            cn.dia_chi.toLowerCase().includes(timKiemChiNhanh.toLowerCase())
    );

    const duLieuDaLoc = chiNhanhDaChon
        ? danhSachYeuCau.filter(item => item.ma_chi_nhanh === chiNhanhDaChon?.ma_chi_nhanh)
        : danhSachYeuCau;

    return (
        <PageWrapper title="Yêu cầu nhập hàng">
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={tabDangChon} onChange={xuLyDoiTab}>
                    <Tab label="Danh sách yêu cầu" />
                    {chiTietYeuCau && <Tab label="Chi tiết yêu cầu" />}
                </Tabs>
            </Box>
            {tabDangChon === 0 && (
                <Box sx={{ overflowX: "auto", mt: 2 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 3, mt: 1 }} alignItems="center">
                        <OutlinedInput
                            placeholder="Chọn chi nhánh..."
                            value={chiNhanhDaChon ? chiNhanhDaChon.ten_chi_nhanh : "Tất cả chi nhánh"}
                            readOnly
                            fullWidth
                            endAdornment={
                                <IconButton onClick={() => setMoDialogChiNhanh(true)}>
                                    <ArrowDropDownIcon />
                                </IconButton>
                            }
                            onClick={() => setMoDialogChiNhanh(true)}
                            sx={{ width: 550, cursor: "pointer" }}
                        />
                        <Typography sx={{ color: "text.secondary" }}>
                            Tổng: <strong>{tongSoYeuCau}</strong> yêu cầu
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
                                {duLieuDaLoc.map(item => (
                                    <TableRow key={item.ma_yeu_cau} hover>
                                        <TableCell>{item.ten_chi_nhanh}</TableCell>
                                        <TableCell>{item.ly_do}</TableCell>
                                        <TableCell>{item.ngay_tao}</TableCell>
                                        <TableCell>{hienThiChipTrangThai(item.trang_thai)}</TableCell>
                                        <TableCell>
                                            <Button size="small" variant="contained" onClick={() => xuLyXem(item)}>
                                                Xem
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Stack spacing={2} alignItems="center" sx={{ mt: 2, mb: 4 }}>
                            <Pagination
                                count={Math.ceil(tongSoYeuCau / soLuongMoiTrang)}
                                page={trangHienTai}
                                onChange={(_, giaTri) => setTrangHienTai(giaTri)}
                                color="primary"
                                shape="rounded"
                            />
                        </Stack>
                    </TableContainer>
                </Box>
            )}
            {tabDangChon === 1 && (
                <Stack spacing={3}>
                    <TextField
                        fullWidth
                        label="Tên chi nhánh"
                        value={chiTietYeuCau.ten_chi_nhanh}
                    />
                    <TextField
                        fullWidth
                        label="Ngày tạo"
                        value={chiTietYeuCau.ngay_tao}
                    />
                    <TextField
                        fullWidth
                        label="Trạng thái"
                        value={chiTietYeuCau.trang_thai}
                    />
                    <OutlinedInput
                        fullWidth
                        placeholder="Chọn sản phẩm..."
                        readOnly
                        value={
                            sanPhamDaChon.length > 0
                                ? `${sanPhamDaChon.length} sản phẩm đã chọn`
                                : "Chọn sản phẩm..."
                        }
                        onClick={() => setMoDialogSanPham(true)}
                        endAdornment={
                            <IconButton onClick={() => setMoDialogSanPham(true)}>
                                <ArrowDropDownIcon />
                            </IconButton>
                        }
                        sx={{ cursor: "pointer" }}
                        disabled
                    />
                    {sanPhamDaChon.length > 0 && (
                        <Stack spacing={1} sx={{ mt: 1 }}>
                            {sanPhamDaChon.map((sp) => (
                                <Box
                                    key={sp.ma_san_pham}
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
                                    <Typography sx={{ flex: 1 }}>{sp.ten_san_pham}</Typography>

                                    {/* Ô nhập số lượng */}
                                    <TextField
                                        type="number"
                                        size="small"
                                        sx={{ width: 100 }}
                                        value={soLuongSanPham[sp.ma_san_pham] || 1}
                                        onChange={(e) =>
                                            setSoLuongSanPham((prev) => ({
                                                ...prev,
                                                [sp.ma_san_pham]: Math.max(1, parseInt(e.target.value) || 1),
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
                        value={lyDo}
                        onChange={e => setLyDo(e.target.value)}
                    />
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={xuLyDuyet}
                        >
                            Duyệt
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setMoDialogHuy(true)}
                        >
                            Từ chối
                        </Button>
                    </Stack>
                </Stack>
            )}

            {/* Dialog Hủy */}
            {moDialogHuy && (
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
                            value={lyDoHuy}
                            onChange={(e) => setLyDoHuy(e.target.value)}
                        />
                        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                            <Button onClick={() => setMoDialogHuy(false)}>Thoát</Button>
                            <Button
                                color="error"
                                variant="contained"
                                onClick={() => {
                                    xuLyTuChoi();
                                    setMoDialogHuy(false);
                                }}
                            >Xác nhận</Button>
                        </Stack>
                    </Paper>
                </Box>
            )}

            {/* DIALOG CHỌN CHI NHÁNH */}
            <Dialog open={moDialogChiNhanh} onClose={() => setMoDialogChiNhanh(false)} fullWidth maxWidth="sm">
                <DialogTitle>Chọn chi nhánh</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        placeholder="Tìm theo tên hoặc địa chỉ..."
                        value={timKiemChiNhanh}
                        onChange={(e) => setTimKiemChiNhanh(e.target.value)}
                        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
                        sx={{ mb: 2 }}
                    />
                    {tabDangChon === 0 && (
                        <>
                            <ListItemButton onClick={() => xuLyChonChiNhanh(null)}>
                                <ListItemText
                                    primary="Tất cả chi nhánh"
                                    secondary="Hiển thị toàn bộ dữ liệu tồn kho"
                                />
                            </ListItemButton>
                            <Divider />
                        </>
                    )}

                    <List>
                        {danhSachChiNhanhDaLoc.map((chiNhanh) => (
                            <React.Fragment key={chiNhanh.ma_chi_nhanh}>  
                                <ListItemButton onClick={() => xuLyChonChiNhanh(chiNhanh)}>
                                    <ListItemText primary={chiNhanh.ten_chi_nhanh} secondary={chiNhanh.dia_chi} />
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