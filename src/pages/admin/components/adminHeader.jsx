import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const AdminHeader = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: 'orange' }}>
      <Toolbar>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            width: '100%' 
          }}
        >
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ fontWeight: 'bold', textAlign: 'center' }}
          >
            Admin Panel Logo
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
