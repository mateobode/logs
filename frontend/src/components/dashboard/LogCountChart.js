import React from 'react';
import { Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDate } from '../../utils/formatters';

const LogCountChart = ({ data }) => {
  // Format data for chart
  const chartData = data?.by_date?.map(item => ({
    date: formatDate(item.timestamp__date),
    count: item.count
  })) || [];

  // Sort by date in ascending order
  chartData.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header>
        <h5 className="mb-0">Log Activity Over Time</h5>
      </Card.Header>
      <Card.Body>
        <div style={{ width: '100%', height: 300 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Log Count"
                  stroke="#007bff"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100">
              <p className="text-muted">No data available for the selected period</p>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default LogCountChart;