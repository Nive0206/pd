import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = location.state?.cart || [];

  // State for user details
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle order confirmation
  const handleConfirmOrder = () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode || !form.paymentMethod) {
      alert("Please fill all details before proceeding.");
      return;
    }
    alert("Order Placed Successfully!");
    navigate("/order-confirmation", { state: { form, cart } });
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      {/* Address Section */}
      <div className="address-section">
        <h3>Shipping Address</h3>
        <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
        <input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
        <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} />
        <input type="text" name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} />
      </div>

      {/* Payment Method Section */}
      <div className="payment-section">
        <h3>Select Payment Method</h3>
        <label>
          <input type="radio" name="paymentMethod" value="COD" onChange={handleChange} /> Cash on Delivery (COD)
        </label>
        <label>
          <input type="radio" name="paymentMethod" value="UPI" onChange={handleChange} /> UPI
        </label>
        <label>
          <input type="radio" name="paymentMethod" value="Card" onChange={handleChange} /> Credit/Debit Card
        </label>
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        {cart.length > 0 ? (
          cart.map((item) => (
            <div key={item.id} className="summary-item">
              <p>{item.name} - ₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}</p>
            </div>
          ))
        ) : (
          <p>No items in cart.</p>
        )}
      </div>

      <button className="confirm-order-btn" onClick={handleConfirmOrder}>Confirm Order</button>
    </div>
  );
};

export default Checkout;
