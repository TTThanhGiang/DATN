import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const SubDanhMucSwiper = ({
  danhMucCon = [],
  onChon,
  danhMucConDangChon,
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
        {danhMucCon.map((danhMuc, index) => {
          const dangActive = danhMucConDangChon === danhMuc.ma_danh_muc;

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
                onClick={() => onChon?.(danhMuc)}
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
                  backgroundColor: dangActive ? "#E6F9EE" : "#fff",
                  border: dangActive
                    ? "2px solid #007E42"
                    : "1px solid #e0e0e0",
                  boxShadow: dangActive
                    ? "0 2px 6px rgba(0,126,66,0.2)"
                    : "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <img
                  src={danhMuc.hinh_anhs?.[0]?.duong_dan || ""}
                  alt={danhMuc.ten_danh_muc}
                  style={{
                    width: 57,
                    height: 57,
                    objectFit: "contain",
                    borderRadius: 6,
                    border: dangActive
                      ? "2px solid #007E42"
                      : "1px solid #ccc",
                    backgroundColor: "#fff",
                  }}
                />

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: dangActive ? 600 : 500,
                    color: dangActive ? "#007E42" : "#333",
                    lineHeight: 1.3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 90,
                  }}
                >
                  {danhMuc.ten_danh_muc}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default SubDanhMucSwiper;
