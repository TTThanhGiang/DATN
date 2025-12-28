import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Button, Avatar, Stack } from "@mui/material";
import { Grid } from "@mui/material";
import HopThoaiDoiMatKhau from "../../../components/Staff/HopThoaiDoiMatKhau";
import { getToken } from "../../../utils/auth";
import api from "../../../api";

export default function ThongTinCaNhan() {

  const [moHopThoaiMatKhau, setMoHopThoaiMatKhau] = useState(false);
  const token = getToken();

  const [thongTin, setThongTin] = useState(null);
  const [anhXemTruoc, setAnhXemTruoc] = useState(null);

  const xuLyThayDoi = (e) => {
    const { name, value } = e.target;
    setThongTin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    taiThongTinCaNhan();
  }, []);

  const taiThongTinCaNhan = async () => {
    try {
      const res = await api.get(`/users/thong-tin-ca-nhan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data.data.ngay_sinh)
      if (res.data.success) {
        setThongTin(res.data.data);
      }
    } catch (err) {
      console.log("Lấy thông tin thất bại", err);
    }
  };

  const xuLyCapNhatThongTin = async ()=>{
    try{
      const payload = {
        ho_ten: thongTin.ho_ten,
        email: thongTin.email,
        dia_chi: thongTin.dia_chi,
        ngay_sinh: new Date(thongTin.ngay_sinh).toISOString(),
        gioi_tinh: thongTin.gioi_tinh,
      };
      const res = await api.put(`/users/cap-nhat-thong-tin`, payload, {
        headers: {Authorization: `Bearer ${token}`}
      })
      if(res.data.success){
        alert(res.data.message);
        taiThongTinCaNhan();
      } else{
        alert(res.data.message);
      }
    }catch(err){  
      console.log("Lỗi khi cập nhật thông tin", err);
    }
  }

  const xuLyThayDoiAnh = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("hinh_anh", file);
    try{
      const res = await api.put(`/users/cap-nhat-anh`, formData, {
        headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
        },
      })
      if (res.data.success) {
        alert(res.data.message);
        // Cập nhật preview avatar
        setAnhXemTruoc(res.data.data.duong_dan);
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

      const res = await api.put(`/users/thay-doi-mat-khau`, payload, {
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


  
  if (!thongTin) return <div>Đang tải...</div>;

  return (
  <Box sx={{ width: "100%", pb: 4 }}>
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        borderRadius: 2,
        p: { xs: 2, md: 3 },
      }}
    >
      <Typography variant="h6" fontWeight={600} mb={3}>
        Thông tin cá nhân
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3, 
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: "280px" },
            flexShrink: 0,
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: "center",
              height: "100%",
              borderColor: "divider",
              bgcolor: "#fafafa",
            }}
          >
            <input
              type="file"
              hidden
              id="avatar-upload"
              accept="image/*"
              onChange={xuLyThayDoiAnh}
            />

            <label htmlFor="avatar-upload">
              <Avatar
                src={
                  anhXemTruoc ||
                  thongTin.hinh_anhs?.[0]?.duong_dan ||
                  "https://i.pravatar.cc/150"
                }
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                  cursor: "pointer",
                  border: "3px solid #1976d2",
                }}
              />
            </label>

            <Typography fontWeight={600} mb={2}>
              {thongTin.ho_ten}
            </Typography>

            <Stack spacing={1.5}>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                onClick={() => document.getElementById("avatar-upload").click()}
              >
                Đổi ảnh
              </Button>
              <Button
                variant="contained"
                fullWidth
                size="small"
                onClick={() => setMoHopThoaiMatKhau(true)}
              >
                Đổi mật khẩu
              </Button>
            </Stack>
          </Paper>
        </Box>

        {/* ===== KHỐI 2: THÔNG TIN CHI TIẾT (Chiếm phần còn lại) ===== */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 3 },
              height: "100%",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} mb={3}>
              Chi tiết tài khoản
            </Typography>

            <Stack spacing={2.5}>
              {/* Dùng Box Flex để chia 2 cột nhỏ cho các input trên Desktop */}
              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <TextField
                  label="Họ và tên"
                  name="ho_ten"
                  value={thongTin.ho_ten || ""}
                  onChange={xuLyThayDoi}
                  fullWidth
                />
                <TextField
                  label="Email"
                  name="email"
                  value={thongTin.email || ""}
                  onChange={xuLyThayDoi}
                  fullWidth
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <TextField
                  label="Số điện thoại"
                  value={thongTin.so_dien_thoai || ""}
                  disabled
                  fullWidth
                />
                <TextField
                  label="Ngày sinh"
                  type="date"
                  name="ngay_sinh"
                  InputLabelProps={{ shrink: true }}
                  value={thongTin.ngay_sinh ? thongTin.ngay_sinh.split("T")[0] : ""}
                  onChange={xuLyThayDoi}
                  fullWidth
                />
              </Box>

              <TextField
                label="Địa chỉ"
                name="dia_chi"
                value={thongTin.dia_chi || ""}
                onChange={xuLyThayDoi}
                fullWidth
              />

              <TextField
                select
                label="Giới tính"
                name="gioi_tinh"
                value={thongTin.gioi_tinh || "KHAC"}
                onChange={xuLyThayDoi}
                sx={{ maxWidth: { md: "50%" } }}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
                <option value="KHAC">Khác</option>
              </TextField>

              <Box sx={{ textAlign: { xs: "center", md: "right" }, mt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={xuLyCapNhatThongTin}
                  sx={{ minWidth: 200, width: { xs: "100%", md: "auto" } }}
                >
                  Cập nhật thông tin
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Box>

      <HopThoaiDoiMatKhau
        mo={moHopThoaiMatKhau}
        dong={() => setMoHopThoaiMatKhau(false)}
        xuLyDoiMatKhau={xuLyDoiMatKhau}
      />
    </Paper>
  </Box>
);
}
