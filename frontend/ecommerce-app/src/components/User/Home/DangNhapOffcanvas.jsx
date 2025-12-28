import { useState } from "react";
import api from "../../../api";
import {
  Button,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function DangNhapOffcanvas({ mo, dong }) {
  // State
  const [hienMatKhauDangNhap, setHienMatKhauDangNhap] = useState(false);
  const [hienMatKhauDangKy, setHienMatKhauDangKy] = useState(false);
  const [tab, setTab] = useState(0); // 0 = Đăng nhập, 1 = Đăng ký
  const [soDienThoai, setSoDienThoai] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loi, setLoi] = useState({});
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState("");

  const dieuHuong = useNavigate();

  if (!mo) return null;

  const doiHienMatKhau = (kieu) => {
    if (kieu === "dang-nhap") setHienMatKhauDangNhap((prev) => !prev);
    else setHienMatKhauDangKy((prev) => !prev);
  };
  const chanMouseDown = (event) => event.preventDefault();

  // ---------------- ĐĂNG NHẬP ----------------
  const xuLyDangNhap = async (e) => {
    e.preventDefault();
    setLoi({});
    setThongBaoThanhCong("");

    try {
      const duLieu = new URLSearchParams();
      duLieu.append("username", soDienThoai);
      duLieu.append("password", matKhau);

      const res = await api.post("/auth/dang-nhap", duLieu, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token, vai_tro, ma_nguoi_dung } = res.data;
      const thongTinNguoiDung = { token: access_token, vai_tro, ma_nguoi_dung };
      localStorage.setItem("user", JSON.stringify(thongTinNguoiDung));
      window.dispatchEvent(new Event("user-login"));

      // Điều hướng theo vai trò
      switch (vai_tro) {
        case "QUAN_TRI_VIEN":
          dieuHuong("/admin/dashboard");
          break;
        case "QUAN_LY":
          dieuHuong("/manager/dashboard");
          break;
        case "NHAN_VIEN":
          dieuHuong("/staff/dashboard");
          break;
        default:
          dieuHuong("/");
      }

      setSoDienThoai("");
      setMatKhau("");
      setTimeout(() => dong(), 200);
    } catch (err) {
      if (err.response?.status === 422) {
        const loiXacThuc = {};
        err.response.data.detail.forEach((e) => {
          const field = e.loc[e.loc.length - 1];
          loiXacThuc[field === "so_dien_thoai" ? "soDienThoai" : field] = e.msg;
        });
        setLoi(loiXacThuc);
      } else if (err.response?.status === 400 && err.response?.data?.detail === "Chưa xác thực email") {
        setLoi({ soDienThoai: "Vui lòng xác thực email trước khi đăng nhập" });
      } else {
        setLoi({ matKhau: err.response?.data?.detail || "Sai số điện thoại hoặc mật khẩu" });
      }
    }
  };

  // ---------------- ĐĂNG KÝ ----------------
  const xuLyDangKy = async (e) => {
    e.preventDefault();
    setLoi({});
    setThongBaoThanhCong("");

    const form = e.target;
    const duLieu = {
      ho_ten: form.fullname.value.trim(),
      email: form.email.value.trim(),
      so_dien_thoai: form.username.value.trim(),
      mat_khau: form.password.value.trim(),
      nhap_lai_mat_khau: form.password2.value.trim(),
    };

    // Kiểm tra mật khẩu nhập lại
    if (duLieu.mat_khau !== duLieu.nhap_lai_mat_khau) {
      setLoi({ password2: "Mật khẩu nhập lại không khớp" });
      return;
    }

    try {
      await api.post("/auth/dang-ky", duLieu, {
        headers: { "Content-Type": "application/json" },
      });

      setThongBaoThanhCong("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");

      // Reset form
      form.fullname.value = "";
      form.email.value = "";
      form.username.value = "";
      form.password.value = "";
      form.password2.value = "";

      setTab(0); // chuyển về tab đăng nhập
    } catch (err) {
      if (err.response?.status === 422) {
        const loiXacThuc = {};
        err.response.data.detail.forEach((e) => {
          const field = e.loc[e.loc.length - 1];
          let msg = e.msg;

          if (field === "email") msg = "Email không hợp lệ";
          else if (field === "so_dien_thoai") msg = "Số điện thoại không đúng định dạng";
          else if (field === "mat_khau")
            msg = "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.";

          switch (field) {
            case "ho_ten":
              loiXacThuc.fullname = msg;
              break;
            case "email":
              loiXacThuc.email = msg;
              break;
            case "so_dien_thoai":
              loiXacThuc.username = msg;
              break;
            case "mat_khau":
              loiXacThuc.password = msg;
              break;
            default:
              loiXacThuc[field] = msg;
          }
        });
        setLoi(loiXacThuc);
      } else {
        alert(err.response?.data?.detail || "Đăng ký thất bại.");
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dong}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          zIndex: 1040,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1050,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          overflowY: "auto",
          padding: "40px 16px",
        }}
      >
        <div
          style={{
            width: "450px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            padding: "24px",
            margin: "auto",
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0 text-primary">Chào mừng bạn!</h4>
            <button type="button" className="btn-close" onClick={dong}></button>
          </div>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(e, newValue) => {
              setTab(newValue);
              setLoi({});
              setThongBaoThanhCong("");
            }}
            variant="fullWidth"
          >
            <Tab label="Đăng nhập" />
            <Tab label="Đăng ký" />
          </Tabs>

          {/* Success message */}
          {thongBaoThanhCong && (
            <Typography color="success.main" sx={{ mt: 1, mb: 1 }}>
              {thongBaoThanhCong}
            </Typography>
          )}

          {/* --- FORM ĐĂNG NHẬP --- */}
          {tab === 0 && (
            <form noValidate style={{ marginTop: "20px" }} onSubmit={xuLyDangNhap}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="login-phone">Số điện thoại</InputLabel>
                    <OutlinedInput
                      id="login-phone"
                      type="text"
                      value={soDienThoai}
                      onChange={(e) => setSoDienThoai(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      fullWidth
                    />
                    {loi.soDienThoai && (
                      <Typography color="error" variant="caption">
                        {loi.soDienThoai}
                      </Typography>
                    )}
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="login-password">Mật khẩu</InputLabel>
                    <OutlinedInput
                      fullWidth
                      id="login-password"
                      type={hienMatKhauDangNhap ? "text" : "password"}
                      value={matKhau}
                      onChange={(e) => setMatKhau(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => doiHienMatKhau("dang-nhap")}
                            onMouseDown={chanMouseDown}
                            edge="end"
                          >
                            {hienMatKhauDangNhap ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {loi.matKhau && (
                      <Typography color="error" variant="caption">
                        {loi.matKhau}
                      </Typography>
                    )}
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Button fullWidth size="large" type="submit" variant="contained" color="primary">
                    Đăng nhập
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}

          {/* --- FORM ĐĂNG KÝ --- */}
          {tab === 1 && (
            <form noValidate style={{ marginTop: "20px" }} onSubmit={xuLyDangKy}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="fullname">Họ và tên</InputLabel>
                    <OutlinedInput id="fullname" type="text" name="fullname" placeholder="Họ và tên" fullWidth />
                    {loi.fullname && <Typography color="error">{loi.fullname}</Typography>}
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="email">Email</InputLabel>
                    <OutlinedInput id="email" type="email" name="email" placeholder="Nhập Email" fullWidth />
                    {loi.email && <Typography color="error">{loi.email}</Typography>}
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="reg-phone">Số điện thoại</InputLabel>
                    <OutlinedInput id="reg-phone" type="text" name="username" placeholder="Nhập số điện thoại" fullWidth />
                    {loi.username && <Typography color="error">{loi.username}</Typography>}
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="reg-password">Mật khẩu</InputLabel>
                    <OutlinedInput
                      id="reg-password"
                      type={hienMatKhauDangKy ? "text" : "password"}
                      name="password"
                      placeholder="Tạo mật khẩu"
                      fullWidth
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => doiHienMatKhau("dang-ky")}
                            onMouseDown={chanMouseDown}
                            edge="end"
                          >
                            {hienMatKhauDangKy ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {loi.password && <Typography color="error">{loi.password}</Typography>}
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="reg-password2">Nhập lại mật khẩu</InputLabel>
                    <OutlinedInput
                      id="reg-password2"
                      type={hienMatKhauDangKy ? "text" : "password"}
                      name="password2"
                      placeholder="Nhập lại mật khẩu"
                      fullWidth
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => doiHienMatKhau("dang-ky")}
                            onMouseDown={chanMouseDown}
                            edge="end"
                          >
                            {hienMatKhauDangKy ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {loi.password2 && <Typography color="error">{loi.password2}</Typography>}
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Button fullWidth size="large" type="submit" variant="contained" color="success">
                    Đăng ký
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default DangNhapOffcanvas;
