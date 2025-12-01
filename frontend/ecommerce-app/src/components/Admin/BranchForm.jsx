import { useState, useEffect } from 'react';
import { Stack, TextField, FormControl, InputLabel, Select, MenuItem, Button, Divider, Autocomplete } from '@mui/material';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import api from '../../api';
import { getToken } from '../../utils/auth';

export default function BranchForm({ locations, editBranch, onSuccess }) {
  const [wards, setWards] = useState([]);
  const token = getToken();
  const [formData, setFormData] = useState({
    ten_chi_nhanh: '',
    dia_chi: '',
    so_dien_thoai: '',
    thanh_pho: '',
    xa: '',
  });

  const provinceName = locations.find(p => p.code === formData.thanh_pho)?.name || "";
  const wardName = wards.find(w => w.code === formData.xa)?.name || "";

  const payload = {
    ...formData,
    thanh_pho: provinceName,
    xa: wardName
  };

  useEffect(() => {
    if (editBranch) {
      // Tách địa chỉ và tìm tỉnh / xã
      const parts = editBranch.dia_chi.split(',').map(p => p.trim());
      const [street, wardName, provinceName] = parts;

      const foundProvince = locations.find(
        p => provinceName && (p.name.includes(provinceName) || provinceName.includes(p.name))
      );

      const foundWard = foundProvince?.wards.find(
        w => wardName && (w.name.includes(wardName) || wardName.includes(w.name))
      );

      setWards(foundProvince?.wards || []);
      setFormData({
        ten_chi_nhanh: editBranch.ten_chi_nhanh,
        dia_chi: street || '',
        so_dien_thoai: editBranch.so_dien_thoai,
        thanh_pho: foundProvince?.code || '',
        xa: foundWard?.code || '',
      });
    } else {
      setFormData({
        ten_chi_nhanh: '',
        dia_chi: '',
        so_dien_thoai: '',
        thanh_pho: '',
        xa: '',
      });
      setWards([]);
    }
  }, [editBranch, locations]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try{
      let res;
      if(editBranch){
        res = await api.put(`/admins/cap-nhat-chi-nhanh/${editBranch.ma_chi_nhanh}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        console.log(payload);
      } else {
        res = await api.post(`/admins/them-chi-nhanh`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
      }
      if (res.data.success) {
        alert(editBranch ? "Cập nhật thành công!" : "Tạo chi nhánh thành công!");
        onSuccess?.();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu danh mục!");
    }
  };

  return (
    <Stack spacing={3}>
      <TextField label="Tên chi nhánh" name="ten_chi_nhanh" value={formData.ten_chi_nhanh} onChange={handleChange} fullWidth />
      <TextField label="Số điện thoại" name="so_dien_thoai" value={formData.so_dien_thoai} onChange={handleChange} fullWidth />
      <TextField label="Địa chỉ" name="dia_chi" value={formData.dia_chi} onChange={handleChange} fullWidth />
      <Autocomplete
        options={locations}
        getOptionLabel={(option) => option.name}
        value={locations.find(p => p.code === formData.thanh_pho) || null}
        onChange={(event, newValue) => {
          setFormData(prev => ({
            ...prev,
            thanh_pho: newValue?.code || '',
            xa: ''
          }));
          setWards(newValue?.wards || []);
        }}
        renderInput={(params) => <TextField {...params} label="Tỉnh / Thành phố" />}
      />

      <Autocomplete
        options={wards}
        getOptionLabel={(option) => option.name}
        value={wards.find(w => w.code === formData.xa) || null}
        onChange={(event, newValue) => {
          setFormData(prev => ({
            ...prev,
            xa: newValue?.code || ''
          }));
        }}
        renderInput={(params) => <TextField {...params} label="Xã / Phường" />}
      />

      <Divider sx={{ my: 2 }} />

      <Button variant="contained" startIcon={<AddCircleOutline />} onClick={handleSubmit}>
        {editBranch ? 'Lưu thay đổi' : 'Tạo chi nhánh'}
      </Button>
    </Stack>
  );
}
