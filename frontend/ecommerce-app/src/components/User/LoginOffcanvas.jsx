import { useState } from "react";
import api from "../../api";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
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

function LoginOffcanvas({ isOpen, onClose }) {
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({}); // lưu lỗi từng field
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClickShowPassword = (type) => {
    if (type === "login") setShowLoginPassword((prev) => !prev);
    else setShowRegPassword((prev) => !prev);
  };
  const handleMouseDownPassword = (event) => event.preventDefault();

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", phone);
      formData.append("password", password);

      const response = await api.post("/auth/dang-nhap", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const { access_token, vai_tro, ma_nguoi_dung } = response.data;
      const userData = { token: access_token, vai_tro, ma_nguoi_dung };
      localStorage.setItem("user", JSON.stringify(userData));

      // Điều hướng dựa trên vai trò
      switch (vai_tro) {
        case "QUAN_TRI_VIEN":
          navigate("/admin/dashboard");
          break;
        case "QUAN_LY":
          navigate("/manager/dashboard");
          break;
        case "NHAN_VIEN":
          navigate("/staff/dashboard");
          break;
        default:
          navigate("/");
      }
      setPhone("");
      setPassword("");
      setTimeout(() => onClose(), 200);
    } catch (err) {
      if (err.response?.status === 422) {
        const validationErrors = {};
        err.response.data.detail.forEach((e) => {
          const field = e.loc[e.loc.length - 1];
          validationErrors[field === "so_dien_thoai" ? "phone" : field] = e.msg;
        });
        setErrors(validationErrors);
      } else if (err.response?.status === 400 && err.response?.data?.detail === "Chưa xác thực email") {
        setErrors({ phone: "Vui lòng xác thực email trước khi đăng nhập" });
      } else {
        setErrors({ password: err.response?.data?.detail || "Sai số điện thoại hoặc mật khẩu" });
      }
    }
  };

  // ---------------- REGISTER ----------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");

    const form = e.target;
    const payload = {
      ho_ten: form.fullname.value.trim(),
      email: form.email.value.trim(),
      so_dien_thoai: form.username.value.trim(),
      mat_khau: form.password.value.trim(),
      nhap_lai_mat_khau: form.password2.value.trim(),
    };

    // Frontend check mật khẩu nhập lại
    if (payload.mat_khau !== payload.nhap_lai_mat_khau) {
      setErrors({ password2: "Mật khẩu nhập lại không khớp" });
      return;
    }

    try {
      await api.post("/auth/dang-ky", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setSuccessMsg("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
      // Reset form
      form.fullname.value = "";
      form.email.value = "";
      form.username.value = "";
      form.password.value = "";
      form.password2.value = "";

      setTab(0); // chuyển về tab login
    } catch (err) {
      if (err.response?.status === 422) {
        const validationErrors = {};
        err.response.data.detail.forEach((e) => {
          const field = e.loc[e.loc.length - 1];
          let msg = e.msg;

          if (field === "email") msg = "Email không hợp lệ";
          else if (field === "so_dien_thoai") msg = "Số điện thoại không đúng định dạng";
          else if (field === "mat_khau")
            msg = "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.";

          switch (field) {
            case "ho_ten":
              validationErrors.fullname = msg;
              break;
            case "email":
              validationErrors.email = msg;
              break;
            case "so_dien_thoai":
              validationErrors.username = msg;
              break;
            case "mat_khau":
              validationErrors.password = msg;
              break;
            default:
              validationErrors[field] = msg;
          }
        });
        setErrors(validationErrors);
      } else {
        alert(err.response?.data?.detail || "Đăng ký thất bại.");
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
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
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(e, newValue) => {
              setTab(newValue);
              setErrors({});
              setSuccessMsg("");
            }}
            variant="fullWidth"
          >
            <Tab label="Đăng nhập" />
            <Tab label="Đăng ký" />
          </Tabs>

          {/* Success message */}
          {successMsg && (
            <Typography color="success.main" sx={{ mt: 1, mb: 1 }}>
              {successMsg}
            </Typography>
          )}

          {/* --- LOGIN FORM --- */}
          {tab === 0 && (
            <form noValidate style={{ marginTop: "20px" }} onSubmit={handleLogin}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="login-phone">Số điện thoại</InputLabel>
                    <OutlinedInput
                      id="login-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      fullWidth
                    />
                    {errors.phone && (
                      <Typography color="error" variant="caption">
                        {errors.phone}
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
                      type={showLoginPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleClickShowPassword("login")}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {errors.password && (
                      <Typography color="error" variant="caption">
                        {errors.password}
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

          {/* --- REGISTER FORM --- */}
          {tab === 1 && (
            <form noValidate style={{ marginTop: "20px" }} onSubmit={handleRegister}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="fullname">Họ và tên</InputLabel>
                    <OutlinedInput id="fullname" type="text" name="fullname" placeholder="Họ và tên" fullWidth />
                    {errors.fullname && <Typography color="error">{errors.fullname}</Typography>}
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="email">Email</InputLabel>
                    <OutlinedInput id="email" type="email" name="email" placeholder="Nhập Email" fullWidth />
                    {errors.email && <Typography color="error">{errors.email}</Typography>}
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="reg-phone">Số điện thoại</InputLabel>
                    <OutlinedInput id="reg-phone" type="text" name="username" placeholder="Nhập số điện thoại" fullWidth />
                    {errors.username && <Typography color="error">{errors.username}</Typography>}
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="reg-password">Mật khẩu</InputLabel>
                    <OutlinedInput
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      name="password"
                      placeholder="Tạo mật khẩu"
                      fullWidth
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleClickShowPassword("register")}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showRegPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {errors.password && <Typography color="error">{errors.password}</Typography>}
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="reg-password2">Nhập lại mật khẩu</InputLabel>
                    <OutlinedInput
                      id="reg-password2"
                      type={showRegPassword ? "text" : "password"}
                      name="password2"
                      placeholder="Nhập lại mật khẩu"
                      fullWidth
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleClickShowPassword("register")}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showRegPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {errors.password2 && <Typography color="error">{errors.password2}</Typography>}
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

export default LoginOffcanvas;
