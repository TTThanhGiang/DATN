import React from "react";
  import { Swiper, SwiperSlide } from "swiper/react";
  import { Navigation } from "swiper/modules";
  import "swiper/css";
  import "swiper/css/navigation";

const SubCategorySwiper = ({ subCategories = [], onSelect, selectedSubCategory }) => {
  return (
    <div>
      <Swiper 

        slidesPerView="auto" 
        spaceBetween={15} 
        grabCursor
        style={{ 
          width: "100%", 
          padding: "0 5px" 
          }}>
        {subCategories.map((item, index) => {
          const isActive = selectedSubCategory === item.ma_danh_muc;

          return (
            <SwiperSlide key={index} style={{ width: "90px", textAlign: "center" }}>
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
                  border: isActive ? "2px solid #007E42" : "0px solid #e0e0e0",
                  boxShadow: isActive ? "0 2px 6px rgba(0, 126, 66, 0.2)" : "0 0px 0px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = isActive ? "0 2px 6px rgba(0, 126, 66, 0.2)" : "0 1px 3px rgba(0,0,0,0.05)";
                }}
              >
                <img
                  src={item.hinh_anhs?.[0]?.duong_dan || null}
                  alt={item.ten_danh_muc}
                  style={{
                    width: "57px",
                    height: "57px",
                    objectFit: "contain",
                    borderRadius: "6px",
                    border: isActive ? "2px solid #007E42" : "1px solid #ccc",
                    backgroundColor: "#fff",
                  }}
                />
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#007E42" : "#333",
                    lineHeight: "1.3",
                    textAlign: "center",
                    /* Xử lý chữ dài */
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",          // chiếm toàn bộ width của container
                    maxWidth: "90px"
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
