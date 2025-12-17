import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, TextField, Button, Avatar, Stack } from "@mui/material";
import PageWrapper from "../../components/PageWrapper";
import api from "../../api";
import { getToken } from "../../utils/auth";
import HopThoaiDoiMatKhau from "../../components/Staff/HopThoaiDoiMatKhau";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [moHopThoaiMatKhau, setMoHopThoaiMatKhau] = useState(false);

  const [previewAvatar, setPreviewAvatar] = useState(null);
  const token = getToken();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/staff/thong-tin-ca-nhan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data.data.ngay_sinh)
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.log("Lấy thông tin thất bại", err);
    }
  };

  const handleCapNhatProfile = async ()=>{
    try{
      const payload = {
        ho_ten: profile.ho_ten,
        email: profile.email,
        dia_chi: profile.dia_chi,
        ngay_sinh: new Date(profile.ngay_sinh).toISOString(),
        gioi_tinh: profile.gioi_tinh,
      };
      const res = await api.put(`/staff/cap-nhat-thong-tin`, payload, {
        headers: {Authorization: `Bearer ${token}`}
      })
      if(res.data.success){
        alert(res.data.message);
        fetchProfile();
      } else{
        alert(res.data.message);
      }
    }catch(err){  
      console.log("Lỗi khi cập nhật thông tin", err);
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("hinh_anh", file);
    try{
      const res = await api.put(`/staff/cap-nhat-anh`, formData, {
        headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
        },
      })
      if (res.data.success) {
        alert(res.data.message);
        // Cập nhật preview avatar
        setPreviewAvatar(res.data.data.duong_dan);
      } else {
        alert(res.data.message || "Cập nhật ảnh thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật ảnh:", err.response?.data || err);
      alert("Cập nhật ảnh thất bại");
    }
  };

  const xuLyDoiMatKhau = async ({ matKhauCu, matKhauMoi }) => {
    try {
      const payload = {
        mat_khau_cu: matKhauCu,
        mat_khau_moi: matKhauMoi,
      };

      const res = await api.put(`/staff/thay-doi-mat-khau`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        alert(res.data.message); // thông báo thành công
        setMoHopThoaiMatKhau(false);
        
      } else {
        alert(res.data?.message || "Đổi mật khẩu thất bại");
      }

    } catch (err) {
      // Lấy lỗi từ backend (thường là 400 hoặc 422)
      const loi = err.response?.data?.detail || "Có lỗi xảy ra";
      alert(loi);
    }
  };


  
  if (!profile) return <PageWrapper title="Thông tin nhân viên">Đang tải...</PageWrapper>;

  return (
    <PageWrapper title="Thông tin nhân viên">
      <Grid container spacing={3} sx={{ width: "100%", m: 0 }}>
        
        {/* Cột trái */}
        <Grid size={3}>
          <Paper sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
              {/* Input file hidden */}
              <input
                type="file"
                accept="image/*"
                id="avatar-upload"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />

              {/* Avatar + click để upload */}
              <label htmlFor="avatar-upload">
                <Avatar
                  src={previewAvatar || profile.hinh_anhs?.[0]?.duong_dan || "https://i.pravatar.cc/150?img=12"}
                  sx={{
                    width: 130,
                    height: 130,
                    mx: "auto",
                    mb: 2,
                    cursor: "pointer",
                    border: "3px solid #1976d2",
                    transition: "0.2s",
                    "&:hover": { opacity: 0.8 }
                  }}
                />
              </label>

              <Typography variant="h6">{profile.ho_ten}</Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.vai_tro}
              </Typography>

              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                onClick={() => document.getElementById("avatar-upload").click()}
              >
                Đổi ảnh
              </Button>
          </Paper>

          <Box sx={{ p: 2, textAlign: "center" }}>
            <Button variant="contained" onClick={() => setMoHopThoaiMatKhau(true)}>Thay đổi mật khẩu</Button>
          </Box>
        </Grid>

        {/* Cột phải */}
        <Grid size={9}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" mb={2}>
              Thông tin cá nhân
            </Typography>

            <Stack spacing={2}>
              <TextField label="Họ và tên" name="ho_ten" value={profile.ho_ten || ""} onChange={handleChange}fullWidth />
              <TextField label="Email" name="email" value={profile.email || ""} onChange={handleChange} fullWidth />
              <TextField label="Số điện thoại" name="so_dien_thoai" value={profile.so_dien_thoai || ""} fullWidth disabled />
              <TextField label="Địa chỉ" name="dia_chi" value={profile.dia_chi || ""} onChange={handleChange} fullWidth />

              <TextField
                label="Ngày sinh"
                name="ngay_sinh"
                type="date"
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={profile.ngay_sinh}
              />

              <TextField
                label="Giới tính"
                name="gioi_tinh"
                select
                onChange={handleChange}
                fullWidth
                SelectProps={{ native: true }}
                value={profile.gioi_tinh || "KHAC"}
              >
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
                <option value="KHAC">Khác</option>
              </TextField>

              <TextField label="Vai trò" value={profile.vai_tro} disabled fullWidth />

              <Button variant="contained" onClick={handleCapNhatProfile}>Cập nhật thông tin</Button>
            </Stack>
          </Paper>
        </Grid>

      </Grid>

      <HopThoaiDoiMatKhau
        mo={moHopThoaiMatKhau}
        dong={() => setMoHopThoaiMatKhau(false)}
        xuLyDoiMatKhau={xuLyDoiMatKhau}
      />
    </PageWrapper>
  );
}
