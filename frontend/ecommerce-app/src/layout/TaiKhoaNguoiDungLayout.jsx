import { Outlet } from "react-router-dom";
import {
  Box,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useState, useEffect } from "react";
import TaiKhoanSideBar from "../components/User/Account/TaiKhoanSideBar";

export default function TaiKhoanNguoiDungLayOut() {
  const HEADER_HEIGHT = 105;
  const SIDEBAR_WIDTH = 260;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box sx={{ minHeight: "100vh", width: "100%" }}>
      
      {/* ===== SIDEBAR (FIXED DESKTOP) ===== */}
      {!isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: HEADER_HEIGHT,
            left: 0,
            width: SIDEBAR_WIDTH,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            bgcolor: "#fff",
            borderRight: "1px solid #e0e0e0",
            zIndex: 10,
            overflowY: "auto",
          }}
        >
          <TaiKhoanSideBar />
        </Box>
      )}

      {/* ===== SIDEBAR MOBILE ===== */}
      {isMobile && sidebarOpen && (
        <>
          <Box
            onClick={() => setSidebarOpen(false)}
            sx={{
              position: "fixed",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.4)",
              zIndex: 1200,
            }}
          />
          <Box
            sx={{
              position: "fixed",
              top: HEADER_HEIGHT,
              left: 0,
              width: SIDEBAR_WIDTH,
              height: "100vh",
              bgcolor: "#fff",
              zIndex: 1300,
            }}
          >
            <TaiKhoanSideBar onClose={() => setSidebarOpen(false)} />
          </Box>
        </>
      )}

      {/* ===== CONTENT WRAPPER ===== */}
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          pl: !isMobile ? `${SIDEBAR_WIDTH}px` : 0,
          pt: 2,
        }}
      >
        <Box sx={{ px: { xs: 1.5, sm: 2.5 } }}>
          <Outlet context={{ openSidebar: () => setSidebarOpen(true) }} />
        </Box>
      </Box>
    </Box>
  );
}
