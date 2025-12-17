import React, { useState } from "react";
import { Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, IconButton, Typography, Button, Divider, Chip } from "@mui/material";
import PageWrapper from "../../components/PageWrapper";
import { EditOutlined, DeleteOutlined, CheckCircleOutline, CancelOutlined } from "@mui/icons-material";

export default function QuanLyDanhGia() {
  const [danhGiaDangChon, setDanhGiaDangChon] = useState(null);
  const [tabDangChon, setTabDangChon] = useState(0);

  const sampleReviews = [
    {
      id: 1,
      image: "https://via.placeholder.com/60",
      name: "Áo Thun Nam Basic",
      category: "Thời trang nam",
      user: "Nguyễn Văn A",
      rating: 4,
      comment: "Áo mặc thoáng mát, chất lượng ổn so với giá.",
      status: "pending",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/60",
      name: "Tai nghe Bluetooth Z5",
      category: "Phụ kiện công nghệ",
      user: "Trần Thị B",
      rating: 5,
      comment: "Âm thanh tốt, pin trâu, đáng tiền.",
      status: "approved",
    },
    {
      id: 3,
      image: "https://via.placeholder.com/60",
      name: "Giày Sneaker N-White",
      category: "Giày dép",
      user: "Phạm Văn C",
      rating: 3,
      comment: "Form hơi nhỏ, nhưng kiểu dáng đẹp.",
      status: "rejected",
    },
  ];

  const [danhSachDanhGia, setDanhSachDanhGia] = useState(sampleReviews);

  const xuLyDoiTab  = (_, giaTriMoi) => setTabDangChon(giaTriMoi);

  const xuLyChonDanhGia  = (danhGia) => {
    setDanhGiaDangChon(danhGia);
    setTabDangChon(1);
  };

  const xuLyXoaDanhGia  = (id) => {
    setDanhSachDanhGia((truocDo ) => truocDo .filter((r) => r.id !== id));
  };

  return (
    <PageWrapper title="Quản lý đánh giá">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabDangChon} onChange={xuLyDoiTab}>
          <Tab label="Danh sách đánh giá" />
          {danhGiaDangChon && <Tab label="Duyệt đánh giá" />}
        </Tabs>
      </Box>

      {tabDangChon === 0 && (
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
              {danhSachDanhGia.map((r) => (
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
                      <IconButton color="primary" size="small" onClick={() => xuLyChonDanhGia(r)}>
                        <EditOutlined />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => xuLyXoaDanhGia(r.id)}>
                        <DeleteOutlined />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabDangChon === 1 && danhGiaDangChon && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Duyệt đánh giá #{danhGiaDangChon.id}</Typography>
          <Divider sx={{ my: 2 }} />

          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography><strong>Sản phẩm:</strong> {danhGiaDangChon.name}</Typography>
            <Typography><strong>Người đánh giá:</strong> {danhGiaDangChon.user}</Typography>
            <Typography><strong>Đánh giá:</strong> ⭐ {danhGiaDangChon.rating}</Typography>
            <Typography><strong>Bình luận:</strong> {danhGiaDangChon.comment}</Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="success" startIcon={<CheckCircleOutline />}>
              Duyệt
            </Button>
            <Button variant="contained" color="error" startIcon={<CancelOutlined />} onClick={() => setDanhGiaDangChon(null)}>
              Từ chối
            </Button>
          </Stack>
        </Box>
      )}
    </PageWrapper>
  );
}
