  // src/components/CategorySection.jsx
  import { Swiper, SwiperSlide } from "swiper/react";
  import { Navigation } from "swiper/modules";
  import "swiper/css";
  import "swiper/css/navigation";

  function CategorySection() {
    const categories = [
      { img: "images/icon-vegetables-broccoli.png", title: "Fruits & Veges" },
      { img: "images/icon-bread-baguette.png", title: "Breads & Sweets" },
      { img: "images/icon-soft-drinks-bottle.png", title: "Soft Drinks" },
      { img: "images/icon-wine-glass-bottle.png", title: "Wine & Beverages" },
      { img: "images/icon-animal-products-drumsticks.png", title: "Meat & Poultry" },
      { img: "images/icon-bread-herb-flour.png", title: "Flour & Baking" },
      { img: "images/icon-vegetables-broccoli.png", title: "Organic" },
    ];

    return (
      <section className="py-5 overflow-hidden">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            {/* Section Header */}
            <div className="section-header d-flex flex-wrap justify-content-between mb-5">
                <h2 className="section-title">Category</h2>

                <div className="d-flex align-items-center">
                  <a href="#" className="btn-link text-decoration-none">View All Categories →</a>
                  <div className="swiper-buttons">
                    <button className="swiper-prev category-carousel-prev btn btn-yellow">❮</button>
                    <button className="swiper-next category-carousel-next btn btn-yellow">❯</button>
                  </div>
                </div>
              </div>

            {/* Swiper Carousel */}
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: ".category-carousel-prev",
                nextEl: ".category-carousel-next",
              }}
              slidesPerView={2}
              spaceBetween={20}
              loop={true}
              breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 10 },  // màn hình nhỏ (mobile)
              576: { slidesPerView: 3, spaceBetween: 15 },  // tablet nhỏ
              992: { slidesPerView: 4, spaceBetween: 20 },  // desktop trở lên
              }}
              className="category-carousel"
            >
              {categories.map((cat, index) => (
                <SwiperSlide key={index} className="category-item" >
                  <a href="#" className="nav-link text-center">
                    <h3 className="category-title fs-6">{cat.title}</h3>
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
      </section>
    );
  }

  export default CategorySection;
