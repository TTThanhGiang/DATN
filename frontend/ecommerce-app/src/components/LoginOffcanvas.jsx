import { useState } from 'react'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

// icons
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

function LoginOffcanvas({ isOpen, onClose }) {
  const [showPassword, setShowPassword] = useState(false)
  const [tab, setTab] = useState(0) // 0 = Login, 1 = Register

  if (!isOpen) return null

  const handleClickShowPassword = () => setShowPassword((prev) => !prev)
  const handleMouseDownPassword = (event) => event.preventDefault()

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1040
        }}
      />

      {/* Modal wrapper (scroll ở ngoài) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1050,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start', // bắt đầu từ trên, rồi margin auto căn giữa
          overflowY: 'auto', // scroll toàn trang
          padding: '40px 16px'
        }}
      >
        {/* Modal box */}
        <div
          style={{
            width: '450px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            padding: '24px',
            margin: 'auto' // căn giữa theo chiều dọc
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0 text-primary">Chào mừng bạn!</h4>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} variant="fullWidth">
            <Tab label="Đăng nhập" />
            <Tab label="Đăng ký" />
          </Tabs>

          {/* Login Form */}
          {tab === 0 && (
            <form noValidate style={{ marginTop: '20px' }}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="username-login">Số điện thoại</InputLabel>
                    <OutlinedInput id="username-login" type="text" name="username" placeholder="Nhập số điện thoại" fullWidth />
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="password-login">Mật khẩu</InputLabel>
                    <OutlinedInput
                      fullWidth
                      id="password-login"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <FormControlLabel
                      control={<Checkbox name="checked" color="primary" size="small" />}
                      label={<Typography variant="body2">Nhớ mật khẩu</Typography>}
                    />
                    <Link component="button" underline="hover">
                      Quên mật khẩu?
                    </Link>
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

          {/* Register Form */}
          {tab === 1 && (
            <form noValidate style={{ marginTop: '20px' }}>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="fullname">Họ và tên</InputLabel>
                    <OutlinedInput id="fullname" type="text" name="fullname" placeholder="Họ và tên" fullWidth />
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="email">Email</InputLabel>
                    <OutlinedInput id="email" type="email" name="email" placeholder="Nhập Email" fullWidth />
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="reg-username">Số điện thoại</InputLabel>
                    <OutlinedInput id="reg-username" type="text" name="username" placeholder="Nhập số điện thoại" fullWidth />
                  </Stack>
                </Grid>

                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="reg-password">Mật khẩu</InputLabel>
                    <OutlinedInput
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Tạo mật khẩu"
                      fullWidth
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Stack sx={{ gap: 1 }}>
                    <InputLabel htmlFor="reg-password">Nhập lại mật khẩu</InputLabel>
                    <OutlinedInput
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Nhập lại mật khẩu"
                      fullWidth
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
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
  )
}

export default LoginOffcanvas
