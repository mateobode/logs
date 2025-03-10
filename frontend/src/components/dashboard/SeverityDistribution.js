import React from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SEVERITY_LEVELS } from '../../utils/constants';
import { getSeverityColor } from '../../utils/formatters';

const SeverityDistribution = ({ data }) => {
  // Format data for chart
  const chartData = data?.by_severity?.map(item => ({
    name: item.severity,
    value: item.count,
    color: getSeverityColor(item.severity)
  })) || [];

  return (
    <Card className="shadow-sm mb-4 h-100">
      <Card.Header>
        <h5 className="mb-0">Severity Distribution</h5>
      </Card.Header>
      <Card.Body>
        <div style={{ width: '100%', height: 250 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} logs`, 'Count']} />
                <Legend />
              </PieChart>
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

export default SeverityDistribution;