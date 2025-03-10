import React, { useState } from 'react';
import { Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { SEVERITY_LEVELS } from '../../utils/constants';
import { useFilters } from '../../context/FilterContext';

export const FilterPanel = ({
  title = "Filter Logs",
  applyButtonText = "Apply Filters",
  onApply = null
}) => {
  const { filters, errors, updateFilter, resetFilters, getQueryParams } = useFilters();

  // Track UI state
  const [backendError, setBackendError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [nonFieldErrors, setNonFieldErrors] = useState([]);

  /**
   * Handle input change and apply transformations
   * @param {Event} e - Change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateFilter(name, value);

    // Clear backend error when user makes changes
    if (backendError) {
      setBackendError(null);
    }
  };

  /**
   * Handle filter form submission
   * @param {Event} e - Submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear any previous errors
    setNonFieldErrors([]);

    // Check if there are validation errors
    if (Object.keys(errors).length > 0) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    // This is just client-side validation for common issues
    try {
      const params = getQueryParams();

      // Basic client-side validation
      if (params.source && params.source.length < 2) {
        setNonFieldErrors(['Source should be at least 2 characters long']);
        setShowAlert(true);
        return;
      }

      // Call the onApply handler if provided
      if (onApply) {
        onApply();
      }

      console.log('Filters applied:', params);
    } catch (err) {
      console.error('Error in filter validation:', err);
      setBackendError(err.message || 'An error occurred applying filters');
    }
  };

  return (
    <div className="filter-panel p-3 mb-4 border rounded bg-light">
      <h5 className="mb-3">{title}</h5>

      {/* Validation errors alert */}
      {(showAlert && Object.keys(errors).length > 0) || nonFieldErrors.length > 0 ? (
        <Alert variant="danger" onClose={() => {
          setShowAlert(false);
          setNonFieldErrors([]);
        }} dismissible>
          <Alert.Heading>Validation Errors</Alert.Heading>
          <ul className="mb-0">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
            {nonFieldErrors.map((error, index) => (
              <li key={`non-field-${index}`}>{error}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {/* Backend error alert */}
      {backendError && (
        <Alert variant="danger" onClose={() => setBackendError(null)} dismissible>
          <Alert.Heading>API Error</Alert.Heading>
          <p>{backendError}</p>
        </Alert>
      )}

      {/* Filter form */}
      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Date filters */}
          <Col md={6} lg={3}>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleInputChange}
                isInvalid={!!errors.startDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors.startDate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6} lg={3}>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleInputChange}
                isInvalid={!!errors.endDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors.endDate}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Severity filter */}
          <Col md={6} lg={3}>
            <Form.Group className="mb-3">
              <Form.Label>Severity</Form.Label>
              <Form.Select
                name="severity"
                value={filters.severity}
                onChange={handleInputChange}
                isInvalid={!!errors.severity}
              >
                <option value="">All Severities</option>
                {SEVERITY_LEVELS.map(severity => (
                  <option key={severity.value} value={severity.value}>
                    {severity.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.severity}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Severity must be uppercase (automatically converted)
              </Form.Text>
            </Form.Group>
          </Col>

          {/* Source filter */}
          <Col md={6} lg={3}>
            <Form.Group className="mb-3">
              <Form.Label>Source</Form.Label>
              <Form.Control
                type="text"
                name="source"
                value={filters.source}
                onChange={handleInputChange}
                placeholder="Filter by source"
                isInvalid={!!errors.source}
              />
              <Form.Control.Feedback type="invalid">
                {errors.source}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Source will be converted to lowercase
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Form actions */}
        <div className="d-flex justify-content-end">
          <Button
            variant="secondary"
            className="me-2"
            onClick={resetFilters}
            type="button"
          >
            Reset
          </Button>
          <Button variant="primary" type="submit">
            {applyButtonText}
          </Button>
        </div>
      </Form>
    </div>
  );
};