import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material';

const ResetPasswordModal = ({ open, handleClose, onPasswordReset }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const validatePassword = (password) => {
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return password.length >= 8 && specialCharRegex.test(password);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async () => {
    try {
      // Validate passwords
      if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
        setError('All fields are required');
        return;
      }

      if (!validatePassword(formData.newPassword)) {
        setError('Password must be at least 8 characters long and contain at least one special character');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      const token = localStorage.getItem('usertoken');
      const response = await fetch('http://localhost:9090/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      onPasswordReset('Password reset successfully');
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#222', color: 'white' }}>
        Reset Password
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
          <TextField
            name="oldPassword"
            label="Current Password"
            type="password"
            value={formData.oldPassword}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="newPassword"
            label="New Password"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            fullWidth
            helperText="Password must be at least 8 characters with one special character"
          />
          <TextField
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{ 
            backgroundColor: '#222',
            '&:hover': { backgroundColor: '#444' }
          }}
        >
          Reset Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordModal; 