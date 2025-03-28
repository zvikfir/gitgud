import React, { useState, useEffect } from "react";

import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PolicyIcon from "@mui/icons-material/Policy";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import UserMenu from "./UserMenu";
import MenuIcon from "@mui/icons-material/Menu";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import logo from '../assets/logo.svg'
import { keyframes } from '@mui/system';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Paper from "@mui/material/Paper"; // Add this import

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

const drawerWidth = 280; // Increased from 240

const Navigation = () => {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [dashboardItems, setDashboardItems] = useState([]);
  const { user, setUser } = useUser(); // Make sure setUser is included in the context
  const userType = user?.type; // Assuming user type is available in user object
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isSmallScreen);

  // Add this useEffect to handle screen size changes
  useEffect(() => {
    setDrawerOpen(!isSmallScreen);
  }, [isSmallScreen]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Handle the logout logic here
    handleMenuClose();
    window.location.replace("/gitlab/auth/logout"); // Navigate without adding to history
  };

  const handleNavItemClick = () => {
    setDrawerOpen(false);
  };

  const policyItems = [
    { text: "Home", path: "/" },
    { text: "Software Stacks", path: "/stacks" }, // Updated path
    { text: "Projects", path: "/projects" },
    { text: "Policies", path: "/policies" },
   
    //{ text: "KPIs & Badges", path: "/management/kpis" },
    //{ text: "Badges", path: "/management/badges" },

    //{ text: "Ownership", path: "/management/badges" },
    //{ text: "Contributors", path: "/management/badges" },
    //{ text: "Events", path: "/events" },
  ];

  const fetchBadges = async () => {
    try {
      //const endpoint = "http://localhost:3001/api";
      const response = await fetch(`/api/badges`);
      if (!response.ok) {
        throw new Error("Failed to fetch badges");
      }
      const data = await response.json();
      let _dashboardItems = [];
      data.results.forEach((badge) => {
        _dashboardItems.push({ text: badge.name, path: `/badges/${badge.id}` });
      });
      setDashboardItems(_dashboardItems);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  // Fetch events data from the API when the component mounts
  useEffect(() => {
    fetchBadges();
  }, []);

  const isActive = (path) => location.pathname.endsWith(path);

  return (
    <>
      {isSmallScreen && (
        <IconButton
          onClick={toggleDrawer}
          sx={{
            position: 'fixed',
            left: drawerOpen ? drawerWidth : 16,
            top: 16,
            zIndex: 1202,
            bgcolor: 'white',
            boxShadow: 3,
            borderRadius: '4px',
            transition: 'left 0.3s',
            '&:hover': {
              bgcolor: 'white',
            },
          }}
        >
          {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      )}

      <Drawer
        variant={isSmallScreen ? "temporary" : "permanent"}
        open={drawerOpen}
        onClose={() => isSmallScreen && setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiPaper-root': {
            height: 'calc(100% - 32px)',
            width: drawerWidth, // Update width here too
            top: '16px',
            bottom: '16px',
            left: '16px',
            borderRadius: '4px',
            backgroundColor: 'white',
            boxShadow: '0 3px 10px rgb(0 0 0 / 0.2)',
            border: 'none',
            transform: isSmallScreen && !drawerOpen ? 'translateX(-100%)' : 'none',
            transition: 'transform 0.3s',
          },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: 2,
            gap: 1,
          }}
        >
          <Link 
            to="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              minWidth: 'fit-content'  // Prevent logo from shrinking
            }}
          >
            <img src={logo} alt="gitgud Logo" style={{ width: "36px", height: "36px" }} />
            <Typography variant="h6" sx={{ fontSize: '1.6rem', marginLeft: 2, fontWeight: 700, color: '#333' }}>
              gitgud
            </Typography>
          </Link>
          
          <Box
           
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '40px !important',  // Fixed height
              marginLeft: 'auto',  // Push to the right
              borderRadius: '20px',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
              },
              width: 'auto !important'
            }}
          >
            <Avatar 
              src={user?.avatarUrl} 
              sx={{ 
                height: '32px', 
                width: '32px',
                margin: '4px',
                mr: 0
              }} 
            />
            <IconButton 
              onClick={handleMenuOpen}
              size="small"
              sx={{ 
                height: '32px',
                width: '32px',
                margin: '4px',
                ml: 0
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <UserMenu
            anchorEl={anchorEl}
            handleMenuClose={handleMenuClose}
            handleLogout={handleLogout}
            userEmail={`${user?.emails[0].value}`}
          />
        </Box>
        <Divider sx={{ opacity: 0.6 }} />

        {/* Main Navigation Sections */}
{/* 
        <>
          <Box sx={{ flexGrow: user.userTypeId > 3 ? 1 : 0}}>
            <List
              subheader={
                <ListSubheader
                  sx={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color: "text.primary",
                    lineHeight: "2",
                    paddingY: "8px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <DashboardIcon sx={{ marginRight: 1 }} /> Dashboards
                </ListSubheader>
              }
            >
              {dashboardItems.map((item, index) => (
                <ListItem
                  button
                  component={Link}
                  to={item.path}
                  key={index}
                  selected={isActive(item.path)}
                  onClick={handleNavItemClick}
                  sx={{ paddingLeft: 6 }}
                >
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "1rem",
                      fontWeight: "medium",
                    }}
                  />
                </ListItem>
              ))}
            </List>

          </Box>
          <Divider sx={{ opacity: 0.6 }} />
        </> */}


        {user.userTypeId < 3 && (
          <>
            <Box sx={{ flexGrow: 1 }}>
              {/* <List
                subheader={
                  <ListSubheader
                    sx={{
                      fontSize: "1rem",
                      fontWeight: "bold",
                      color: "text.primary",
                      lineHeight: "2",
                      paddingY: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <PolicyIcon sx={{ marginRight: 1 }} /> Management
                  </ListSubheader>
                }
              > */}
                {policyItems.map((item, index) => (
                  <ListItem
                    button
                    component={Link}
                    to={item.path}
                    key={index}
                    selected={isActive(item.path)}
                    onClick={handleNavItemClick}
                    sx={{ paddingLeft: 6 }}
                  >
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: "1rem",
                        fontWeight: "medium",
                      }}
                    />
                  </ListItem>
                ))}
              {/* </List> */}
            </Box>
            <Divider sx={{ opacity: 0.6 }} />
          </>
        )}


        {/* Settings Item at the Bottom */}
        <Box sx={{ padding: "8px" }}>
          <ListItem
            button
            component={Link}
            to="/settings"
            onClick={handleNavItemClick}
            sx={{ paddingLeft: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{
                fontSize: "1rem",
                fontWeight: "medium",
              }}
            />
          </ListItem>
        </Box>
      </Drawer>
    </>
  );
};

export default Navigation;
