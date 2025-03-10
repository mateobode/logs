import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import { formatDateTime, getSeverityColor, truncateText } from '../../utils/formatters';

const LogItem = ({ log }) => {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <Badge
              bg="secondary"
              style={{ backgroundColor: getSeverityColor(log.severity) }}
              className="me-2"
            >
              {log.severity}
            </Badge>
            <small className="text-muted">{formatDateTime(log.timestamp)}</small>
          </div>
          <Badge bg="light" text="dark">{log.source}</Badge>
        </div>
        <Card.Text className="mb-2">
          {truncateText(log.message, 120)}
        </Card.Text>
        <div className="d-flex justify-content-end">
          <Link to={`/logs/${log.id}`} className="btn btn-sm btn-outline-primary">
            View Details
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LogItem;