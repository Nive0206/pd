import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { useRating } from "../context/RatingContext";
import "./Kids.css";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Function to save user data in Firestore
const saveUserData = async (user) => {
  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        name: user.displayName,
        email: user.email,
      },
      { merge: true }
    );
    console.log("User data saved!");
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

const Kids = () => {
  const navigate = useNavigate();
  const { ratings } = useRating();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [maxPrice, setMaxPrice] = useState(3400);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);

  // Track Firebase Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        saveUserData(user);

        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            await setDoc(userDocRef, { cart: [] });
          } else {
            setCart(docSnap.data().cart || []);
          }
        } catch (error) {
          console.error("Firestore error:", error);
        }
      } else {
        setIsLoggedIn(false);
        setCart([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const kidsProducts = [
      { id: 13, name: "Cotton Printed Shorts", price: 739, discount: "75% off", img: `${process.env.PUBLIC_URL}/images/k1 (1).png`, rating: ratings[13] || 4, brand: "Q-RIOUS" },
      { id: 14, name: "Boys Striped Cotton Pullover", price: 545, discount: "73% off", img: `${process.env.PUBLIC_URL}/images/k1 (2).png`, rating: ratings[14] || 4, brand: "Leriya Fashion" },
      { id: 15, name: "Collar Cotton Casual Shirt", price: 299, discount: "85% off", img: `${process.env.PUBLIC_URL}/images/k1 (3).png`, rating: ratings[15] || 3, brand: "ELEGANTE" },
      { id: 16, name: "Colourblocked A-Line Dress", price: 259, discount: "71% off", img: `${process.env.PUBLIC_URL}/images/k1 (4).png`, rating: ratings[16] || 5, brand: "SNM MIFER" },
      { id: 17, name: "Flare Dress", price: 259, discount: "61% off", img: `${process.env.PUBLIC_URL}/images/k1 (5).png`, rating: ratings[17] || 4.6, brand: "SNM MIFER" },
      { id: 18, name: "Girls Flared leggings", price: 280, discount: "41% off", img: `${process.env.PUBLIC_URL}/images/k1 (6).png`, rating: ratings[18] || 4.2, brand: "ELEGANTE" },
    ];

    setProducts(kidsProducts);
    setFilteredProducts(kidsProducts);
  }, [ratings]);

  useEffect(() => {
    const sortedFilteredProducts = products
      .filter((product) => product.price <= maxPrice && (selectedBrands.length === 0 || selectedBrands.includes(product.brand)) && product.rating >= minRating)
      .sort((a, b) => a.price - b.price);
    setFilteredProducts(sortedFilteredProducts);
  }, [maxPrice, selectedBrands, minRating, products]);

  const viewProductDetails = (id) => {
    navigate(`/product/${id}`);
  };

  const addToCart = async (product) => {
    if (!isLoggedIn) {
      alert("Please log in to add items to the cart.");
      return;
    }

    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      let updatedCart = docSnap.exists() ? docSnap.data().cart || [] : [];

      const existingItemIndex = updatedCart.findIndex((item) => item.id === product.id);
      if (existingItemIndex !== -1) {
        updatedCart[existingItemIndex].quantity += 1;
      } else {
        updatedCart.push({ ...product, quantity: 1 });
      }

      await setDoc(userDocRef, { cart: updatedCart }, { merge: true });
      setCart([...updatedCart]);
      alert("Item added to cart!");
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const handleBuyNow = () => navigate("/payment");

  return (
    <div className="kids-container">
      <div className="sidebar">
        <h3>Filters</h3>
        <div>
          <h4>Price: ₹{maxPrice}</h4>
          <input type="range" min="29" max="3400" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
        </div>
        <div>
          <h4>Customer Review</h4>
          {[4, 3, 0].map((rating) => (
            <label key={rating}>
              <input type="radio" name="rating" value={rating} checked={minRating === rating} onChange={() => setMinRating(rating)} />
              {rating ? `⭐⭐⭐${rating === 4 ? "⭐" : ""} & Up` : "All Ratings"}
            </label>
          ))}
        </div>
        <h4>Brands</h4>
        {["Q-RIOUS", "Leriya Fashion", "ELEGANTE", "SNM MIFER"].map((brand) => (
          <label key={brand}>
            <input type="checkbox" value={brand} checked={selectedBrands.includes(brand)} onChange={(e) => setSelectedBrands((prev) => e.target.checked ? [...prev, brand] : prev.filter((b) => b !== brand))} />
            {brand}
          </label>
        ))}
      </div>
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card" onClick={() => viewProductDetails(product.id)}>
            <img src={product.img} alt={product.name} />
            <h3>{product.name}</h3>
            <button onClick={(e) => { e.stopPropagation(); addToCart(product); }}>Add to Cart</button>
            <button onClick={(e) => { e.stopPropagation(); handleBuyNow(); }}>Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kids;
