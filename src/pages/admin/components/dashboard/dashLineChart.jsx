import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: '2022-01-01', amount: 500 },
  { date: '2022-01-02', amount: 600 },
  { date: '2022-01-03', amount: 800 },
  { date: '2022-01-04', amount: 700 },
  { date: '2022-01-05', amount: 850 },
];

const DashLineChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DashLineChart;
