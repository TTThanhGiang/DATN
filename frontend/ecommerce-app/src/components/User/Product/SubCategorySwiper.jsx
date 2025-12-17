import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const SubCategorySwiper = ({
  subCategories = [],
  onSelect,
  selectedSubCategory,
}) => {
  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <Swiper
        slidesPerView="auto"
        spaceBetween={12}
        grabCursor
        style={{
          width: "100%",
          overflow: "hidden",
          padding: "0 5px",
        }}
      >
        {subCategories.map((item, index) => {
          const isActive = selectedSubCategory === item.ma_danh_muc;

          return (
            <SwiperSlide
              key={index}
              style={{
                width: "auto",
                flexShrink: 0,
                textAlign: "center",
              }}
            >
              <div
                onClick={() => onSelect?.(item)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  cursor: "pointer",
                  minWidth: "78px",
                  padding: "10px 8px",
                  transition: "all 0.25s ease",
                  backgroundColor: isActive ? "#E6F9EE" : "#fff",
                  border: isActive
                    ? "2px solid #007E42"
                    : "1px solid #e0e0e0",
                  boxShadow: isActive
                    ? "0 2px 6px rgba(0,126,66,0.2)"
                    : "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <img
                  src={item.hinh_anhs?.[0]?.duong_dan || ""}
                  alt={item.ten_danh_muc}
                  style={{
                    width: 57,
                    height: 57,
                    objectFit: "contain",
                    borderRadius: 6,
                    border: isActive
                      ? "2px solid #007E42"
                      : "1px solid #ccc",
                    backgroundColor: "#fff",
                  }}
                />

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#007E42" : "#333",
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 90,
                  }}
                >
                  {item.ten_danh_muc}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default SubCategorySwiper;
