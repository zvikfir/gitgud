import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Navigation from "./components/Navigation";
import Main from "./components/Main";
import axios from "axios";
import { useUser } from "./UserContext"; // Import UserContext
import Login from "./components/Login";
import Header from "./components/Header"; // Import Header component
import Footer from "./components/Footer"; // Import Footer component
import Loading from "./components/Loading"; // Add this import
import { LoadingProvider, useLoading } from "./LoadingContext"; // Import LoadingContext
import FailedLogin from "./components/FailedLogin"; // Import FailedLogin component

import { ThemeProvider, createTheme } from '@mui/material/styles';
import packageJson from "../package.json"; // Import package.json
import { COLORS } from './constants/colors';

const AppContent = () => {
  let [authenticated, setAuthenticated] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const { isLoading } = useLoading();
  const navigate = useNavigate();
  const { setUser } = useUser();
  const clientVersion = packageJson.version;
  const [serverVersion, setServerVersion] = useState(() => {
    // Try to get cached version first
    return sessionStorage.getItem('serverVersion') || "";
  });

  useEffect(() => {
    let mounted = true;
    
    // Only fetch if we don't have authentication status yet
    if (!authenticated && appLoading) {
      Promise.all([
        axios.get("/api/users", { withCredentials: true }),
        // Only fetch version if not cached
        !serverVersion ? axios.get("/api/version") : Promise.resolve({ data: { version: serverVersion } })
      ])
        .then(([userResponse, versionResponse]) => {
          if (!mounted) return;
          
          setAuthenticated(true);
          setUser(userResponse.data);
          
          // Cache the server version
          const version = versionResponse.data.version;
          setServerVersion(version);
          sessionStorage.setItem('serverVersion', version);
        })
        .catch((error) => {
          if (!mounted) return;
          setAuthenticated(false);
        })
        .finally(() => {
          if (mounted) {
            setAppLoading(false);
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, [authenticated, appLoading, setUser, serverVersion]);

  if (appLoading) {
    return <Loading />;
  }

  if (!authenticated && window.location.pathname !== "/failed-login") {
    return <Login />;
  }
  else if (!authenticated && window.location.pathname === "/failed-login") {
    return <FailedLogin />;
  }

  // Define a custom theme with your specified colors
  const customTheme = createTheme({
    palette: {
      primary: {
        main: COLORS.primary,
      },
      secondary: {
        main: COLORS.secondary,
      },
      background: {
        default: '#ecf0f1',
      },
      text: {
        primary: '#333',
      },
    },
  });

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "rgb(249, 250, 251)",
        }}
      >
        <CssBaseline />
        <Navigation />
        <Main />
        <Footer clientVersion={clientVersion} serverVersion={serverVersion} />
      </Box>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
};

export default App;
