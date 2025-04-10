import React, { useState, useCallback } from "react";
import { auth, db } from "../firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // For forgot password confirmation
  const navigate = useNavigate();

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ Enable session persistence
      await setPersistence(auth, browserLocalPersistence);

      // ✅ Attempt login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Parallel operations
      const [userDoc] = await Promise.all([
        getDoc(doc(db, "users", user.uid))
      ]);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Store minimal required data in localStorage for quick access
        localStorage.setItem('userData', JSON.stringify({
          uid: user.uid,
          name: userData.name || '',
          email: userData.email || '',
          cart: userData.cart || []
        }));
      }

      // ✅ Redirect to Home page after login
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate]);

  // Handle Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
      setError(null);
    } catch (error) {
      console.error("Forgot Password error:", error.message);
      setError("Error sending reset email. Please check your email.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Forgot Password */}
        <p>
          <button className="forgot-password-btn" onClick={handleForgotPassword} disabled={loading}>
            Forgot Password?
          </button>
        </p>

        {/* Sign Up Redirect */}
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
