import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { UserProvider, useUser } from "./UserContext"; // Import UserContext

import "./index.css";
import "./fonts.css";
const container = document.getElementById("root");
const root = createRoot(container);

if (process.env.NODE_ENV === "development") {
  root.render(
    <React.StrictMode>
      <UserProvider>
        <Router>
          <App />
        </Router>
      </UserProvider>
    </React.StrictMode>
  );
} else {
  root.render(
    <UserProvider>
      <Router>
        <App />
      </Router>
    </UserProvider>
  );
}