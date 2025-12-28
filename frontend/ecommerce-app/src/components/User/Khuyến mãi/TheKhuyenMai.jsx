import { Box, Typography, CardMedia, Divider } from "@mui/material";
import NutLayMa from "./NutLayMa";
import { useNavigate } from "react-router-dom";

export default function TheKhuyenMai({ data }) {

  const navigate = useNavigate();

  const handleXemChiTiet = () => {
    navigate(`/khuyen-mai/${data.ma_khuyen_mai}`);
  };

  const giamGia = data.phan_tram_giam || "SALE"; 

  return (
    <Box
      onClick={handleXemChiTiet}
      sx={{
        display: "flex",
        height: 100,
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#fff",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        border: "1px solid #ffcccc", // Viền hồng nhạt tạo điểm nhấn
        position: "relative",
        transition: "all 0.2s ease-in-out",
        "&:hover": { 
          transform: "scale(1.02)",
          borderColor: "#ff4d4f" 
        },
      }}
    >
      {/* Phần trái: Hiển thị % Giảm giá */}
      <Box
        sx={{
          width: "35%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FF4D4F", // Nền đỏ bắt mắt
          color: "#fff",
          position: "relative",
          px: 1,
        }}
      >
        <Typography sx={{ fontSize: "12px", fontWeight: 600, opacity: 0.9, lineHeight: 1 }}>
          GIẢM
        </Typography>
        <Typography sx={{ fontSize: "28px", fontWeight: 900, lineHeight: 1 }}>
          {giamGia}{typeof giamGia === 'number' ? '%' : ''}
        </Typography>
        
        {/* Đường răng cưa trang trí giữa 2 phần */}
        <Box sx={{
          position: "absolute",
          right: -5,
          top: 0,
          bottom: 0,
          width: 10,
          backgroundImage: `radial-gradient(circle at 10px 10px, #fff 5px, transparent 5px)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 -10px",
          zIndex: 1
        }} />
      </Box>

      {/* Phần phải: Nội dung chi tiết */}
      <Box sx={{ flex: 1, p: 1.5, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0, ml: 0.5 }}>
        <Box>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#333",
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textTransform: "uppercase"
            }}
          >
            {data.ten_khuyen_mai}
          </Typography>
          
          <Typography
            sx={{
              fontSize: "11px",
              color: "#666",
              mt: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {data.mo_ta}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Box>
             <Typography sx={{ fontSize: "9px", color: "#999", textTransform: "uppercase" }}>
                Hạn sử dụng
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#d32f2f", fontWeight: 600 }}>
                {data.ngay_ket_thuc}
              </Typography>
          </Box>
          <NutLayMa maCode={data.ma_code} />
        </Box>
      </Box>
    </Box>
  );
}