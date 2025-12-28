import { useState, useEffect } from 'react';
import { Stack, TextField, Button, Divider, Autocomplete } from '@mui/material';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import api from '../../api';
import { getToken } from '../../utils/auth';

export default function FormChiNhanh({ danhSachTinhThanh, chiNhanhDangSua, khiThanhCong }) {
  const [danhSachXa, setDanhSachXa] = useState([]);
  const token = getToken();

  const [duLieuForm, setDuLieuForm] = useState({
    ten_chi_nhanh: '',
    dia_chi: '',
    so_dien_thoai: '',
    thanh_pho: '',
    xa: '',
  });

  const tenTinhThanh = danhSachTinhThanh.find(t => t.code === duLieuForm.thanh_pho)?.name || '';
  const tenXaPhuong = danhSachXa.find(x => x.code === duLieuForm.xa)?.name || '';

  const duLieuGuiDi = {
    ...duLieuForm,
    thanh_pho: tenTinhThanh,
    xa: tenXaPhuong,
  };

  useEffect(() => {
    if (chiNhanhDangSua) {
      // Tách địa chỉ để tìm tỉnh/thành và xã/phường
      const cacPhan = chiNhanhDangSua.dia_chi.split(',').map(p => p.trim());
      const [duongPho, tenXa, tenTinh] = cacPhan;

      const tinhTimDuoc = danhSachTinhThanh.find(
        t => tenTinh && (t.name.includes(tenTinh) || tenTinh.includes(t.name))
      );

      const xaTimDuoc = tinhTimDuoc?.wards.find(
        x => tenXa && (x.name.includes(tenXa) || tenXa.includes(x.name))
      );

      setDanhSachXa(tinhTimDuoc?.wards || []);
      setDuLieuForm({
        ten_chi_nhanh: chiNhanhDangSua.ten_chi_nhanh,
        dia_chi: duongPho || '',
        so_dien_thoai: chiNhanhDangSua.so_dien_thoai,
        thanh_pho: tinhTimDuoc?.code || '',
        xa: xaTimDuoc?.code || '',
      });
    } else {
      setDuLieuForm({
        ten_chi_nhanh: '',
        dia_chi: '',
        so_dien_thoai: '',
        thanh_pho: '',
        xa: '',
      });
      setDanhSachXa([]);
    }
  }, [chiNhanhDangSua, danhSachTinhThanh]);

  const xuLyThayDoi = e => {
    const { name, value } = e.target;
    setDuLieuForm(truocDo => ({ ...truocDo, [name]: value }));
  };

  const xuLyLuu = async () => {
    try {
      let ketQua;
      if (chiNhanhDangSua) {
        ketQua = await api.put(
          `/admins/cap-nhat-chi-nhanh/${chiNhanhDangSua.ma_chi_nhanh}`,
          duLieuGuiDi,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        ketQua = await api.post('/admins/them-chi-nhanh', duLieuGuiDi, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (ketQua.data.success) {
        alert(chiNhanhDangSua ? 'Cập nhật thành công!' : 'Tạo chi nhánh thành công!');
        khiThanhCong?.();
      } else {
        alert(ketQua.data.message);
      }
    } catch (loi) {
      console.error(loi);
      alert('Lỗi khi lưu chi nhánh!');
    }
  };

  return (
    <Stack spacing={3}>
      <TextField
        label="Tên chi nhánh"
        name="ten_chi_nhanh"
        value={duLieuForm.ten_chi_nhanh}
        onChange={xuLyThayDoi}
        fullWidth
      />

      <TextField
        label="Số điện thoại"
        name="so_dien_thoai"
        value={duLieuForm.so_dien_thoai}
        onChange={xuLyThayDoi}
        fullWidth
      />

      <TextField
        label="Địa chỉ"
        name="dia_chi"
        value={duLieuForm.dia_chi}
        onChange={xuLyThayDoi}
        fullWidth
      />

      <Autocomplete
        options={danhSachTinhThanh}
        getOptionLabel={option => option.name}
        value={danhSachTinhThanh.find(t => t.code === duLieuForm.thanh_pho) || null}
        onChange={(event, giaTriMoi) => {
          setDuLieuForm(truocDo => ({
            ...truocDo,
            thanh_pho: giaTriMoi?.code || '',
            xa: '',
          }));
          setDanhSachXa(giaTriMoi?.wards || []);
        }}
        renderInput={params => <TextField {...params} label="Tỉnh / Thành phố" />}
      />

      <Autocomplete
        options={danhSachXa}
        getOptionLabel={option => option.name}
        value={danhSachXa.find(x => x.code === duLieuForm.xa) || null}
        onChange={(event, giaTriMoi) => {
          setDuLieuForm(truocDo => ({
            ...truocDo,
            xa: giaTriMoi?.code || '',
          }));
        }}
        renderInput={params => <TextField {...params} label="Xã / Phường" />}
      />

      <Divider sx={{ my: 2 }} />

      <Button variant="contained" startIcon={<AddCircleOutline />} onClick={xuLyLuu}>
        {chiNhanhDangSua ? 'Lưu thay đổi' : 'Tạo chi nhánh'}
      </Button>
    </Stack>
  );
}
