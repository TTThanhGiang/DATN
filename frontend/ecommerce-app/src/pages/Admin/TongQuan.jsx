import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Grid, Box, Paper, Typography, TextField, 
  FormControl, InputLabel, Select, MenuItem, Stack,
  InputAdornment
} from '@mui/material';

import KhungThongKe from "../../components/KhungThongKe";
import api from '../../api';
import BieuDoDoanhThu from '../../components/BieuDoDoanhThu';
import ThongKeChiTiet from '../../components/Admin/SanPhamVaChiNhanh';
import { getToken } from '../../utils/auth';
import { CalendarToday, Search, Storefront } from '@mui/icons-material';

const formatDate = (date) => date.toISOString().split('T')[0];

export default function TongQuan() {
  const [chiNhanhHienTai, setChiNhanhHienTai] = useState("Tất cả");
  const [danhSachChiNhanh, setDanhSachChiNhanh] = useState([]);
  const [tuKhoaSanPham, setTuKhoaSanPham] = useState("");
  const [kieuSoSanh, setKieuSoSanh] = useState("7_ngay");
  const [thongTinTongQuan, setThongTinTongQuan] = useState(null);

  const [topSanPham, setTopSanPham] = useState([]);
  const [chiNhanh, setChiNhanh] = useState([]);

  const [dangTai, setDangTai] = useState(false);

  const homNay = new Date();
  const bayNgayTruoc = new Date();
  bayNgayTruoc.setDate(homNay.getDate() - 7);

  const [ngayBatDau, setNgayBatDau] = useState(formatDate(bayNgayTruoc));
  const [ngayKetThuc, setNgayKetThuc] = useState(formatDate(homNay));

  const [duLieuBieuDo, setDuLieuBieuDo] = useState({
      labels: [],
      hien_tai: [],
      ky_truoc: [],
    });
  const [dangTaiBieuDo, setDangTaiBieuDo] = useState(false);

  const token = getToken();

  const handleDateChange = (name, value) => {
    if (name === 'tu_ngay') setNgayBatDau(value);
    if (name === 'den_ngay') setNgayKetThuc(value);
    
    setKieuSoSanh("custom");
  };

  const dashboardParams = useMemo(() => {
    return {
      tu_ngay: ngayBatDau,
      den_ngay: ngayKetThuc,
      ma_chi_nhanh: chiNhanhHienTai !== "Tất cả" ? chiNhanhHienTai : undefined,
      ten_san_pham: tuKhoaSanPham || undefined,
      kieu_so_sanh: kieuSoSanh
    };
  }, [ngayBatDau, ngayKetThuc, chiNhanhHienTai, tuKhoaSanPham, kieuSoSanh]);

  useEffect(() => {
    const fetchExtraData = async () => {
      try {
        const [resTopSp, resHieuSuatCN] = await Promise.all([
          api.get('/admins/tong-quan/top-san-pham', { params: dashboardParams }),
          api.get('/admins/tong-quan/hieu-suat-chi-nhanh', { params: dashboardParams })
        ]);
        setTopSanPham(resTopSp.data);
        setChiNhanh(resHieuSuatCN.data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu bảng:", err);
      }
    };

    const timer = setTimeout(() => {
      fetchExtraData();
      layDuLieuDashboard();
    }, 500);

    return () => clearTimeout(timer);
  }, [dashboardParams]);

  useEffect(() => {
    const fetchChiNhanh = async () => {
      try {
        const res = await api.get(`/admins/danh-sach-chi-nhanh`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setDanhSachChiNhanh(res.data.data);
      } catch (err) { console.error(err); }
    };
    fetchChiNhanh();
  }, []);
  

  const layDuLieuDashboard = async () => {
    setDangTai(true);
    try {
      const phanHoi = await api.get("/admins/tong-quan", { params: dashboardParams });
      setThongTinTongQuan(phanHoi.data);
    } catch (loi) {
      console.error("Lỗi:", loi);
    } finally {
      setDangTai(false);
    }
  };
  const layDuLieuBieuDo = async () => {
      if (!dashboardParams.tu_ngay || !dashboardParams.den_ngay) return;
      setDangTaiBieuDo(true);
      try {
        const res = await api.get(
          "/admins/tong-quan/bieu-do-so-sanh",
          {
            params: dashboardParams,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        setDuLieuBieuDo({
          labels: res.data.labels ?? [],
          hien_tai: res.data.data_hien_tai ?? [],
          ky_truoc: res.data.data_ky_truoc ?? [],
        });
      } catch (err) {
        console.error("Lỗi tải biểu đồ:", err);
      } finally {
        setDangTaiBieuDo(false);
      }
    };

  useEffect(() => {
    const thoiGianCho = setTimeout(() => {
      layDuLieuBieuDo();
      layDuLieuDashboard();
    }, 500);
    return () => clearTimeout(thoiGianCho);
  }, [dashboardParams]);

  const getCustomCompareLabel = (start, end) => {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `Trước đó ${diffDays} ngày`;
};

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Tổng quan {dangTai && <Typography variant="caption">(Đang cập nhật...)</Typography>}
      </Typography>
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
        <Grid container spacing={2} alignItems="center">
          
          <Grid size={{ xs: 12, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Mốc so sánh</InputLabel>
              <Select 
                value={kieuSoSanh} 
                label="Mốc so sánh" 
                onChange={(e) => setKieuSoSanh(e.target.value)}
                startAdornment={<InputAdornment position="start"><CalendarToday fontSize="small" color="primary"/></InputAdornment>}
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="custom">
                  {kieuSoSanh === "custom" 
                    ? `${getCustomCompareLabel(ngayBatDau, ngayKetThuc)}` 
                    : "Theo khoảng ngày (Tự động)"}
                </MenuItem>
                <MenuItem value="1_ngay">So với hôm qua</MenuItem>
                <MenuItem value="7_ngay">7 ngày trước</MenuItem>
                <MenuItem value="30_ngay">30 ngày trước</MenuItem>
                <MenuItem value="thang_truoc">Cùng kỳ tháng trước</MenuItem>
                <MenuItem value="nam_truoc">Cùng kỳ năm trước</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <TextField 
              fullWidth size="small" type="date" label="Từ ngày" 
              value={ngayBatDau}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => handleDateChange('tu_ngay', e.target.value)}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <TextField 
              fullWidth size="small" type="date" label="Đến ngày" 
              value={ngayKetThuc}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => handleDateChange('den_ngay', e.target.value)}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Chi nhánh</InputLabel>
              <Select 
                value={chiNhanhHienTai} 
                label="Chi nhánh"
                onChange={(e) => setChiNhanhHienTai(e.target.value)}
                startAdornment={<InputAdornment position="start"><Storefront fontSize="small" color="primary"/></InputAdornment>}
                sx={{ bgcolor: 'white' }}
              > 
                <MenuItem value="Tất cả">Tất cả chi nhánh</MenuItem>
                {danhSachChiNhanh.map((cn) => (
                  <MenuItem key={cn.ma_chi_nhanh} value={cn.ma_chi_nhanh}>
                    {cn.ten_chi_nhanh}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField 
              fullWidth size="small" 
              label="Tìm sản phẩm" 
              placeholder="Nhập tên sản phẩm..."
              value={tuKhoaSanPham}
              onChange={(e) => setTuKhoaSanPham(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>

        </Grid>
      </Paper>

      {/* --- Hiển thị Số liệu --- */}
      <Grid container spacing={2}>
        {thongTinTongQuan ? (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <KhungThongKe 
                title="Doanh thu" 
                count={`${thongTinTongQuan.hien_tai.doanh_thu.toLocaleString()} ₫`}
                percentage={Number(thongTinTongQuan.so_sanh.doanh_thu_pct)} 
                extra={thongTinTongQuan.bo_loc.mo_ta_so_sanh} // Backend nên trả về text mô tả kỳ so sánh
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <KhungThongKe 
                title="Đơn hàng" 
                count={thongTinTongQuan.hien_tai.so_don.toLocaleString()} // Bỏ chữ ₫
                percentage={Number(thongTinTongQuan.so_sanh.so_don_pct)} 
                extra={thongTinTongQuan.bo_loc.mo_ta_so_sanh} 
              />
            </Grid>
          </>
        ) : (
          <Typography sx={{ ml: 2 }}>Đang khởi tạo dữ liệu...</Typography>
        )}

            <Grid size={{ xs: 12, md: 12 }}>
              <BieuDoDoanhThu 
                data={duLieuBieuDo}
                loading={dangTaiBieuDo}
              />
            </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
            <ThongKeChiTiet
            topSanPham={topSanPham}
            chiNhanh={chiNhanh}
          />
        </Grid>
        
        
      </Grid>
    </Box>
  );
}