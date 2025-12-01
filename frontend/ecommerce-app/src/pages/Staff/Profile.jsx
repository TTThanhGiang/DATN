import React from "react";
import { Box, Grid, Paper, Typography, TextField, Button, Avatar, Stack } from "@mui/material";
import PageWrapper from "../../components/PageWrapper";

export default function Profile() {
  return (
    <PageWrapper title="Thông tin nhân viên">
      <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
        {/* Cột trái */}
        <Grid size = {3}>
          <Paper sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
            <Avatar
              src="https://i.pravatar.cc/150?img=12"
              sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
            />
            <Typography variant="h6">Nguyễn Văn A</Typography>
            <Typography variant="body2" color="text.secondary">
              Nhân viên bán hàng
            </Typography>
          </Paper>
        </Grid>

        {/* Cột phải */}
        <Grid size = {9}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" mb={2}>Thông tin cá nhân</Typography>
            <Stack spacing={2}>
              <TextField label="Họ và tên" defaultValue="Nguyễn Văn A" fullWidth />
              <TextField label="Email" defaultValue="a.nguyen@example.com" fullWidth />
              <TextField label="Số điện thoại" defaultValue="0901234567" fullWidth />
              <TextField label="Địa chỉ" defaultValue="TP. Hồ Chí Minh" fullWidth />
              <Button variant="contained" sx={{ mt: 1 }}>
                Cập nhật thông tin
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </PageWrapper>
  );
}
