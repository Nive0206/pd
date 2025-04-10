import React, { useState, useCallback } from "react";
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Signup.css";
import { auth, db, storage } from "../firebaseConfig";

const countryStateMap = {
  India: ["Tamil Nadu", "Kerala", "Karnataka", "Maharashtra"],
  USA: ["California", "Texas", "New York", "Florida"],
};

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    gender: "",
    email: "",
    phoneNumber: "",
    country: "",
    state: "",
    address: "",
    pincode: "",
    needAvatar: "",
    height: "",
    weight: "",
    waistSize: "",
    hipSize: "",
    skinTone: "",
    avatarImage: null,
  });

  const [showAvatarDetails, setShowAvatarDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [states, setStates] = useState([]);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "needAvatar") {
      setShowAvatarDetails(value === "yes");
    }
    
    if (name === "country") {
      setStates(countryStateMap[value] || []);
      setFormData((prev) => ({ ...prev, state: "" })); // Reset state
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    setFormData({ ...formData, avatarImage: e.target.files[0] });
  };

  // Handle signup with email verification
  const handleSignup = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      console.log("User created:", user);

      // Send verification email
      await sendEmailVerification(user);
      setEmailSent(true);
      alert("A verification email has been sent. Please verify before proceeding.");

      // Polling for email verification
      const checkVerification = setInterval(async () => {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(checkVerification);
          proceedWithSignup(user);
        }
      }, 5000);

    } catch (error) {
      console.error("Signup Error:", error);
      setError(error.message);
      setLoading(false);
    }
  }, [formData.email, formData.password]);

  // Proceed with storing user data
  const proceedWithSignup = async (user) => {
    setLoading(true);
    let imageUrl = "";

    try {
      if (formData.avatarImage) {
        const storageRef = ref(storage, `avatars/${user.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, formData.avatarImage);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => {
              console.error("Upload Error:", error);
              reject(error);
            },
            async () => {
              imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
              console.log("Image uploaded:", imageUrl);
              resolve();
            }
          );
        });
      }

      await updateProfile(user, { displayName: formData.fullName, photoURL: imageUrl });

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        country: formData.country,
        state: formData.state,
        address: formData.address,
        pincode: formData.pincode,
        needAvatar: formData.needAvatar,
        ...(formData.needAvatar === "yes" && {
          height: formData.height,
          weight: formData.weight,
          waistSize: formData.waistSize,
          hipSize: formData.hipSize,
          skinTone: formData.skinTone,
        }),
        avatarImage: imageUrl,
        createdAt: new Date(),
      });

      // Store minimal required data in localStorage for quick access
      localStorage.setItem('userData', JSON.stringify({
        uid: user.uid,
        name: formData.fullName,
        email: formData.email,
        cart: []
      }));

      console.log("User data stored successfully.");
      alert("Signup Successful! You can now log in.");
      navigate("/");

    } catch (error) {
      console.error("Error completing signup:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      {error && <p className="error-message">{error}</p>}
      {emailSent && <p className="info-message">Check your email and verify before proceeding.</p>}

      <form onSubmit={handleSignup}>
        <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

        <div className="radio-group">
          <label>Gender:</label>
          <input type="radio" name="gender" value="male" onChange={handleChange} required /> Male
          <input type="radio" name="gender" value="female" onChange={handleChange} required /> Female
        </div>

        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} required />

        <select name="country" value={formData.country} onChange={handleChange} required>
          <option value="">Select Country</option>
          {Object.keys(countryStateMap).map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        {states.length > 0 && (
          <select name="state" value={formData.state} onChange={handleChange} required>
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        )}

        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />

        <div className="radio-group">
          <label>Do you need an avatar?</label>
          <input type="radio" name="needAvatar" value="yes" onChange={handleChange} required /> Yes
          <input type="radio" name="needAvatar" value="no" onChange={handleChange} required /> No
        </div>

        {showAvatarDetails && (
          <div>
            <input type="number" name="height" placeholder="Height (cm)" value={formData.height} onChange={handleChange} required />
            <input type="number" name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required />
            <input type="number" name="waistSize" placeholder="Waist Size (cm)" value={formData.waistSize} onChange={handleChange} required />
            <input type="number" name="hipSize" placeholder="Hip Size (cm)" value={formData.hipSize} onChange={handleChange} required />
            <input type="file" name="avatarImage" onChange={handleImageChange} accept="image/*" required />
          </div>
        )}

        <button type="submit" disabled={loading}>{loading ? "Signing Up..." : "Sign Up"}</button>
      </form>

      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default Signup;
