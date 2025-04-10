import React from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <h2>Logging Out...</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
