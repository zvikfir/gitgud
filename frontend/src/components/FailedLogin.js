import React from "react";
import { useNavigate } from "react-router-dom";

const FailedLogin = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate("/gitlab/auth");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <h2>Login Failed</h2>
      <p>We were unable to log you in with GitLab. Please try again.</p>
      <button onClick={handleRetry} style={{ backgroundColor: "#FC6D26", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontSize: "1rem" }}>
        Retry Login
      </button>
    </div>
  );
};

export default FailedLogin;
