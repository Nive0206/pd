import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Men from "./components/Men";
import Women from "./components/Women";
import Kids from "./components/Kids";
import Cart from "./components/Cart";
import Login from "./components/Login";
import Auth from "./components/Signup";
import Account from "./components/Account";
import OrderPage from "./components/OrderPage";
import Contact from "./components/Contact";
import ImageCarousel from "./components/ImageCarousel";
import ProductPage from "./components/ProductDetails";
import Payment from "./components/Payment";
import SecuritySettings from "./components/SecuritySettings";
import ProductDetails from "./components/ProductDetails";
import productsData from "./data/kidsProducts";
import Checkout from "./components/Checkout";
import OrderConfirmation from "./components/OrderConfirmation";  // ✅ Correct file path
import { RatingProvider } from './context/RatingContext';

const App = () => {
  const [user, setUser] = useState(null);

  // Check if a user is logged in
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <RatingProvider>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/men" element={<Men />} />
        <Route path="/women" element={<Women />} />
        <Route path="/kids" element={<Kids />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/account" element={<Account />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/product/:id" element={<ProductPage products={productsData} />} /> {/* ✅ Fixed */}
        <Route path="/imagecarousel" element={<ImageCarousel />} />
        <Route path="/payment/:id" element={<Payment />} />
        <Route path="/security-settings" element={<SecuritySettings />} />
        <Route path="/:category/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </RatingProvider>
  );
};

export default App;
