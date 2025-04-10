import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

// Function to save order in Firestore
export const saveOrderToFirestore = async (orderDetails) => {
  const user = auth.currentUser; // Get logged-in user
  if (!user) {
    console.log("No user logged in");
    return;
  }

  try {
    // Reference to the user's orders collection
    const ordersRef = collection(db, "users", user.uid, "orders");

    // Add order to Firestore
    await addDoc(ordersRef, orderDetails);
    console.log("✅ Order saved successfully!");
  } catch (error) {
    console.error("❌ Error saving order:", error);
  }
};
