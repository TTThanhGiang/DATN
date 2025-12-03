import React, { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, TextField, Button, Avatar, Stack } from "@mui/material";
import PageWrapper from "../../components/PageWrapper";
import api from "../../api";
import { getToken } from "../../utils/auth";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const token = getToken();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/staff/thong-tin-ca-nhan`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.log("Lấy thông tin thất bại", err);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Tạo preview ngay
    setPreviewAvatar(URL.createObjectURL(file));

    // TODO: gọi API upload avatar
    uploadAvatar(file);
  };
  // Nếu chưa có dữ liệu thì không render form
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
                  src={previewAvatar || profile.hinh_anh || "https://i.pravatar.cc/150?img=12"}
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
            <Button variant="contained">Thay đổi mật khẩu</Button>
          </Box>
        </Grid>

        {/* Cột phải */}
        <Grid size={9}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" mb={2}>
              Thông tin cá nhân
            </Typography>

            <Stack spacing={2}>
              <TextField label="Họ và tên" value={profile.ho_ten || ""} fullWidth />
              <TextField label="Email" value={profile.email || ""} fullWidth />
              <TextField label="Số điện thoại" value={profile.so_dien_thoai || ""} fullWidth />
              <TextField label="Địa chỉ" value={profile.dia_chi || ""} fullWidth />

              <TextField
                label="Ngày sinh"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={profile.ngay_sinh || ""}
              />

              <TextField
                label="Giới tính"
                name="gioi_tinh"
                select
                fullWidth
                SelectProps={{ native: true }}
                value={profile.gioi_tinh || "KHAC"}
              >
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
                <option value="KHAC">Khác</option>
              </TextField>

              <TextField label="Vai trò" value={profile.vai_tro} disabled fullWidth />

              <Button variant="contained">Cập nhật thông tin</Button>
            </Stack>
          </Paper>
        </Grid>

      </Grid>
    </PageWrapper>
  );
}
