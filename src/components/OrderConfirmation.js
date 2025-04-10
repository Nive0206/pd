import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderConfirmation.css";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { form, cart } = location.state || {};

  return (
    <div className="order-confirmation-container">
      <h2>🎉 Order Confirmed!</h2>
      <p>Thank you, <strong>{form.name}</strong>, for shopping with us!</p>
      <p>Your order will be delivered to <strong>{form.address}, {form.city}, {form.pincode}</strong>.</p>
      <p>Payment Method: <strong>{form.paymentMethod}</strong></p>

      <h3>Order Summary</h3>
      {cart.map((item) => (
        <p key={item.id}>{item.name} - ₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}</p>
      ))}

      <button className="back-to-home" onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
};

export default OrderConfirmation;
