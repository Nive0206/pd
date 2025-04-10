import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig"; // Import Firestore & Auth
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // For navigation

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const user = auth.currentUser;

      if (user) {
        try {
          const ordersRef = collection(db, "users", user.uid, "orders");
          const ordersSnapshot = await getDocs(ordersRef);

          if (!ordersSnapshot.empty) {
            const ordersData = ordersSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setOrders(ordersData);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Your Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length > 0 ? (
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Items:</strong> {order.items ? order.items.join(", ") : "No items"}</p>
              <p><strong>Total Price:</strong> ${order.totalPrice}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <p>No orders found.</p>
          <button onClick={() => navigate("/men")}>Shop Men</button>
          <button onClick={() => navigate("/women")}>Shop Women</button>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
