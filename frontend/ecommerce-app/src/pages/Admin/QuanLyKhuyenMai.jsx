import React, { useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import {
  Box,
  Tabs,
  Tab,
  Stack,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip
} from "@mui/material";
import { CheckCircleOutline, CancelOutlined, AddCircleOutline, EditOutlined } from "@mui/icons-material";

// sample data
const branches = [
  { id: 0, name: "Toàn quốc" },
  { id: 1, name: "Chi nhánh Hà Nội" },
  { id: 2, name: "Chi nhánh Hồ Chí Minh" },
  { id: 3, name: "Chi nhánh Đà Nẵng" },
];

const adminPromotions = [
  { id: 1, name: "Sale tết toàn quốc", code: "TET50", discount: 50, branchId: 0, start: "2025-01-10", end: "2025-01-25", status: "pending" },
  { id: 2, name: "Ưu đãi HCM", code: "HCM20", discount: 20, branchId: 2, start: "2025-02-01", end: "2025-02-10", status: "approved" },
];

export default function AdminPromotionManage() {
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(null);

  const handleTabChange = (_, value) => {
    setActiveTab(value);
    setEditing(null);
  }
  const handleEdit = (promo) => {
    setEditing(promo);
    setActiveTab(1);
  };

  const renderStatusChip = (status) => {
    const map = {
      pending: { label: "Chờ duyệt", color: "warning" },
      approved: { label: "Đã duyệt", color: "success" },
      rejected: { label: "Từ chối", color: "error" },
    };
    return <Chip label={map[status].label} color={map[status].color} size="small" />;
  };

  return (
    <PageWrapper title="Admin - Quản lý khuyến mãi">
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Danh sách khuyến mãi" />
          <Tab label={editing ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi"} />
        </Tabs>
      </Box>

      {/* Promotion list */}
      {activeTab === 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #eee" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Mã</TableCell>
                <TableCell>Giảm (%)</TableCell>
                <TableCell>Phạm vi</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Duyệt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adminPromotions.map((promo) => (
                <TableRow key={promo.id} hover>
                  <TableCell>{promo.id}</TableCell>
                  <TableCell>{promo.name}</TableCell>
                  <TableCell>{promo.code}</TableCell>
                  <TableCell>{promo.discount}%</TableCell>
                  <TableCell>{branches.find(b => b.id === promo.branchId)?.name}</TableCell>
                  <TableCell>{promo.start} → {promo.end}</TableCell>
                  <TableCell>{renderStatusChip(promo.status)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton color="success"><CheckCircleOutline /></IconButton>
                      <IconButton color="error"><CancelOutlined /></IconButton>
                      <IconButton onClick={() => handleEdit(promo)}><EditOutlined /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit form */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          <TextField label="Tên khuyến mãi" defaultValue={editing?.name || ""} />
          <TextField label="Mã khuyến mãi" defaultValue={editing?.code || ""} />
          <TextField label="Giảm (%)" type="number" defaultValue={editing?.discount || ""} />

          {/* Branch select */}
          <FormControl fullWidth>
            <InputLabel>Phạm vi áp dụng</InputLabel>
            <Select defaultValue={editing?.branchId ?? 0} label="Phạm vi áp dụng">
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="Ngày bắt đầu" type="date" defaultValue={editing?.start || ""} InputLabelProps={{ shrink: true }} />
          <TextField label="Ngày kết thúc" type="date" defaultValue={editing?.end || ""} InputLabelProps={{ shrink: true }} />

          <Divider />

          <Button variant="contained" startIcon={<AddCircleOutline />}>Lưu khuyến mãi</Button>
        </Stack>
      )}

    </PageWrapper>
  );
}
