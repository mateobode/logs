import React from 'react';
import { Spinner } from 'react-bootstrap';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5">
      <Spinner animation="border" role="status" variant="primary" />
      <span className="mt-2">{text}</span>
    </div>
  );
};