import { useState, useMemo } from "react";
import {
  Grid,
  Box,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import AnalyticEcommerce from "../../components/AnalyticEcommerce"
import PageWrapper from "../../components/PageWrapper";
import UniqueVisitorCard from "../../components/UniqueVisitorCard";
import MonthlyBarChart from "../../components/MonthlyBarChart";
import MainCard from "../../components/MainCard";

import { getUser, getRole } from "../../utils/auth";

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};
export default function Dashboard() {
  const user = getUser();
  const role = getRole();
  const branch = user?.branch;

  const branches = [
    "Tất cả chi nhánh",
    "Chi nhánh Hà Nội",
    "Chi nhánh Đà Nẵng",
    "Chi nhánh TP.HCM",
  ];
  const [selectedBranch, setSelectedBranch] = useState(branch || "Tất cả chi nhánh");

  const handleBranchChange  = (e) =>{
    setSelectedBranch(e.target.value);
  }
  const allBranchStats = [
    { branch: "Chi nhánh Hà Nội", revenue: 12430, orders: 248, customers: 1024 },
    { branch: "Chi nhánh Đà Nẵng", revenue: 8300, orders: 180, customers: 720 },
    { branch: "Chi nhánh TP.HCM", revenue: 15400, orders: 310, customers: 1420 },
  ];

  const visibleStats = useMemo(() => {
    if(role === "QUAN_TRI_VIEN"){
      if(selectedBranch === "Tất cả chi nhánh") return allBranchStats;
      return allBranchStats.filter((b) => b.branch === selectedBranch);
      }
    return allBranchStats.filter((b) => b.branch === branch);
  },[role, branch, selectedBranch]);

  const summary = useMemo(() => {
    const totalRevenue = visibleStats.reduce((sum, b) => sum + b.revenue, 0);
    const totalOrders = visibleStats.reduce((sum, b) => sum + b.orders, 0);
    const totalCustomers = visibleStats.reduce((sum, b) => sum + b.customers, 0);
    return { totalRevenue, totalOrders, totalCustomers };
  }, [visibleStats]);


  return (
	  <PageWrapper title="Tổng quan">
      {role === "QUAN_TRI_VIEN" ? (
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="branch-select-label">Chọn chi nhánh</InputLabel>
            <Select
              labelId="branch-select-label"
              value={selectedBranch}
              label="Chọn chi nhánh"
              onChange={handleBranchChange}
            >
              {branches.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      ) : (
        <Typography variant="h6" sx={{ mb: 3 }}>
          Chi nhánh: <b>{branch}</b>
          {console.log(branch)}
        </Typography>
      )}

      {/* Nội dung dashboard */}
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        {/* --- Dòng 1: Thống kê chính --- */}
        <Grid xs={12} sm={6} md={4} lg={3}>
          <AnalyticEcommerce
            title="Doanh thu"
            count={`$${summary.totalRevenue.toLocaleString()}`}
            percentage={59.3}
            extra="So với tháng trước"
          />
        </Grid>
        
        <Grid xs={12} sm={6} md={4} lg={3}>
          <AnalyticEcommerce
            title="Đơn hàng"
            count={summary.totalOrders.toLocaleString()}
            percentage={70.5}
            extra="So với tháng trước"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={3}>
          <AnalyticEcommerce
            title="Khách hàng"
            count={summary.totalCustomers.toLocaleString()}
            percentage={45.1}
            extra="So với tháng trước"
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={3}>
          <AnalyticEcommerce
            title="Khách hàng"
            count={summary.totalCustomers.toLocaleString()}
            percentage={45.1}
            extra="So với tháng trước"
          />
        </Grid>
        {/* --- Dòng 2: Biểu đồ --- */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <UniqueVisitorCard />
        </Grid>
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: 1,
            }}
          >
            <Typography variant="h5" sx={{ mb: 2 }}>
              Biểu đồ doanh thu ({selectedBranch})
            </Typography>
            <MonthlyBarChart />
          </Box>
        </Grid>
      </Grid>
    </PageWrapper>
  );
}
