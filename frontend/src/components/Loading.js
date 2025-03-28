import React from 'react';
import Box from '@mui/material/Box';
import { BestPracticesKPI, ComplianceKPI, ResilienceKPI } from './KPIShapes';
import logo from '../assets/logo.svg';

const Loading = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        bgcolor: 'rgb(249, 250, 251)',
        zIndex: 1000,
        pt: 4
      }}
    >
      <img
        src={logo}
        alt="gitgud Logo"
        style={{ width: "120px", height: "120px", marginBottom: "25px" }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <BestPracticesKPI size={32} animated delay={0} sx={{ mx: 1 }} />
        <ComplianceKPI size={32} animated delay={0.5} sx={{ mx: 1 }} />
        <ResilienceKPI size={32} animated delay={1} sx={{ mx: 1 }} />
      </Box>
    </Box>
  );
};

export default Loading;
