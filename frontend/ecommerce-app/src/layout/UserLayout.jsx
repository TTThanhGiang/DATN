import { Box } from "@mui/material";
import Header from "../components/User/Home/Header";


export default function UserLayout({ children }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header chỉ dành cho User */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1200,
          bgcolor: "white",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Header />
      </Box>

      {/* Nội dung chính */}
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

    </Box>
  );
}