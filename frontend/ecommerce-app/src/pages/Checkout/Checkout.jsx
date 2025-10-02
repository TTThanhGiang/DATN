export default function Checkout(){
    return (
        <>
            <section class="banner-area organic-breadcrumb">
        <div class="container">
            <div class="breadcrumb-banner d-flex flex-wrap align-items-center justify-content-end">
                <div class="col-first">
                    <h1>Checkout</h1>
                    <nav class="d-flex align-items-center">
                        <a href="index.html">Home<span class="lnr lnr-arrow-right"></span></a>
                        <a href="single-product.html">Checkout</a>
                    </nav>
                </div>
            </div>
        </div>
    </section>

    <section class="checkout_area section_gap">
        <div class="container">
            <div class="billing_details">
                <h3>Billing Details</h3>
                <div class="row">
                        <div class="col-lg-6">
                        <form class="row contact_form" action="{{ route('checkout.order')}}" method="post" >
                            @csrf
                            <div class="col-md-12 form-group p_star">
                                <input type="text" class="form-control" id="first" name="name" placeholder="Name"  required/>
                            </div>
                            <div class="col-md-12 form-group p_star">
                                <input type="text" class="form-control" id="phone" name="phone" placeholder="Phone"  required/>
                            </div>
                            <div class="col-md-12 form-group p_star">
                                <input type="text" class="form-control" id="email" name="email" placeholder="Email"  required/>
                            </div>
                            <div class="col-md-12 form-group p_star">
                                <input type="text" class="form-control" id="add1" name="address" placeholder="Address"  required/>
                            </div>
                            <div class="col-md-12 form-group p_star">
                                <button type="submit" class="primary-btn">Checkout</button>
                            </div>
                            
                            </form>
                        </div>
                        <div class="col-lg-6">
                            <div class="order_box">
                                <h2>Your Order</h2>
                                <ul class="list">
                                    <li><a href="#">Product <span>Total</span></a></li>
                                    
                                        <li><a href="#"> <span class="middle">x </span> <span class="last"></span></a></li>

                                    </ul>
                                <ul class="list list_2">
                                    <li><a href="#">Subtotal <span></span></a></li>
                                   
                                    <li><a href="#">Shipping <span></span></a></li>
                                    <li><a href="#">Total <span></span></a></li>
                                </ul>
                            </div>
                        </div>
                </div>
                
            </div>
        </div>
    </section>
        </>
    )
}
