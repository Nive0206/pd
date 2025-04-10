import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Account.css";

const Account = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    query: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        // Fetch user data and orders in parallel
        const [userDocSnap, ordersSnap] = await Promise.all([
          getDoc(doc(db, "users", user.uid)),
          getDoc(doc(db, "users", user.uid, "orders", "list"))
        ]);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserData(data);
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            pincode: data.pincode || "",
            query: ""
          });
        }

        if (ordersSnap.exists()) {
          setOrders(ordersSnap.data().orders || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Error loading account data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: formData.name,
        phone: formData.phone,
        updatedAt: new Date()
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        updatedAt: new Date()
      });

      alert("Address updated successfully!");
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Error updating address. Please try again.");
    }
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;

      const queryRef = doc(db, "users", user.uid, "queries", "list");
      const querySnap = await getDoc(queryRef);
      
      const newQuery = {
        id: Date.now().toString(),
        query: formData.query,
        status: "pending",
        date: new Date().toISOString()
      };

      if (querySnap.exists()) {
        // Update existing document
        const existingQueries = querySnap.data().queries || [];
        await updateDoc(queryRef, {
          queries: [...existingQueries, newQuery]
        });
      } else {
        // Create new document
        await setDoc(queryRef, {
          queries: [newQuery]
        });
      }

      setFormData(prev => ({ ...prev, query: "" }));
      alert("Your query has been submitted successfully! We'll get back to you soon.");
    } catch (error) {
      console.error("Error submitting query:", error);
      alert("Error submitting query. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="account-container">
      <div className="account-sidebar">
        <h2>Account</h2>
        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          Your Orders
        </button>
        <button
          className={activeTab === "address" ? "active" : ""}
          onClick={() => setActiveTab("address")}
        >
          Your Address
        </button>
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Login & Security
        </button>
        <button
          className={activeTab === "contact" ? "active" : ""}
          onClick={() => setActiveTab("contact")}
        >
          Contact Us
        </button>
        </div>

      <div className="account-content">
        {activeTab === "orders" && (
          <div className="orders-section">
            <h3>Your Orders</h3>
            {orders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <p>Order ID: {order.id}</p>
                        <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="order-status">
                        Status: <span className={order.status.toLowerCase()}>{order.status}</span>
                      </div>
                    </div>
                    <div className="order-items">
                      {order.items.map((item) => (
                        <div key={item.id} className="order-item">
                          <img src={item.img} alt={item.name} />
                          <div className="item-details">
                            <h4>{item.name}</h4>
                            <p>Quantity: {item.quantity}</p>
                            <p>Price: ₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="order-summary">
                      <p>Total Amount: ₹{order.totalAmount}</p>
                      <p>Shipping Address: {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.pincode}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "address" && (
          <div className="address-section">
            <h3>Your Address</h3>
            <form onSubmit={handleUpdateAddress}>
              <textarea
                name="address"
                placeholder="Full Address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
                pattern="[0-9]{6}"
                title="Please enter a valid 6-digit pincode"
              />
              <button type="submit">Update Address</button>
            </form>
</div>
        )}

        {activeTab === "profile" && (
          <div className="profile-section">
            <h3>Login & Security</h3>
            <form onSubmit={handleUpdateProfile}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                required
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
              />
              <button type="submit">Update Profile</button>
            </form>
        </div>
        )}

        {activeTab === "contact" && (
          <div className="contact-section">
          <h3>Contact Us</h3>
            <div className="contact-info">
              <div className="contact-item">
                <h4>Customer Support</h4>
                <p>Email: support@example.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Hours: Mon-Fri, 9am-6pm EST</p>
              </div>
              <div className="contact-item">
                <h4>Submit a Query</h4>
                <form onSubmit={handleSubmitQuery}>
                  <textarea
                    name="query"
                    placeholder="Type your query here..."
                    value={formData.query}
                    onChange={handleInputChange}
                    required
                  />
                  <button type="submit">Submit Query</button>
                </form>
              </div>
            </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Account;
