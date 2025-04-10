import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import "./payment.css";

const Payment = () => {
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "",
    upiId: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("Please log in to proceed with the payment.");
          navigate("/login");
          return;
        }

        // Check if a single product is being bought
        const product = location.state?.product;
        if (product) {
          const productWithQuantity = { ...product, quantity: 1 };
          setCart([productWithQuantity]);
          setTotalAmount(product.price);
          return;
        }

        // Otherwise, fetch all cart items from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userCart = docSnap.data().cart || [];
          setCart(userCart);
          calculateTotal(userCart);
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();
  }, [navigate, location]);

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
    setTotalAmount(total);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode || !form.paymentMethod) {
      alert("Please fill all required details before proceeding.");
      return false;
    }

    if (form.phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return false;
    }

    if (form.pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode.");
      return false;
    }

    if (form.paymentMethod === "UPI" && !form.upiId) {
      alert("Please enter your UPI ID.");
      return false;
    }

    if (form.paymentMethod === "Card") {
      if (!form.cardNumber || !form.cardName || !form.expiryDate || !form.cvv) {
        alert("Please fill all card details.");
        return false;
      }
      if (form.cardNumber.length !== 16) {
        alert("Please enter a valid 16-digit card number.");
        return false;
      }
      if (form.cvv.length !== 3) {
        alert("Please enter a valid 3-digit CVV.");
        return false;
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please log in to proceed with the payment.");
        return;
      }

      // Create order in Firestore
      const orderData = {
        userId: user.uid,
        items: cart,
        totalAmount,
        shippingAddress: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          pincode: form.pincode
        },
        paymentMethod: form.paymentMethod,
        paymentDetails: form.paymentMethod === "UPI" ? { upiId: form.upiId } :
                       form.paymentMethod === "Card" ? {
                         cardNumber: form.cardNumber.slice(-4),
                         cardName: form.cardName,
                         expiryDate: form.expiryDate
                       } : null,
        status: "Processing",
        date: new Date().toISOString()
      };

      const ordersRef = doc(db, "users", user.uid, "orders", Date.now().toString());
      await setDoc(ordersRef, orderData);

      // Clear cart after successful order
      await setDoc(doc(db, "users", user.uid), { cart: [] }, { merge: true });

      alert("Payment Successful! Order Placed.");
      navigate("/order-confirmation", { state: { form, cart, totalAmount } });
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error processing payment. Please try again.");
    }
  };
  
  return (
    <div className="payment-container">
      <h2>Payment Details</h2>

      {/* Shipping Address Section */}
      <div className="address-section">
        <h3>Shipping Address</h3>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleInputChange}
          required
        />
        <textarea
          name="address"
          placeholder="Full Address"
          value={form.address}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="pincode"
          placeholder="Pincode"
          value={form.pincode}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* Payment Method Section */}
      <div className="payment-method-section">
        <h3>Select Payment Method</h3>
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="COD"
            checked={form.paymentMethod === "COD"}
            onChange={handleInputChange}
          />
          Cash on Delivery (COD)
        </label>
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="UPI"
            checked={form.paymentMethod === "UPI"}
            onChange={handleInputChange}
          />
          UPI
        </label>
        {form.paymentMethod === "UPI" && (
          <div className="upi-details">
            <input
              type="text"
              name="upiId"
              placeholder="Enter UPI ID (e.g., name@upi)"
              value={form.upiId}
              onChange={handleInputChange}
              required
            />
          </div>
        )}
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="Card"
            checked={form.paymentMethod === "Card"}
            onChange={handleInputChange}
          />
          Credit/Debit Card
        </label>
        {form.paymentMethod === "Card" && (
          <div className="card-details">
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={form.cardNumber}
              onChange={handleInputChange}
              maxLength="16"
              required
            />
            <input
              type="text"
              name="cardName"
              placeholder="Name on Card"
              value={form.cardName}
              onChange={handleInputChange}
              required
            />
            <div className="card-expiry-cvv">
              <input
                type="text"
                name="expiryDate"
                placeholder="MM/YY"
                value={form.expiryDate}
                onChange={handleInputChange}
                maxLength="5"
                required
              />
              <input
                type="text"
                name="cvv"
                placeholder="CVV"
                value={form.cvv}
                onChange={handleInputChange}
                maxLength="3"
                required
              />
            </div>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.img} alt={item.name} />
            <div className="item-details">
              <h4>{item.name}</h4>
              <p>Price: ₹{item.price}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Total: ₹{item.price * item.quantity}</p>
            </div>
          </div>
        ))}
        <div className="total-amount">
      <h3>Total Amount: ₹{totalAmount}</h3>
        </div>
      </div>

      <button 
        className="pay-btn" 
        onClick={handlePayment}
        disabled={!form.paymentMethod}
      >
        Place Order
      </button>
    </div>
  );
};

export default Payment;



