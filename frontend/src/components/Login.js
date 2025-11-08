import React from "react";
import logo from '../assets/logo.svg';
const Login = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:3001/gitlab/auth";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <img src={logo} alt="Badger Logo" style={{ width: "150px", height: "150px", marginBottom: "20px" }} />
      <h2>Login to gitgud</h2>
      <button onClick={handleLogin} style={{ backgroundColor: "#FC6D26", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontSize: "1rem" }}>
        Authenticate with GitLab
      </button>
    </div>
  );
};

export default Login;
