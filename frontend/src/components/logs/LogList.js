import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LogAPI from '../../api/api';
import { FilterPanel, LoadingSpinner, Pagination, Breadcrumb } from '../common';
import LogItem from './LogItem';
import { useFilters } from '../../context/FilterContext';

/**
 * LogList Component - Displays a paginated, filterable list of logs
 */
const LogList = () => {
  // Component state
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [nonFieldErrors, setNonFieldErrors] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    count: 0
  });

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

    console.log("Processing API error response:", data);

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

    console.log("Processed validation errors:", newValidationErrors);
    console.log("Processed non-field errors:", newNonFieldErrors);

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
   * Fetch logs from API
   * @param {number} page - Page number
   */
  const fetchLogs = async (page = 1) => {
    try {
      // Don't fetch if there are filter validation errors
      if (Object.keys(filterErrors).length > 0) {
        console.warn('Not fetching logs due to filter validation errors:', filterErrors);
        setError('Please correct the filter validation errors before fetching logs.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setValidationErrors({});
      setNonFieldErrors([]);

      // Get filter params from context
      const params = {
        ...getQueryParams(),
        page
      };

      let hasValidationErrors = false;

      try {
        // Try to use queryLogs first (better filtering)
        const response = await LogAPI.queryLogs(params);

        setLogs(response.results || []);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil((response.count || 0) / 5), // Assuming page size is 5
          count: response.count || 0
        });
      } catch (err) {
        console.error('Error fetching logs:', err);

        // Handle API error response
        if (err.originalError?.response) {
          const { validationErrors, nonFieldErrors } = processApiErrorResponse(err.originalError.response);

          // Set validation errors state
          setValidationErrors(validationErrors);
          setNonFieldErrors(nonFieldErrors);

          // Check if we have actual validation errors
          hasValidationErrors = Object.keys(validationErrors).length > 0 || nonFieldErrors.length > 0;

          // Generate user-friendly error message
          const validationMessage = getErrorMessageFromValidation(validationErrors);

          if (validationMessage) {
            setError(validationMessage);
          } else if (nonFieldErrors.length > 0) {
            setError('Validation error: ' + nonFieldErrors.join(', '));
          } else if (err.originalError.response.status === 404) {
            // No logs is not an error state, just empty results
            setLogs([]);
            setPagination({
              currentPage: 1,
              totalPages: 1,
              count: 0
            });
            setError(null);
          } else {
            setError(err.message || 'Failed to fetch logs. Please try again later.');
          }
        } else {
          setError(err.message || 'Failed to fetch logs. Please try again later.');
        }

        // Only try fallback if we don't have validation errors
        // This is the key fix - we skip the fallback if there are validation errors
        if (!hasValidationErrors) {
          try {
            console.log("No validation errors, trying fallback API endpoint");
            const basicResponse = await LogAPI.getLogs(params);

            setLogs(basicResponse.results || []);
            setPagination({
              currentPage: page,
              totalPages: Math.ceil((basicResponse.count || 0) / 5),
              count: basicResponse.count || 0
            });

            // Clear error only if fallback succeeded
            setError(null);
            setValidationErrors({});
            setNonFieldErrors([]);
          } catch (fallbackErr) {
            console.error('Fallback also failed:', fallbackErr);
            // Keep original error if fallback also fails
          }
        } else {
          console.log("Not trying fallback because we have validation errors");
        }
      }
    } catch (err) {
      console.error('Unexpected error in fetchLogs:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs when component mounts
  useEffect(() => {
    fetchLogs(1);
  }, []);

  // REMOVED: Auto-filtering effect that was causing filters to apply automatically

  /**
   * Handle page change
   * @param {number} page - New page number
   */
  const handlePageChange = (page) => {
    fetchLogs(page);
  };

  /**
   * Handle CSV download
   */
  const handleDownloadCSV = async () => {
    try {
      setError(null);

      // Check for filter validation errors
      if (Object.keys(filterErrors).length > 0) {
        setError('Please correct the filter validation errors before downloading CSV.');
        return;
      }

      await LogAPI.downloadCSV(getQueryParams());
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setError('Failed to download CSV. ' + (err.message || 'Please try again later.'));
    }
  };

  // Breadcrumb configuration
  const breadcrumbItems = [
    { label: 'Filter Logs', path: '/logs' }
  ];

  // Show loading spinner while fetching data
  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <Breadcrumb items={breadcrumbItems} />

          {/* Page header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Filter Logs</h2>
            <div>
              <Button
                variant="outline-secondary"
                className="me-2"
                onClick={handleDownloadCSV}
              >
                Download CSV
              </Button>
              <Link to="/logs/create" className="btn btn-primary">
                Create New Log
              </Link>
            </div>
          </div>

          {/* Filter panel */}
          <FilterPanel
            title="Filter Logs"
            applyButtonText="Apply Filters"
            onApply={() => fetchLogs(1)}
          />

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

          {/* Log list */}
          {logs.length === 0 ? (
            <Card className="text-center p-5">
              <Card.Body>
                <Card.Title>No logs found</Card.Title>
                <Card.Text>
                  No logs match your current filter criteria. Try adjusting your filters or create a new log.
                </Card.Text>
                <Link to="/logs/create" className="btn btn-primary">
                  Create New Log
                </Link>
              </Card.Body>
            </Card>
          ) : (
            <>
              <p className="text-muted mb-3">
                Showing {logs.length} of {pagination.count} logs
              </p>
              {logs.map(log => (
                <LogItem key={log.id} log={log} />
              ))}
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default LogList;