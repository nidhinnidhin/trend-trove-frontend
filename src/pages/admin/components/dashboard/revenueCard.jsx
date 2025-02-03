import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const RevenueCard = ({ title, amount, percent }) => {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4">{amount}</Typography>
        <Typography variant="body2" color={percent.includes('+') ? 'green' : 'red'}>
          {percent}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RevenueCard;