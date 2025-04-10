import React, { useState, useEffect } from "react";
import { Typography, Button, Container, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { auth } from "../firebaseConfig"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth";
import "../App.css"; // Import CSS for flickering effect

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To prevent flickering

  useEffect(() => {
    // Track authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update state when user logs in or logs out
      setLoading(false); // Stop loading
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Show loading indicator
  }

  if (!user) {
    // If the user is not logged in, show a login/signup prompt
    return (
      <Container sx={{ textAlign: "center", padding: "30px" }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Please log in to access the homepage.
        </Typography>
        <Button variant="contained" color="primary" component={Link} to="/login">
          Login
        </Button>
        <Button variant="contained" color="secondary" component={Link} to="/signup" sx={{ marginLeft: "10px" }}>
          Sign Up
        </Button>
      </Container>
    );
  }

  // Render the Home page after the user logs in
  return (
    <Container
      sx={{
        textAlign: "center",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      {/* Flickering "WELCOME TO ELITE BAZAAR" with dynamic color */}
      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
        className="flicker-text"
        sx={{
          marginBottom: "10px",
          color: "black", // Change color dynamically or keep it fixed
          transition: "color 1s ease-in-out",
        }}
      >
        WELCOME TO ELITE BAZAAR
      </Typography>

      {/* Subtitle: "Best fashion trends" */}
      <Typography variant="h6" color="gray" gutterBottom>
        Best fashion trends for Men & Women
      </Typography>

      {/* Buttons Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/men"
          sx={{ textTransform: "none", fontSize: "16px", fontWeight: "bold" }}
        >
          SHOP MEN
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/women"
          sx={{ textTransform: "none", fontSize: "16px", fontWeight: "bold" }}
        >
          SHOP WOMEN
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
