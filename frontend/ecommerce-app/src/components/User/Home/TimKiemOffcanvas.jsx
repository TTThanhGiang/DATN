function TimKiemOffcanvas({ mo, dong }) {
  if (!mo) return null;

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={dong}></div>
      <div
        className="offcanvas offcanvas-end show"
        style={{
          visibility: "visible",
          transform: "translateX(0)",
          transition: "transform 0.3s",
        }}
      >
        <div className="offcanvas-header justify-content-center">
          <button type="button" className="btn-close" onClick={dong}></button>
        </div>
        <div className="offcanvas-body">
          <div className="order-md-last">
            <h4 className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary">Search</span>
            </h4>
            <form role="search" method="get" className="d-flex mt-3 gap-0">
              <input
                className="form-control rounded-start rounded-0 bg-light"
                type="text"
                placeholder="What are you looking for?"
                aria-label="What are you looking for?"
              />
              <button className="btn btn-dark rounded-end rounded-0" type="submit">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default TimKiemOffcanvas;
