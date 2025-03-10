import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import LogAPI from '../../api/api';
import { FilterPanel, LoadingSpinner } from '../common';
import LogCountChart from './LogCountChart';
import SeverityDistribution from './SeverityDistribution';
import SourceDistribution from './SourceDistribution';
import { useFilters } from '../../context/FilterContext';

export const Dashboard = () => {
  // Component state
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [nonFieldErrors, setNonFieldErrors] = useState([]);

  // Get filters from context
  const { filters, getQueryParams, errors: filterErrors } = useFilters();

  /**
   * Process API error response to extract field and non-field errors
   * @param {Object} response - Error response from API
   * @returns {Object} - Processed errors
   */
  const processApiErrorResponse = (response) => {
    const { data, status } = response;
    const newValidationErrors = {};
    const newNonFieldErrors = [];

    // Process 400 validation errors
    if (status === 400 && typeof data === 'object') {
      // Handle nested error structure that comes from backend
      if (data.error && typeof data.error === 'object') {
        // Process each field in the nested error object
        Object.entries(data.error).forEach(([field, fieldErrors]) => {
          if (field === 'non_field_errors') {
            if (Array.isArray(fieldErrors)) {
              newNonFieldErrors.push(...fieldErrors.map(String));
            } else if (typeof fieldErrors === 'string') {
              newNonFieldErrors.push(fieldErrors);
            } else {
              newNonFieldErrors.push(JSON.stringify(fieldErrors));
            }
          } else {
            // Convert field errors to string format
            if (Array.isArray(fieldErrors)) {
              newValidationErrors[field] = fieldErrors.join(', ');
            } else if (typeof fieldErrors === 'string') {
              newValidationErrors[field] = fieldErrors;
            } else if (typeof fieldErrors === 'object' && fieldErrors !== null) {
              newValidationErrors[field] = JSON.stringify(fieldErrors);
            } else {
              newValidationErrors[field] = String(fieldErrors);
            }
          }
        });
      } else {
        // Process regular field errors at the top level
        Object.entries(data).forEach(([field, message]) => {
          if (field === 'non_field_errors') {
            if (Array.isArray(message)) {
              newNonFieldErrors.push(...message.map(String));
            } else {
              newNonFieldErrors.push(String(message));
            }
          } else if (field !== 'error') { // Skip 'error' key as we've already processed it above
            if (Array.isArray(message)) {
              newValidationErrors[field] = message.join(', ');
            } else if (typeof message === 'object' && message !== null) {
              newValidationErrors[field] = JSON.stringify(message);
            } else {
              newValidationErrors[field] = String(message);
            }
          }
        });
      }
    }

    return { validationErrors: newValidationErrors, nonFieldErrors: newNonFieldErrors };
  };

  /**
   * Generate user-friendly error message based on validation errors
   * @param {Object} validationErrors - Field-specific errors
   * @returns {string|null} - User-friendly error message or null
   */
  const getErrorMessageFromValidation = (validationErrors) => {
    if (validationErrors.start_date && validationErrors.start_date.includes("No logs exist")) {
      return 'No logs exist for the selected start date. Please choose a different date range.';
    }
    if (validationErrors.end_date && validationErrors.end_date.includes("No logs exist")) {
      return 'No logs exist for the selected end date. Please choose a different date range.';
    }
    if (validationErrors.severity && validationErrors.severity.includes("No logs exist")) {
      return 'No logs with the selected severity level. Please choose a different severity.';
    }
    if (validationErrors.source && validationErrors.source.includes("No logs exist")) {
      return 'No logs from the selected source. Please choose a different source.';
    }

    return null;
  };

  /**
   * Fetch dashboard data from API
   */
  const fetchDashboardData = async () => {
    try {
      // Don't fetch if there are filter validation errors
      if (Object.keys(filterErrors).length > 0) {
        console.warn('Not fetching dashboard data due to filter validation errors:', filterErrors);
        setError('Please correct the filter validation errors before fetching data.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setValidationErrors({});
      setNonFieldErrors([]);

      console.log('Fetching dashboard data...');
      const params = getQueryParams();

      try {
        const data = await LogAPI.getAggregatedLogs(params);
        console.log('Dashboard data fetched successfully:', data);
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);

        // Handle API error response
        if (err.originalError?.response) {
          const { validationErrors, nonFieldErrors } = processApiErrorResponse(err.originalError.response);
          console.log('Processed validation errors:', validationErrors);
          console.log('Processed non-field errors:', nonFieldErrors);

          setValidationErrors(validationErrors);
          setNonFieldErrors(nonFieldErrors);

          // Generate user-friendly error message
          const validationMessage = getErrorMessageFromValidation(validationErrors);

          if (validationMessage) {
            setError(validationMessage);
          } else if (nonFieldErrors.length > 0) {
            setError('Validation error: ' + nonFieldErrors.join(', '));
          } else if (err.originalError.response.status === 404) {
            setError('No logs found for the selected criteria.');
          } else {
            setError(err.message || 'Failed to fetch dashboard data. Please try again later.');
          }
        } else {
          setError(err.message || 'Failed to fetch dashboard data. Please try again later.');
        }
      }
    } catch (err) {
      console.error('Unexpected error in fetchDashboardData:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial load only - without filters
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show loading spinner while fetching data
  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <h2 className="mb-4">Log Analytics Dashboard</h2>

      <FilterPanel title="Aggregate Logs" applyButtonText="Apply Aggregation" onApply={fetchDashboardData} />

      {/* Error display */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          {(Object.keys(validationErrors).length > 0 || nonFieldErrors.length > 0) && (
            <div>
              <hr />
              <h6>Validation Details:</h6>
              <ul className="mb-0">
                {/* Display field errors */}
                {Object.entries(validationErrors).map(([field, message]) => (
                  <li key={field}>
                    {field}: {message}
                  </li>
                ))}
                {/* Display non-field errors */}
                {nonFieldErrors.map((error, index) => (
                  <li key={`non-field-${index}`}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </Alert>
      )}

      {/* Dashboard content */}
      {!error && (
        <>
          {/* Summary cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center shadow-sm mb-4">
                <Card.Body>
                  <h3 className="display-4">{dashboardData?.data?.total_logs || 0}</h3>
                  <Card.Text>Total Logs</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={8}>
              <Card className="shadow-sm mb-4">
                <Card.Header>
                  <h5 className="mb-0">Applied Filters</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col sm={6}>
                      <p><strong>Start Date:</strong> {dashboardData?.filters?.start_date || 'All Time'}</p>
                      <p><strong>End Date:</strong> {dashboardData?.filters?.end_date || 'All Time'}</p>
                    </Col>
                    <Col sm={6}>
                      <p><strong>Severity:</strong> {dashboardData?.filters?.severity || 'All Severities'}</p>
                      <p><strong>Source:</strong> {dashboardData?.filters?.source || 'All Sources'}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row>
            <Col xs={12}>
              <LogCountChart data={dashboardData?.data} />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <SeverityDistribution data={dashboardData?.data} />
            </Col>
            <Col md={6}>
              <SourceDistribution data={dashboardData?.data} />
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};