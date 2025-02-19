import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const DashLineChart = ({ data = [] }) => {
  const formatData = (orders) => {
    const groupedData = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: 0,
          orders: 0,
          returns: 0
        };
      }
      
      acc[date].revenue += order.totalAmount;
      acc[date].orders += 1;
      if (order.orderStatus === 'returned') acc[date].returns += 1;
      
      return acc;
    }, {});

    return Object.values(groupedData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  };

  const formattedData = formatData(data);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="date" 
          stroke="#fff"
          tick={{ fill: '#fff' }}
        />
        <YAxis 
          stroke="#fff"
          tick={{ fill: '#fff' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#424242', 
            border: '1px solid #666',
            borderRadius: '4px'
          }}
          labelStyle={{ color: '#fff' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#FF9800" 
          strokeWidth={2}
          dot={{ fill: '#FF9800' }}
        />
        <Line 
          type="monotone" 
          dataKey="orders" 
          stroke="#4CAF50" 
          strokeWidth={2}
          dot={{ fill: '#4CAF50' }}
        />
        <Line 
          type="monotone" 
          dataKey="returns" 
          stroke="#f44336" 
          strokeWidth={2}
          dot={{ fill: '#f44336' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DashLineChart;
