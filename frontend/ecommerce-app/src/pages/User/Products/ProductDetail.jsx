import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import api from "../../../api";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  Rating,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

function ProductDetail() {
  const { id } = useParams(); // sau này có thể fetch theo id
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("Mô tả");
  const [ratings, setRatings] = useState(0);

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Giả lập ảnh sản phẩm
  const productImages = [
    "/images/thumb-bananas.png",
    "/images/thumb-biscuits.png",
    "/images/thumb-milk.png",
  ];

  useEffect(() => {
    fetchProductDetails();
  },[id]);

  const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/users/chi-tiet-san-pham/${id}`);
        if (response.status === 200) {
          setProduct(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
      }
    }

  const fetchProductRatings = async () => {
    try {
      const response = await api.get(`/users/danh-gia/san-pham/${id}`);
      if (response.status === 200) {
        setRatings(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy đánh giá sản phẩm:", error);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    fetchProductRatings();
  }, [id]);

  const formatDate = (isoString) => {
    if (!isoString) return "Không rõ";

    // Cắt phần microsecond thành mili-giây (3 chữ số)
    const fixed = isoString.replace(/\.\d+/, (m) => "." + m.slice(1, 4));

    const date = new Date(fixed);

    return isNaN(date.getTime())
      ? "Không rõ"
      : date.toLocaleDateString("vi-VN");
  };

  const calcAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;

    const total = ratings.reduce((sum, r) => sum + Number(r.sao || 0), 0);

    return (total / ratings.length).toFixed(1); // làm tròn 1 chữ số
  };
  const average = calcAverageRating(ratings);
  return (
    <>
      {/* Product Section */}
      <Box className="product_image_area py-5">
        <Box className="container">
          <Box className="row s_product_inner">
            {/* Slideshow */}
            <Box className="col-lg-6">
              <Box className="single-prd-item text-center">
                      <img
                        src={product ? product.hinh_anhs[0]?.duong_dan : null}
                        alt={product ? product.hinh_anhs.mo_ta : null}
                        style={{
                          maxHeight: "400px",
                          objectFit: "contain",
                          width: "100%",
                        }}
                      />
                    </Box>
            </Box>

            {/* Product Info */}
            <Box className="col-lg-5 offset-lg-1">
              <Box className="s_product_text">
                <Typography variant="h4" gutterBottom>
                  {product ? product.ten_san_pham + " " + product.don_vi : "Đang tải tên sản phẩm..."}
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                  {product ? product.don_gia : "Đang tải giá..."}
                </Typography>

                <Typography variant="body1" paragraph>
                  {product ? product.mo_ta : "Đang tải mô tả..."}
                </Typography>

                {/* Quantity */}
                <Box className="d-flex align-items-center mb-4">
                  <Typography variant="subtitle1" className="me-2 fw-bold">
                    Số lượng:
                  </Typography>
                  <Box className="d-flex align-items-center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleDecrease}
                    >
                      <RemoveIcon fontSize="small" />
                    </Button>
                    <TextField
                      value={quantity}
                      size="small"
                      sx={{ width: 60, mx: 1 }}
                      inputProps={{ readOnly: true, style: { textAlign: "center" } }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleIncrease}
                    >
                      <AddIcon fontSize="small" />
                    </Button>
                  </Box>
                </Box>

                {/* Buttons */}
                <Button
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  color="primary"
                >
                  Thêm vào giỏ hàng
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tabs Section */}
      <Box className="product_description_area my-5 container">
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab value="Mô tả" label="Mô tả" />
          <Tab value="Đánh giá" label="Đánh giá" />
        </Tabs>

        <Box className="py-4">
          {tab === "Mô tả" && (
            <Typography variant="body1">
              {product ? product.mo_ta : "Đang tải mô tả chi tiết..."}
            </Typography>
          )}

          {tab === "Đánh giá" && (
            <Box>
                <Box className="col-lg-12 col-12">
                    <Typography variant="h6">Đánh giá: {average}</Typography>
                    <Rating value={Number(average)} readOnly precision={0.5} />
                    <Typography variant="body2" className="mt-2">
                    Tổng đánh giá: {ratings.length}
                    </Typography>
                    {/* Danh sách review */}
                    <Box className="mt-3">
                      {ratings.length === 0 ? (
                        <Typography variant="body2" className="text-muted">
                          Chưa có đánh giá nào cho sản phẩm này.
                        </Typography>
                      ) : (
                        ratings.map((r) => (
                          <Box
                            key={r.ma_danh_gia}
                            className="review_item mb-3 p-3 border rounded shadow-sm"
                          >
                            <Box className="d-flex align-items-center justify-content-between">
                              <Typography variant="subtitle1" className="fw-bold">
                                {r.ho_ten}
                              </Typography>

                              <Typography variant="caption" className="text-muted">
                                {formatDate(r.ngay_danh_gia)}
                              </Typography>
                            </Box>

                            <Rating value={r.sao} readOnly size="small" className="mb-2" />
                            <Typography variant="body2"> {r.binh_luan} </Typography>

                            <Typography variant="body2">
                              {r.noi_dung}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Box>
                    
                </Box>

                {/* Cột phải - form review */}

            </Box>
            )}

        </Box>
      </Box>
    </>
  );
}

export default ProductDetail;
