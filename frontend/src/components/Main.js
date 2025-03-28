import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '../pages/Home';
import Policies from '../pages/Policies';
import Events from '../pages/Events';
import Event from '../pages/Event';
import Projects from '../pages/Projects';
import Project from '../pages/Project';
import Loading from '../components/Loading'; // Import the Loading component
import Badge from '../pages/Badge';
import AddProject from "../pages/AddProject"; // Import your new component
import Policy from "../pages/Policy"; // Import your new component
import BadgeManagement from "../pages/management/Badges"; // Import your new component
import BadgeManagementAdd from "../pages/management/BadgesAdd"; // Import your new component
import KPIsManagement from "../pages/management/KPIs"; // Import your new component
import KPIsManagementAdd from "../pages/management/KPIsAdd"; // Import your new component
import StacksManagement from "../pages/management/Stacks";
import StacksManagementAdd from "../pages/management/StacksAdd";
import StackProjects from '../pages/management/StackProjects'; // Import your new component
import { Box } from '@mui/material'; // Import Box from MUI
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';


const drawerWidth = 280; // Update to match Navigation.js

const Main = () => {
  const [loading, setLoading] = useState(true); // Initial loading state
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isSmallScreen);

  useEffect(() => {
    setDrawerOpen(!isSmallScreen);
  }, [isSmallScreen]);

  // useEffect(() => {
  //   // Show loading indicator for 3 seconds on initial load
  //   setLoading(true);
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 3000);

  //   return () => clearTimeout(timer); // Clean up the timer on unmount
  // }, []);

  useEffect(() => {
    // Show loading indicator during route changes
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // shorter delay for route changes

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, [location]);

  if (loading) {
    return (
      <Box
        component="div"
        sx={{
          flexGrow: 1,
          bgcolor: 'rgb(249, 250, 251)',
          mx: 'auto',
          transition: 'margin-left 0.3s',
          ml: {
            xs: '16px',
            md: drawerOpen ? `${drawerWidth + 32}px` : '72px', // 72px accounts for collapsed drawer + spacing
          },
          mr: '16px',
          mt: 0,
          mb: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '95vh',
        }}
      >
        <Loading />;
      </Box>
    )
  }

  return (
    <Box
      component="div"
      sx={{
        flexGrow: 1,
        bgcolor: 'rgb(249, 250, 251)',
        mx: 'auto',
        transition: 'margin-left 0.3s',
        ml: {
          xs: '16px',
          md: drawerOpen ? `${drawerWidth + 32}px` : '72px', // 72px accounts for collapsed drawer + spacing
        },
        mr: '16px',
        mt: 0,
        mb: 0,
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/policies/new" element={<Policy />} />
        <Route path="/policies/:id" element={<Policy />} />
        <Route path="/policies/:id/edit" element={<Policy />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<Event />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<Project />} />
        <Route path="/projects/add" element={<AddProject />} />
        <Route path="/badges/:id" element={<Badge />} />
        <Route path="/management/badges" element={<BadgeManagement />} />
        <Route path="/management/badges/add" element={<BadgeManagementAdd />} />
        <Route path="/management/kpis" element={<KPIsManagement />} />
        <Route path="/management/kpis/add" element={<KPIsManagementAdd />} />
        <Route path="/stacks" element={<StacksManagement />} />
        <Route path="/stacks/add" element={<StacksManagementAdd />} />
        <Route path="/stacks/:id" element={<StackProjects />} />

      </Routes>
    </Box>
  );
};

export default Main;
