import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Stack,
  Grid,
  Tooltip
} from '@mui/material';
import { Inventory, Business, TrendingUp, TrendingDown } from '@mui/icons-material';

// --- Bảng 1: Sản phẩm bán chạy (Trích xuất từ danh sách đơn hàng) ---
const BangSanPham = ({ topSanPham = [] }) => {
  return (
    <TableContainer sx={{ maxHeight: 400 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Sản phẩm</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Số lượng</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Doanh thu</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topSanPham.length > 0 ? (
            topSanPham.map((sp) => {
              const isGrowth = sp.phan_tram_tang_truong >= 0;
              
              return (
                <TableRow key={sp.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <img
                        src={sp.hinh_anh || "https://via.placeholder.com/50"} 
                        alt={sp.ten}
                        style={{ 
                          width: 45, 
                          height: 45, 
                          objectFit: "cover", 
                          borderRadius: 6,
                          border: '1px solid #eee'
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}> 
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          sx={{ 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            maxWidth: 180
                          }}
                        >
                          {sp.ten}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {sp.id}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {sp.so_luong}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2">
                      {sp.doanh_thu.toLocaleString()} ₫
                    </Typography>
                    {sp.phan_tram_tang_truong !== undefined ? (
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} 
                             sx={{ color: isGrowth ? 'success.main' : 'error.main' }}>
                        {isGrowth ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                        <Typography variant="caption" fontWeight="bold">
                          {Math.abs(sp.phan_tram_tang_truong)}%
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">--</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">Không có dữ liệu sản phẩm</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
// --- Bảng 2: Thống kê chi nhánh (Gom nhóm theo chi nhánh) ---
const BangChiNhanh = ({ chiNhanh }) => {
  return (
    <TableContainer sx={{ maxHeight: 400 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Chi nhánh</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Đơn hàng</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>Tổng doanh thu</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chiNhanh.length > 0 ? (
            chiNhanh.map((cn, index) => {
              const isGrowth = cn.phan_tram_tang_truong >= 0;
              return (
                <TableRow key={index} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                        {index + 1}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{cn.ten}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{cn.don_hang}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="primary.dark" fontWeight="bold">
                      {cn.doanh_thu?.toLocaleString()} ₫
                    </Typography>
                    {cn.phan_tram_tang_truong !== null ? (
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} 
                             sx={{ color: isGrowth ? 'success.main' : 'error.main' }}>
                        {isGrowth ? <TrendingUp fontSize="inherit" /> : <TrendingDown fontSize="inherit" />}
                        <Typography variant="caption" fontWeight="bold">
                          {Math.abs(cn.phan_tram_tang_truong)}%
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">--</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                Không có dữ liệu chi nhánh
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// --- Main Export Component ---
export default function ThongKeChiTiet({ topSanPham, chiNhanh, dangTaiBang }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        {/* Khối Sản phẩm */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Inventory color="primary" fontSize="small" />
              <Typography variant="h6" fontWeight="bold">Top sản phẩm bán chạy</Typography>
            </Stack>
            <BangSanPham topSanPham={topSanPham} />
          </Paper>
        </Grid>

        {/* Khối Chi nhánh */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Business color="primary" fontSize="small" />
              <Typography variant="h6" fontWeight="bold">Hiệu suất chi nhánh</Typography>
            </Stack>
            <BangChiNhanh chiNhanh={chiNhanh} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}