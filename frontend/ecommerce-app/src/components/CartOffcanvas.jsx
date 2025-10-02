function CartOffcanvas({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={onClose}></div>
      <div
        className="offcanvas offcanvas-end show"
        style={{
          visibility: "visible",
          transform: "translateX(0)",
          transition: "transform 0.3s",
        }}
      >
        <div className="offcanvas-header justify-content-center">
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <div className="offcanvas-body">
          <h4 className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-primary">Your cart</span>
            <span className="badge bg-primary rounded-pill">3</span>
          </h4>
          <ul className="list-group mb-3">
            <li className="list-group-item d-flex align-items-center">
              <div className="d-flex flex-column">
                <h6 className="my-0">Growers cider</h6>
                <small className="text-muted d-block mt-1">Brief description</small>
              </div>
              <span className="fw-semibold ms-auto">$12</span>
            </li>
            <li className="list-group-item d-flex align-items-center">
              <div className="d-flex flex-column">
                <h6 className="my-0">Fresh grapes</h6>
                <small className="text-muted d-block mt-1">Brief description</small>
              </div>
              <span className="fw-semibold ms-auto">$8</span>
            </li>
            <li className="list-group-item d-flex align-items-center">
              <div className="d-flex flex-column">
                <h6 className="my-0">Heinz tomato ketchup</h6>
                <small className="text-muted d-block mt-1">Brief description</small>
              </div>
              <span className="fw-semibold ms-auto">$5</span>
            </li>
            <li className="list-group-item d-flex justify-content-between bg-light">
              <span>Total (USD)</span>
              <strong className="fs-5 text-primary">$25</strong>
            </li>
          </ul>
          <button className="w-100 btn btn-lg btn-success shadow-sm">
            Continue to Checkout
          </button>
        </div>
      </div>
    </>
  );
}

export default CartOffcanvas;
