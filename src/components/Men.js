import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { useRating } from "../context/RatingContext";
import "./Men.css";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const saveUserData = async (user) => {
  try {
    await setDoc(
      doc(db, "users", user.uid),
      { name: user.displayName, email: user.email },
      { merge: true }
    );
    console.log("User data saved!");
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

const Men = () => {
  const navigate = useNavigate();
  const { ratings } = useRating();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        saveUserData(user);
        
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setCart(userData.cart || []);
            console.log("Cart loaded from Firestore:", userData.cart);
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
    const menProducts = [
      { id: 7, name: "Formals", price: 899, discount: "60% off", img: `${process.env.PUBLIC_URL}/images/m1.jpg`, rating: ratings[7] || 4, brand: "Levi's" },
      { id: 8, name: "Casuals", price: 1499, discount: "50% off", img: `${process.env.PUBLIC_URL}/images/m2.jpg`, rating: ratings[8] || 4.5, brand: "Nike" },
      { id: 9, name: "T-shirt", price: 499, discount: "40% off", img: `${process.env.PUBLIC_URL}/images/m3.jpg`, rating: ratings[9] || 4.2, brand: "Fastrack" },
      { id: 10, name: "Men's Joggers", price: 1000, discount: "55% off", img: `${process.env.PUBLIC_URL}/images/m4.jpg`, rating: ratings[10] || 4, brand: "Adidas" },
      { id: 11, name: "Shirt", price: 1299, discount: "55% off", img: `${process.env.PUBLIC_URL}/images/m5.jpg`, rating: ratings[11] || 4, brand: "Adidas" },
      { id: 12, name: "Sweatshirt", price: 1299, discount: "55% off", img: `${process.env.PUBLIC_URL}/images/m6.jpg`, rating: ratings[12] || 4, brand: "Adidas" }
    ];
    setProducts(menProducts);
    setFilteredProducts(menProducts);
  }, [ratings]);

  useEffect(() => {
    const filtered = products
      .filter(
        (product) =>
          product.price <= maxPrice &&
          (selectedBrands.length === 0 || selectedBrands.includes(product.brand)) &&
          product.rating >= minRating
      )
      .sort((a, b) => a.price - b.price);
    setFilteredProducts(filtered);
  }, [maxPrice, selectedBrands, minRating, products]);

  const viewProductDetails = (id) => {
    navigate(`/product/${id}`);
  };

  const addToCart = async (product) => {
    console.log("Add to Cart clicked for:", product); // Check if function is called
  
    if (!isLoggedIn) {
      alert("Please log in to add items to the cart.");
      return;
    }
  
    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      
      let updatedCart = [];
      if (docSnap.exists()) {
        updatedCart = docSnap.data().cart || [];
        const existingItem = updatedCart.find((item) => item.id === product.id);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          updatedCart.push({ ...product, quantity: 1 });
        }
      } else {
        updatedCart = [{ ...product, quantity: 1 }];
      }
  
      await setDoc(userDocRef, { cart: updatedCart }, { merge: true });
  
      console.log("Cart updated in Firestore:", updatedCart); // Check if Firestore updates
  
      setCart([...updatedCart]);  // Ensure React state updates UI
      console.log("Cart state updated:", updatedCart); // Check if UI updates
  
      alert("Item added to cart!");
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };
  
  
  const handleBuyNow = (product) => {
    navigate("/payment", { state: { product } });
  };
  

  return (
    <div className="men-container">
      <div className="sidebar">
        <h3>Filters</h3>

        <div>
          <h4>Price: ₹{maxPrice}</h4>
          <input type="range" min="100" max="5000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
        </div>

        <h4>Brands</h4>
        {["Levi's", "Nike", "Fastrack", "Adidas"].map((brand) => (
          <label key={brand}>
            <input type="checkbox" value={brand} checked={selectedBrands.includes(brand)} onChange={(e) => setSelectedBrands(e.target.checked ? [...selectedBrands, brand] : selectedBrands.filter((b) => b !== brand))} />
            {brand}
          </label>
        ))}

        <h4>Customer Review</h4>
        {[4, 3, 0].map((rating) => (
          <label key={rating}>
            <input type="radio" name="rating" value={rating} checked={minRating === rating} onChange={() => setMinRating(rating)} />
            {rating ? `⭐⭐⭐${rating === 4 ? "⭐" : ""} & Up` : "All Ratings"}
          </label>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card" onClick={() => viewProductDetails(product.id)}>
              <img src={product.img} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{"⭐".repeat(Math.round(product.rating))} ({product.rating})</p>
              <p><strong>₹{product.price}</strong> <span className="discount">{product.discount}</span></p>
              <button className="cart-btn" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>Add to Cart</button>
              <button className="buy-btn" onClick={(e) => { 
  e.stopPropagation(); 
  handleBuyNow(product); 
}}>
  Buy Now
</button>

            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default Men;
