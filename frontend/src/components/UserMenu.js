import React from 'react';
import { Menu, MenuItem, Divider, Typography, ListItemIcon } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const UserMenu = ({ anchorEl, handleMenuClose, handleLogout, userEmail }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem disabled>
        <Typography variant="body2" color="text.secondary">
          {userEmail}
        </Typography>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        Sign Out
      </MenuItem>
    </Menu>
  );
};

export default UserMenu;
