import { useState } from "react";
import { Box, Backdrop } from "@mui/material";
import Header from "../components/User/Home/Header";
import DangNhapOffcanvas from "../components/User/Home/DangNhapOffcanvas";

export default function UserLayout({ children }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 700,
            bgcolor: "white",
            borderBottom: "1px solid #ddd",
          }}
        >
          <Header onOpenAuth={() => setIsAuthOpen(true)} />
        </Box>

        {/* Main */}
        <Box component="main" sx={{ flex: 1 }}>
          {children}
        </Box>
      </Box>

      {/* GLOBAL BACKDROP */}
      <Backdrop
        open={isAuthOpen}
        onClick={() => setIsAuthOpen(false)}
        sx={{ zIndex: 1040 }}
      />

      {/* LOGIN MODAL */}
      <DangNhapOffcanvas
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}
