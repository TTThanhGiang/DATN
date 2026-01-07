import React from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function KetQuaThanhToan() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const orderId = searchParams.get("orderId");
    const isSuccess = window.location.pathname.includes("thanh-cong");

    const config = {
        success: {
            icon: <CheckCircleOutlineIcon sx={{ fontSize: 100, color: '#4caf50', mb: 2 }} />,
            title: "Thanh Toán Thành Công!",
            color: "#4caf50",
            bg: "#f0fdf4",
            border: "#bbf7d0",
            textColor: "#166534",
            message: `Chúc mừng! Đơn hàng #${orderId} của bạn đã được thanh toán thành công và đang được chuẩn bị.`,
            subMessage: "Thông tin chi tiết đã được gửi về Email của bạn.",
            btnText: "Tiếp tục mua sắm",
            btnAction: () => navigate('/')
        },
        failed: {
            icon: <ErrorOutlineIcon sx={{ fontSize: 100, color: '#f44336', mb: 2 }} />,
            title: "Thanh Toán Thất Bại",
            color: "#f44336",
            bg: "#fff5f5",
            border: "#fed7d7",
            textColor: "#c53030",
            message: `Rất tiếc, giao dịch cho đơn hàng #${orderId} đã bị hủy hoặc gặp lỗi.`,
            subMessage: "Vui lòng kiểm tra lại số dư hoặc thử lại phương thức khác.",
            btnText: "Thanh toán lại",
            btnAction: () => navigate('/tai-khoan/lich-su-don-hang')
        }
    };

    const current = isSuccess ? config.success : config.failed;

    return (
        <Container maxWidth="sm" sx={{ mt: 10, mb: 10 }}>
            <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
                {current.icon}
                
                <Typography variant="h4" fontWeight="bold" gutterBottom color={current.color}>
                    {current.title}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" mb={3}>
                    {current.message}
                </Typography>

                <Box sx={{ bgcolor: current.bg, p: 2, borderRadius: 2, mb: 4, border: `1px solid ${current.border}` }}>
                    <Typography variant="body2" color={current.textColor}>
                        {current.subMessage}
                    </Typography>
                </Box>

                <Box display="flex" flexDirection="column" gap={2}>
                    <Button variant="contained" size="large" fullWidth onClick={current.btnAction} 
                        sx={{ bgcolor: current.color, '&:hover': { bgcolor: current.color } }}>
                        {current.btnText}
                    </Button>
                    <Button variant="text" onClick={() => navigate('/')}>
                        Quay về trang chủ
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}