import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function Banner() {
  return (
    <section className="py-3" style={{
            backgroundImage: "url('images/background-pattern.jpg')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover"
        }}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">

            <div className="banner-blocks">
            
              <div className="banner-ad large bg-info block-1">
                <Swiper
                    modules={[Pagination, Autoplay]}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000 }}
                    loop={true}
                >
                    {/* Slide 1 */}
                    <SwiperSlide>
                    <div className="row banner-content p-5">
                        <div className="content-wrapper col-md-7">
                        <div className="categories my-3">100% tự nhiên</div>
                        <h3 className="display-4">Sinh tố tươi & Nước ép mùa hè</h3>
                        <p>Thơm ngon, tự nhiên, tốt cho sức khỏe.</p>
                        <a href="#" className="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1 px-4 py-3 mt-3">
                            Mua ngay
                        </a>
                        </div>
                        <div className="img-wrapper col-md-5">
                        <img src="/images/product-thumb-1.png" className="img-fluid" />
                        </div>
                    </div>
                    </SwiperSlide>

                    {/* Slide 2 */}
                    <SwiperSlide>
                    <div className="row banner-content p-5">
                        <div className="content-wrapper col-md-7">
                        <div className="categories mb-3 pb-3">100% tự nhiên</div>
                        <h3 className="banner-title">Sinh tố tươi & Nước ép mùa hè</h3>
                        <p>Thơm ngon, tự nhiên, tốt cho sức khỏe.</p>
                        <a href="#" className="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1">
                            Xem bộ sưu tập
                        </a>
                        </div>
                        <div className="img-wrapper col-md-5">
                        <img src="/images/product-thumb-1.png" className="img-fluid" />
                        </div>
                    </div>
                    </SwiperSlide>

                    {/* Slide 3 */}
                    <SwiperSlide>
                    <div className="row banner-content p-5">
                        <div className="content-wrapper col-md-7">
                        <div className="categories mb-3 pb-3">100% tự nhiên</div>
                        <h3 className="banner-title">Sốt cà chua Heinz</h3>
                        <p>Thơm ngon, tự nhiên, tốt cho sức khỏe.</p>
                        <a href="#" className="btn btn-outline-dark btn-lg text-uppercase fs-6 rounded-1">
                            Xem bộ sưu tập
                        </a>
                        </div>
                        <div className="img-wrapper col-md-5">
                        <img src="/images/product-thumb-2.png" className="img-fluid" />
                        </div>
                    </div>
                    </SwiperSlide>
                </Swiper>
            </div>
              
              <div className="banner-ad bg-success-subtle block-2" style={{
                    backgroundImage: "url('images/ad-image-1.png')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right bottom"
                }}>
                <div className="row banner-content p-5">

                  <div className="content-wrapper col-md-7">
                    <div className="categories sale mb-3 pb-3">Giảm 20%</div>
                    <h3 className="banner-title">Trái cây & Rau củ</h3>
                    <a href="#" className="d-flex align-items-center nav-link">Xem bộ sưu tập <svg width="24" height="24"></svg></a>
                  </div>

                </div>
              </div>

              <div className="banner-ad bg-danger block-3" style={{
                    backgroundImage: "url('images/ad-image-2.png')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right bottom"
                }}>
                <div className="row banner-content p-5">

                  <div className="content-wrapper col-md-7">
                    <div className="categories sale mb-3 pb-3">Giảm 15%</div>
                    <h3 className="item-title">Các sản phẩm nướng</h3>
                    <a href="#" className="d-flex align-items-center nav-link">Xem bộ sưu tập <svg width="24" height="24"></svg></a>
                  </div>

                </div>
              </div>

            </div>
              
          </div>
        </div>
      </div>
    </section>
  );
}
export default Banner;
