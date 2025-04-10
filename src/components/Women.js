import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig"; // Import Firebase auth & Firestore
import { useRating } from "../context/RatingContext";
import "./Women.css";
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
    ); // Merge to prevent overwriting existing data
    console.log("User data saved!");
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

const Women = () => {
  const navigate = useNavigate();
  const { ratings } = useRating();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Filters
  const [maxPrice, setMaxPrice] = useState(3400);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);

  // Track Firebase Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        saveUserData(user); // Save user data when logged in

        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            await setDoc(userDocRef, { cart: [] }); // Initialize cart for new user
          } else {
            const userData = docSnap.data();
            setCart(userData.cart || []); // Load existing cart
          }
        } catch (error) {
          console.error("Firestore error:", error);
        }
      } else {
        setIsLoggedIn(false);
        setCart([]); // Clear cart when logged out
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  useEffect(() => {
    console.log("Updated Cart:", cart);
  }, [cart]); // This will log whenever the cart updates

  // Dummy Women Products Data
  useEffect(() => {
    const womenProducts = [
      {
        id: 1,
        name: "Women's Jogger Style Trouser",
        price: 739,
        discount: "75% off",
        img: `${process.env.PUBLIC_URL}/images/w1.jpg`,
        rating: ratings[1] || 4,
        brand: "Q-RIOUS",
      },
      {
        id: 2,
        name: "Cotton Co-Ord Set For Women",
        price: 545,
        discount: "73% off",
        img: `${process.env.PUBLIC_URL}/images/w2.jpg`,
        rating: ratings[2] || 4,
        brand: "Leriya Fashion",
      },
      {
        id: 3,
        name: "Retro Driving Sunglasses",
        price: 299,
        discount: "85% off",
        img: `${process.env.PUBLIC_URL}/images/w3.jpg`,
        rating: ratings[3] || 3,
        brand: "ELEGANTE",
      },
      {
        id: 4,
        name: "Boob Tape Kit",
        price: 259,
        discount: "71% off",
        img: `${process.env.PUBLIC_URL}/images/w4.jpg`,
        rating: ratings[4] || 5,
        brand: "SNM MIFER",
      },
      {
        id: 5,
        name: "Bodycon",
        price: 259,
        discount: "61% off",
        img: `${process.env.PUBLIC_URL}/images/w5.jpg`,
        rating: ratings[5] || 4.6,
        brand: "SNM MIFER",
      },
      {
        id: 6,
        name: "Sweatshirt",
        price: 280,
        discount: "41% off",
        img: `${process.env.PUBLIC_URL}/images/w7.jpg`,
        rating: ratings[6] || 4.2,
        brand: "ELEGANTE",
      },
    ];

    setProducts(womenProducts);
    setFilteredProducts(womenProducts);
  }, [ratings]);

  const viewProductDetails = (id) => {
    navigate(`/product/${id}`);
  };
  
  // Filter Logic
  useEffect(() => {
    const sortedFilteredProducts = products
      .filter(
        (product) =>
          product.price <= maxPrice &&
          (selectedBrands.length === 0 || selectedBrands.includes(product.brand)) &&
          product.rating >= minRating
      )
      .sort((a, b) => a.price - b.price); // Sort by price (low to high)

    setFilteredProducts(sortedFilteredProducts);
  }, [maxPrice, selectedBrands, minRating, products]);

  // Function to handle adding to cart
  const addToCart = async (product) => {
    if (!isLoggedIn) {
      alert("Please log in to add items to the cart.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("User is not authenticated!");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      let updatedCart = [];

      if (docSnap.exists()) {
        const userData = docSnap.data();
        updatedCart = userData.cart || [];

        const existingItemIndex = updatedCart.findIndex((item) => item.id === product.id);
        if (existingItemIndex !== -1) {
          updatedCart[existingItemIndex].quantity += 1;
        } else {
          updatedCart.push({ ...product, quantity: 1 });
        }
      } else {
        updatedCart = [{ ...product, quantity: 1 }];
      }

      // Save updated cart to Firestore
      await setDoc(userDocRef, { cart: updatedCart }, { merge: true });

      // ✅ Update local state immediately
      setCart([...updatedCart]);

      console.log("Item added to cart:", updatedCart);

      // ✅ Show alert after adding to cart
      alert("Item added to cart!");
    } catch (error) {
      console.error("Error updating cart:", error);
      alert("Failed to add item to cart. Please try again.");
    }
  };
  const handleBuyNow = () => {
    navigate("/payment"); // Redirects to the Payment Page
  };
  

  return (
    <div className="women-container">
      {/* Sidebar Filters */}
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
        <input
          type="checkbox"
          value={brand}
          checked={selectedBrands.includes(brand)}
          onChange={(e) => {
            const checked = e.target.checked;
            setSelectedBrands((prev) =>
              checked ? [...prev, brand] : prev.filter((b) => b !== brand)
            );
          }}
        />
        {brand}
      </label>
    ))}
      </div>
   
  

    
  
      {/* Product Grid */}
      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
          
            <div key={product.id} className="product-card" onClick={() => viewProductDetails(product.id)}>
              <img src={product.img} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{"⭐".repeat(product.rating)} ({product.rating})</p>
              <p><strong>₹{product.price}</strong> <span className="discount">{product.discount}</span></p>
              <button className="cart-btn" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
  Add to Cart
</button>
<button className="buy-btn" onClick={(e) => { e.stopPropagation(); handleBuyNow(); }}>
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

export default Women;
