import { useState } from "react";
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
    Paper

} from "@mui/material";


export default function YeuCauNhapHang(){
    const [activeTab, setActiveTab] = useState(0);
    const [chiTietYeuCau, setChiTietYeuCau] = useState(null);


    const handleTabChange = (_,value) =>{
        setActiveTab(value);
    }
    return(
        <PageWrapper title="Yêu cầu nhập hàng">
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Danh sách yêu cầu" />
                {chiTietYeuCau && <Tab label="Chi tiết yêu cầu" />}
                </Tabs>
            </Box>
            {activeTab === 0 && (
            <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #eee" }}>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell align="center" width={60}>ID</TableCell>
                        <TableCell>Ảnh</TableCell>
                        <TableCell>Tên sản phẩm</TableCell>
                        <TableCell>Danh mục</TableCell>
                        <TableCell>Người đánh giá</TableCell>
                        <TableCell>Đánh giá</TableCell>
                        <TableCell>Bình luận</TableCell>
                        <TableCell>Trạng thái</TableCell>
                    
                        <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {/* {reviews.map((r) => (
                        <TableRow key={r.id} hover>
                        <TableCell align="center">{r.id}</TableCell>
                        <TableCell>
                            <Box component="img" src={r.image} alt={r.name} sx={{ width: 50, height: 50, borderRadius: 1 }} />
                        </TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.category}</TableCell>
                        <TableCell>{r.user}</TableCell>
                        <TableCell>⭐ {r.rating}</TableCell>
                        <TableCell><Typography variant="body2">{r.comment}</Typography></TableCell>
                        <TableCell>{r.status === "approved" ? <Chip label="Đã duyệt" color="success" size="small" /> : r.status === "rejected" ? <Chip label="Từ chối" color="error" size="small" /> : <Chip label="Chờ duyệt" color="warning" size="small" />}</TableCell>
                        <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton color="primary" size="small" onClick={() => handleReviewSelect(r)}>
                                <EditOutlined />
                            </IconButton>
                            <IconButton color="error" size="small" onClick={() => handleDelete(r.id)}>
                                <DeleteOutlined />
                            </IconButton>
                            </Stack>
                        </TableCell>
                        </TableRow>
                    ))} */}
                    </TableBody>
                </Table>
                </TableContainer>
            )}
        </PageWrapper>
    );
}