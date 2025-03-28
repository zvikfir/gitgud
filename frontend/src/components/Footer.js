import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const Footer = ({ clientVersion, serverVersion }) => {
  return (
    <Box component="footer" sx={{ p: 2, pt: 0, pb: 0 }}>
      <Typography variant="caption" sx={{ color: '#666', textAlign: 'right', display: 'block', mt: 1 }}>
        Version: {clientVersion} | {serverVersion}
      </Typography>
    </Box>
  );
};

export default Footer;
