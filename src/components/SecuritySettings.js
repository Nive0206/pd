
import "./SecuritySettings.css";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SecuritySettings = () => {
  const [userData, setUserData] = useState({
    displayName: "",
    username: "",
    mobileNumber: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // Added for re-authentication
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            console.log("User data not found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setLoading(false);
      };
      fetchUserData();
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  // 🔹 Function to update Firestore and Firebase profile
  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      // Update Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: userData.displayName,
        username: userData.username,
        mobileNumber: userData.mobileNumber,
      });

      // Update Firebase Auth Profile
      await updateProfile(user, { displayName: userData.displayName });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  // 🔹 Function to re-authenticate and change password
  const handleChangePassword = async () => {
    if (!user) return;
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      // **Re-authenticate user before updating password**
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential); // Re-authenticate user

      // **Update password after re-authentication**
      await updatePassword(user, newPassword);
      alert("Password updated successfully!");

      // Clear fields after update
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Failed to update password. Please check your current password and try again.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="security-settings-container">
      <h2>Login & Security</h2>

      <div className="input-group">
        <label>Name:</label>
        <input
          type="text"
          value={userData.displayName}
          onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label>Username:</label>
        <input
          type="text"
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label>Mobile Number:</label>
        <input
          type="text"
          value={userData.mobileNumber}
          onChange={(e) => setUserData({ ...userData, mobileNumber: e.target.value })}
        />
      </div>

      <button onClick={handleUpdateProfile}>Update Profile</button>

      <h3>Change Password</h3>
      <div className="input-group">
        <label>Current Password:</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <button onClick={handleChangePassword}>Change Password</button>
    </div>
  );
};

export default SecuritySettings;
