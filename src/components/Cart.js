import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import "./Cart.css";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Memoize the cart items with proper number conversion
  const cartItems = useMemo(() => {
    return cart.map((item) => ({
      ...item,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      total: (Number(item.price) || 0) * (Number(item.quantity) || 1)
    }));
  }, [cart]);

  // Calculate total amount with proper number handling
  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
      return sum + itemTotal;
    }, 0);
  }, [cartItems]);

  // Load cart items with caching
  const loadCartItems = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      // Check localStorage first
      const cachedCart = localStorage.getItem(`cart_${user.uid}`);
      if (cachedCart) {
        const parsedCart = JSON.parse(cachedCart).map(item => ({
          ...item,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1
        }));
        setCart(parsedCart);
      }

      // Then fetch from Firestore
      const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
        const userCart = (docSnap.data().cart || []).map(item => ({
            ...item,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1
          }));
        setCart(userCart);
        // Update cache
        localStorage.setItem(`cart_${user.uid}`, JSON.stringify(userCart));
        }
      } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  // Optimize quantity update
  const updateQuantity = useCallback(async (productId, newQuantity) => {
    try {
    const user = auth.currentUser;
    if (!user) return;
  
      const updatedCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: Number(newQuantity) || 1 } : item
      );

      // Update local state immediately
      setCart(updatedCart);
      // Update cache
      localStorage.setItem(`cart_${user.uid}`, JSON.stringify(updatedCart));

      // Update Firestore in the background
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { cart: updatedCart });
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  }, [cart]);

  // Optimize remove item
  const removeFromCart = useCallback(async (productId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const updatedCart = cart.filter(item => item.id !== productId);

      // Update local state immediately
      setCart(updatedCart);
      // Update cache
      localStorage.setItem(`cart_${user.uid}`, JSON.stringify(updatedCart));

      // Update Firestore in the background
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { cart: updatedCart });
    } catch (error) {
      console.error("Error removing item:", error);
    }
  }, [cart]);

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.img} alt={item.name} />
              <div className="item-details">
                  <h3>{item.name}</h3>
                <p className="price">Price: ₹{item.price.toFixed(2)}</p>
                  <div className="quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                    <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <p className="item-total">Total: ₹{item.total.toFixed(2)}</p>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="cart-summary">
            <h3>Total Amount: ₹{totalAmount.toFixed(2)}</h3>
            <button
              className="checkout-btn"
              onClick={() => navigate("/payment")}
            >
              Proceed to Checkout
          </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
