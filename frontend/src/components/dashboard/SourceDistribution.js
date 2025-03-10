import React from 'react';
import { Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SourceDistribution = ({ data }) => {
  // Format data for chart
  const chartData = data?.by_source?.map(item => ({
    name: item.source,
    count: item.count
  })) || [];

  // Sort by count in descending order
  chartData.sort((a, b) => b.count - a.count);

  return (
    <Card className="shadow-sm mb-4 h-100">
      <Card.Header>
        <h5 className="mb-0">Source Distribution</h5>
      </Card.Header>
      <Card.Body>
        <div style={{ width: '100%', height: 250 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Log Count" fill="#20c997" />
              </BarChart>
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

export default SourceDistribution;