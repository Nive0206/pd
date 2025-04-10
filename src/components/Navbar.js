import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig"; // Import Firestore
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FaUserCircle, FaHome, FaShoppingCart, FaTshirt, FaFemale, FaChild, FaSearch } from "react-icons/fa"; 
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [searchResults, setSearchResults] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  // Fetch products matching search query
  const fetchProducts = async (queryText) => {
    if (!queryText.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const productsRef = collection(db, "products"); // Firestore collection
      const q = query(productsRef, where("name", ">=", queryText), where("name", "<=", queryText + "\uf8ff"));
      const querySnapshot = await getDocs(q);

      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSearchResults(products);
    } catch (error) {
      console.error("Error fetching products: ", error);
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchProducts(value);
  };

  return (
    <div className="navbar">
      <ul>
        <li>
          <Link to="/home">
            <FaHome className="nav-icon" /> Home
          </Link>
        </li>
        <li>
          <Link to="/cart">
            <FaShoppingCart className="nav-icon" /> Cart
          </Link>
        </li>
        <li>
          <Link to="/men">
            <FaTshirt className="nav-icon" /> Men
          </Link>
        </li>
        <li>
          <Link to="/women">
            <FaFemale className="nav-icon" /> Women
          </Link>
        </li>
        <li>
          <Link to="/kids">
            <FaChild className="nav-icon" /> Kids
          </Link>
        </li>

        {/* Search Bar */}
       

        

        {user ? (
          <>
            <li>
              <Link to="/account" className="profile-container">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="profile-img" />
                ) : (
                  <FaUserCircle className="profile-icon" size={30} />
                )}
              </Link>
            </li>
            <li>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <li>
            <button className="login-signup-btn" onClick={() => navigate("/signup")}>
              Login / Sign Up
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
