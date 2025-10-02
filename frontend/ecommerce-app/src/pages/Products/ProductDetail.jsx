import { useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

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
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("description");
  const [rating, setRating] = useState(0);

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Giả lập ảnh sản phẩm
  const productImages = [
    "/images/thumb-bananas.png",
    "/images/thumb-biscuits.png",
    "/images/thumb-milk.png",
  ];

  return (
    <>
      {/* Product Section */}
      <Box className="product_image_area py-5">
        <Box className="container">
          <Box className="row s_product_inner">
            {/* Slideshow */}
            <Box className="col-lg-6">
              <Swiper
                modules={[Pagination, Navigation]}
                pagination={{ clickable: true }}
                navigation
                loop
                className="product-swiper"
              >
                {productImages.map((src, index) => (
                  <SwiperSlide key={index}>
                    <Box className="single-prd-item text-center">
                      <img
                        src={src}
                        alt={`Product ${index + 1}`}
                        style={{
                          maxHeight: "400px",
                          objectFit: "contain",
                          width: "100%",
                        }}
                      />
                    </Box>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>

            {/* Product Info */}
            <Box className="col-lg-5 offset-lg-1">
              <Box className="s_product_text">
                <Typography variant="h4" gutterBottom>
                  Faded SkyBlu Denim Jeans
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                  $149.99
                </Typography>

                <ul className="list-unstyled mb-3">
                  <li>
                    <b>Category:</b> Household
                  </li>
                  <li>
                    <b>Availability:</b> In Stock
                  </li>
                </ul>

                <Typography variant="body1" paragraph>
                  Mill Oil is an innovative oil filled radiator with the most
                  modern technology. If you are looking for something that can
                  make your interior look awesome, and at the same time give you
                  the pleasant warm feeling during the winter.
                </Typography>

                {/* Quantity */}
                <Box className="d-flex align-items-center mb-4">
                  <Typography variant="subtitle1" className="me-2 fw-bold">
                    Quantity:
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
                  Add to Cart
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
          <Tab value="description" label="Description" />
          <Tab value="reviews" label="Reviews" />
        </Tabs>

        <Box className="py-4">
          {tab === "description" && (
            <Typography variant="body1">
              Beryl Cook is one of Britain’s most talented and amusing artists.
              Her pictures feature women of all shapes and sizes enjoying
              themselves. Born between the two world wars, Beryl Cook eventually
              left Kendrick School in Reading at the age of 15.
            </Typography>
          )}

          {tab === "reviews" && (
            <Box>
                <Box className="row">
                {/* Cột trái - danh sách review */}
                <Box className="col-lg-6 col-12">
                    <Typography variant="h6">Overall Rating: 4.0</Typography>
                    <Rating value={4} readOnly precision={0.5} />
                    <Typography variant="body2" className="mt-2">
                    Based on 3 reviews
                    </Typography>

                    {/* Danh sách review */}
                    <Box className="mt-3">
                    {[1, 2, 3].map((r) => (
                        <Box
                        key={r}
                        className="review_item mb-3 p-3 border rounded"
                        >
                        <Box className="d-flex align-items-center mb-2">
                            <img
                            src={`/images/review-${r}.png`}
                            alt={`Review ${r}`}
                            width={50}
                            height={50}
                            className="me-2 rounded-circle"
                            />
                            <Box>
                            <Typography variant="subtitle1">Blake Ruiz</Typography>
                            <Rating value={5} readOnly size="small" />
                            </Box>
                        </Box>
                        <Typography variant="body2">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </Typography>
                        </Box>
                    ))}
                    </Box>
                </Box>

                {/* Cột phải - form review */}
                <Box className="col-lg-6 col-12">
                    <Typography variant="h6" gutterBottom>
                    Add a Review
                    </Typography>
                    {/* Rating chọn sao */}
                    <Box className="d-flex align-items-center mb-3">
                        <Typography variant="subtitle1" className="me-2">
                        Your Rating:
                        </Typography>
                        <Rating
                        name="user-rating"
                        value={rating}
                        onChange={(e, newValue) => setRating(newValue)}
                        precision={1}
                        />
                    </Box>
                    <TextField
                    fullWidth
                    label="Your Name"
                    className="my-2"
                    size="small"
                    />
                    <TextField
                    fullWidth
                    label="Email"
                    className="my-2"
                    size="small"
                    />
                    <TextField
                    fullWidth
                    label="Review"
                    className="my-2"
                    size="small"
                    multiline
                    rows={3}
                    />
                    <Button variant="contained" color="success">
                    Submit Review
                    </Button>
                </Box>
                </Box>
            </Box>
            )}

        </Box>
      </Box>
    </>
  );
}

export default ProductDetail;
