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

export default function YeuCauNhapHang() {
    const [tabHienTai, setTabHienTai] = useState(0);
    const [danhSachYeuCau, setDanhSachYeuCau] = useState([]);
    const [danhSachSanPham, setDanhSachSanPham] = useState([]);

    const [sanPhamDaChon, setSanPhamDaChon] = useState([]);
    const [soLuongSanPham, setSoLuongSanPham] = useState({});
    const [lyDo, setLyDo] = useState("");
    const [chiTietYeuCau, setChiTietYeuCau] = useState(null);

    const [moDialogSanPham, setMoDialogSanPham] = useState(false);
    const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState("");

    const maXacThuc = getToken();

    const hienThiChipTrangThai = (trangThai) => {
        const anhXaBackendSangFrontend = {
            "CHO_XU_LY": "pending",
            "DA_DUYET": "approved",
            "DA_HUY": "rejected",
        };
    
        const trangThaiFe = anhXaBackendSangFrontend[trangThai];
    
        const mauSac = {
            pending: { label: "Chờ duyệt", color: "warning" },
            approved: { label: "Đã duyệt", color: "success" },
            rejected: { label: "Từ chối", color: "error" },
        };
    
        return <Chip label={mauSac[trangThaiFe].label} color={mauSac[trangThaiFe].color} size="small" />;
    };

    const xuLyThayDoiTab = (_, giaTri) => {
        setTabHienTai(giaTri);
        setChiTietYeuCau(null);
        setSanPhamDaChon([]);
        setLyDo("");
        setTuKhoaTimKiem("");
    };

    const danhSachSanPhamLoc = danhSachSanPham.filter(p =>
        p.ten_san_pham.toLowerCase().includes(tuKhoaTimKiem.toLowerCase())
    );

    useEffect(() => {
        taiDanhSachYeuCau();
        taiDanhSachSanPham();
    }, []);

    const taiDanhSachYeuCau = async () => {
        try {
            const phanHoi = await api.get(`/manager/danh-sach-yeu-cau`, {
                headers: { Authorization: `Bearer ${maXacThuc}` }
            });
            if (phanHoi.data.success) setDanhSachYeuCau(phanHoi.data.data);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách yêu cầu nhập hàng", err);
        }
    };

    const taiDanhSachSanPham = async () => {
        try {
            const phanHoi = await api.get(`/users/tat-ca-san-pham`);
            if (phanHoi.data.success) setDanhSachSanPham(phanHoi.data.data);
        } catch (err) {
            console.error("Lấy danh sách sản phẩm thất bại", err);
        }
    };

    const xuLyXemChiTiet = (yeuCau) => {
        setChiTietYeuCau(yeuCau);
        setSanPhamDaChon(yeuCau.san_pham_yeu_caus);
        setLyDo(yeuCau.ly_do);
        setTabHienTai(1);
    };

    const xuLyChonSanPham = (sanPham) => {
        setSanPhamDaChon(truoc => {
            const tonTai = truoc.find(p => p.ma_san_pham === sanPham.ma_san_pham);
            const soLuongMoi = { ...soLuongSanPham };
            if (tonTai) {
                const capNhat = truoc.filter(p => p.ma_san_pham !== sanPham.ma_san_pham);
                delete soLuongMoi[sanPham.ma_san_pham];
                setSoLuongSanPham(soLuongMoi);
                return capNhat;
            }
            soLuongMoi[sanPham.ma_san_pham] = 1;
            setSoLuongSanPham(soLuongMoi);
            return [...truoc, sanPham];
        });
    };

    const xuLyGuiNhieuYeuCau = async () => {
        if (sanPhamDaChon.length === 0 || !lyDo) {
            alert("Vui lòng chọn sản phẩm và nhập lý do.");
            return;
        }

        try {
            const duLieuGui = {
                ly_do: lyDo,
                san_phams: sanPhamDaChon.map(p => ({
                    ma_san_pham: p.ma_san_pham,
                    so_luong: soLuongSanPham[p.ma_san_pham] || 1,
                }))
            };

            const phanHoi = await api.post("/manager/gui-yeu-cau-nhap-hang", duLieuGui, {
                headers: { Authorization: `Bearer ${maXacThuc}` }
            });

            const { data = [], errors = [] } = phanHoi.data;
            let thongBao = "";

            if (data.length > 0) thongBao += `✅ Thêm thành công ${data.length} sản phẩm\n`;
            if (errors.length > 0) {
                thongBao += `❌ Thất bại ${errors.length} sản phẩm:\n`;
                errors.forEach((err, idx) => { thongBao += `${idx + 1}. ${err}\n`; });
            }

            if (thongBao) alert(thongBao);

            setSanPhamDaChon([]);
            setSoLuongSanPham({});
            setLyDo("");
            setTabHienTai(0);
            taiDanhSachYeuCau();

        } catch (err) {
            console.error("Lỗi Axios:", err);
            alert(err.response?.data?.message || "Gửi yêu cầu thất bại");
        }
    };

    const xuLyCapNhatYeuCau = async () => {
        if (sanPhamDaChon.length === 0 || !lyDo) {
            alert("Vui lòng chọn sản phẩm và nhập lý do.");
            return;
        }

        const duLieuGui = {
            ly_do: lyDo,
            san_phams: sanPhamDaChon.map(p => ({
                ma_san_pham: p.ma_san_pham,
                so_luong: soLuongSanPham[p.ma_san_pham] || 1
            }))
        };

        try {
            const ma_yeu_cau = chiTietYeuCau.ma_yeu_cau;
            const phanHoi = await api.put(`/manager/cap-nhat-yeu-cau/${ma_yeu_cau}`, duLieuGui, {
                headers: { Authorization: `Bearer ${maXacThuc}` }
            });

            const { data = [], errors = [], message } = phanHoi.data;
            let thongBao = "";

            if (data.length > 0) thongBao += `✅ Cập nhật thành công ${data.length} sản phẩm\n`;
            if (errors.length > 0) {
                thongBao += `❌ Thất bại ${errors.length} sản phẩm:\n`;
                errors.forEach((err, idx) => { thongBao += `${idx + 1}. ${err}\n`; });
            }

            alert(thongBao || message);
            setTabHienTai(0);
            taiDanhSachYeuCau();

        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert(err.response?.data?.message || "Lỗi cập nhật yêu cầu");
        }
    };

    return(
        <PageWrapper title="Yêu cầu nhập hàng">
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={tabHienTai} onChange={xuLyThayDoiTab}>
                    <Tab label="Danh sách yêu cầu" />
                    <Tab label={chiTietYeuCau ? "Chi tiết yêu cầu" : "Gửi yêu cầu nhập hàng"}/>
                </Tabs>
            </Box>

            {tabHienTai === 0 && (
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
                                {danhSachYeuCau.map(item => (
                                    <TableRow key={item.ma_yeu_cau} hover>
                                        <TableCell>{item.ma_yeu_cau}</TableCell>
                                        <TableCell>{item.ly_do}</TableCell>
                                        <TableCell>{item.ngay_tao}</TableCell>
                                        <TableCell>{hienThiChipTrangThai(item.trang_thai)}</TableCell>
                                        <TableCell>
                                            <Button size="small" variant="contained" onClick={() => xuLyXemChiTiet(item)}>
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

            {tabHienTai === 1 && (
                <Stack spacing={3}>
                    <OutlinedInput
                        fullWidth
                        placeholder="Chọn sản phẩm..."
                        readOnly
                        value={sanPhamDaChon.length > 0 ? `${sanPhamDaChon.length} sản phẩm đã chọn` : "Chọn sản phẩm..."}
                        onClick={() => setMoDialogSanPham(true)}
                        endAdornment={
                            <IconButton onClick={() => setMoDialogSanPham(true)}>
                                <ArrowDropDownIcon />
                            </IconButton>
                        }
                        sx={{ cursor: "pointer" }}
                    />
                    {sanPhamDaChon.length > 0 && (
                        <Stack spacing={1} sx={{ mt: 1 }}>
                            {sanPhamDaChon.map((p) => (
                                <Box key={p.ma_san_pham} sx={{ p: 1, border: "1px solid #ddd", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                                    <Typography sx={{ flex: 1 }}>{p.ten_san_pham}</Typography>
                                    <TextField
                                        type="number"
                                        size="small"
                                        sx={{ width: 100 }}
                                        value={soLuongSanPham[p.ma_san_pham] || 1}
                                        onChange={(e) => setSoLuongSanPham((truoc) => ({
                                            ...truoc,
                                            [p.ma_san_pham]: Math.max(1, parseInt(e.target.value) || 1),
                                        }))}
                                    />
                                    <Button size="small" color="error" onClick={() => xuLyChonSanPham(p)}>Xoá</Button>
                                </Box>
                            ))}
                        </Stack>
                    )}
                    <TextField fullWidth label="Lý do" value={lyDo} onChange={e => setLyDo(e.target.value)} />
                    {chiTietYeuCau && (
                        <TextField fullWidth label="Lý do từ chối" value={chiTietYeuCau.ly_do_tu_choi || ""} disabled sx={{ mt: 2 }} />
                    )}
                    <Divider sx={{ my: 2 }} />
                    <Stack justifyContent="center">
                        {chiTietYeuCau ? (
                            <Button variant="contained" startIcon={<EditOutlined />} color="primary" onClick={xuLyCapNhatYeuCau}>
                                Lưu thay đổi
                            </Button>
                        ) : (
                            <Button variant="contained" startIcon={<AddCircleOutline />} color="primary" onClick={xuLyGuiNhieuYeuCau}>
                                Gửi yêu cầu
                            </Button>
                        )}
                    </Stack>
                </Stack>
            )}

            <Dialog open={moDialogSanPham} onClose={() => setMoDialogSanPham(false)} fullWidth maxWidth="sm">
                <DialogTitle>Chọn sản phẩm</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        placeholder="Tìm theo tên sản phẩm..."
                        value={tuKhoaTimKiem}
                        onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
                        sx={{ mb: 2 }}
                    />
                    <List>
                        {danhSachSanPhamLoc.map(product => {
                            const daChon = sanPhamDaChon.some(p => p.ma_san_pham === product.ma_san_pham);
                            return (
                                <React.Fragment key={product.ma_san_pham}>
                                    <ListItemButton selected={daChon} onClick={() => xuLyChonSanPham(product)}>
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