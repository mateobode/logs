import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import LogAPI from '../../api/api';
import { SEVERITY_LEVELS } from '../../utils/constants';
import { LoadingSpinner, Breadcrumb } from '../common';

/**
 * LogCreate Component - Handles both creating new logs and editing existing ones
 */
const LogCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState({
    message: '',
    severity: 'INFO',
    source: ''
  });

  // UI state
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [nonFieldErrors, setNonFieldErrors] = useState([]);
  const [touched, setTouched] = useState({});

  /**
   * Validate form data against business rules
   * @param {Object} data - Form data to validate
   * @returns {Object} - Validation errors object
   */
  const validateForm = (data) => {
    const errors = {};

    if (!data.message.trim()) {
      errors.message = 'Message is required';
    }

    if (!data.severity) {
      errors.severity = 'Severity is required';
    } else if (!/^[A-Z]+$/.test(data.severity)) {
      errors.severity = 'Severity must be uppercase';
    }

    if (!data.source.trim()) {
      errors.source = 'Source is required';
    } else if (!/^[a-z]+$/.test(data.source)) {
      errors.source = 'Source must be lowercase';
    }

    return errors;
  };

  /**
   * Process API error response to extract field and non-field errors
   * @param {Object} err - Error from API call
   */
  const processApiError = (err) => {
    if (err.originalError?.response?.data) {
      const { data } = err.originalError.response;
      const newValidationErrors = {};
      const newNonFieldErrors = [];

      if (typeof data === 'object') {
        // Process field errors and non-field errors
        Object.entries(data).forEach(([field, message]) => {
          if (field === 'non_field_errors') {
            if (Array.isArray(message)) {
              newNonFieldErrors.push(...message);
            } else {
              newNonFieldErrors.push(String(message));
            }
          } else {
            newValidationErrors[field] = Array.isArray(message)
              ? message.join(', ')
              : String(message);
          }
        });

        setValidationErrors(newValidationErrors);
        setNonFieldErrors(newNonFieldErrors);

        // Set a user-friendly error message
        if (newNonFieldErrors.length > 0) {
          setError('Validation error: ' + newNonFieldErrors.join(', '));
        } else {
          setError('Please correct the validation errors below.');
        }
      } else {
        // Handle string error message
        setError(String(data));
      }
    } else {
      // Handle general error
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  // Validate form data when it changes
  useEffect(() => {
    const errors = validateForm(formData);
    setValidationErrors(prev => ({ ...prev, ...errors }));
  }, [formData]);

  // Fetch log data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchLog = async () => {
        try {
          console.log(`Fetching log ${id} for editing`);
          setLoading(true);
          setError(null);

          const data = await LogAPI.getLog(id);
          console.log('Log data fetched:', data);

          setFormData({
            message: data.message,
            severity: data.severity,
            source: data.source
          });

          // Mark all fields as touched since we're editing existing data
          setTouched({
            message: true,
            severity: true,
            source: true
          });
        } catch (err) {
          console.error(`Error fetching log ${id}:`, err);
          processApiError(err);
        } finally {
          setLoading(false);
        }
      };

      fetchLog();
    }
  }, [id, isEditMode]);

  /**
   * Handle input change with automatic format conversion
   * @param {Event} e - Change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Apply transformations based on backend requirements
    let transformedValue = value;

    if (name === 'severity') {
      transformedValue = value.toUpperCase();
    } else if (name === 'source') {
      transformedValue = value.toLowerCase();
    }

    setFormData(prev => ({
      ...prev,
      [name]: transformedValue
    }));

    // Clear field validation error when field changes
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const errors = { ...prev };
        delete errors[name];
        return errors;
      });
    }
  };

  /**
   * Track touched state for form fields
   * @param {Event} e - Blur event
   */
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show validation errors
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, { all: true });
    setTouched(allTouched);

    // Validate form before submission
    const formErrors = validateForm(formData);
    setValidationErrors(formErrors);

    // Don't submit if there are validation errors
    if (Object.keys(formErrors).length > 0) {
      console.log('Validation errors prevented submission:', formErrors);
      setError('Please correct the validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setNonFieldErrors([]);

    try {
      console.log(`${isEditMode ? 'Updating' : 'Creating'} log with data:`, formData);

      if (isEditMode) {
        await LogAPI.updateLog(id, formData);
        console.log('Log updated successfully');
        navigate(`/logs/${id}`, {
          state: { alert: { type: 'success', message: 'Log updated successfully!' } }
        });
      } else {
        const newLog = await LogAPI.createLog(formData);
        console.log('Log created successfully:', newLog);
        navigate(`/logs/${newLog.id}`, {
          state: { alert: { type: 'success', message: 'Log created successfully!' } }
        });
      }
    } catch (err) {
      console.error('Error saving log:', err);
      processApiError(err);
      setSubmitting(false);
    }
  };

  // Breadcrumb configuration
  const breadcrumbItems = [
    { label: 'Logs', path: '/logs' },
    { label: isEditMode ? `Edit Log #${id}` : 'Create New Log', path: isEditMode ? `/logs/${id}/edit` : '/logs/create' }
  ];

  // Show loading spinner when fetching log data in edit mode
  if (loading) return <LoadingSpinner text="Loading log data..." />;

  return (
    <Container>
      <Breadcrumb items={breadcrumbItems} />

      <Row className="mb-4">
        <Col>
          <h2>{isEditMode ? 'Edit Log' : 'Create New Log'}</h2>

          {/* Error display */}
          {error && (
            <Alert variant="danger" className="mt-3">
              <p>{error}</p>
              {nonFieldErrors.length > 0 && (
                <ul className="mt-2 mb-0">
                  {nonFieldErrors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              )}
            </Alert>
          )}

          {/* Log form */}
          <Card className="mt-4 shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Message field */}
                <Form.Group className="mb-3">
                  <Form.Label>Log Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter log message"
                    isInvalid={touched.message && validationErrors.message}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  {/* Severity field */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Severity</Form.Label>
                      <Form.Select
                        name="severity"
                        value={formData.severity}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        isInvalid={touched.severity && validationErrors.severity}
                      >
                        {SEVERITY_LEVELS.map(severity => (
                          <option key={severity.value} value={severity.value}>
                            {severity.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.severity}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Severity must be uppercase (automatically converted)
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  {/* Source field */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Source</Form.Label>
                      <Form.Control
                        type="text"
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Enter log source"
                        isInvalid={touched.source && validationErrors.source}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.source}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Source will be converted to lowercase (e.g., application, database, network)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Form actions */}
                <div className="d-flex justify-content-end mt-3">
                  <Link to="/logs" className="btn btn-secondary me-2">
                    Cancel
                  </Link>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting || Object.keys(validationErrors).length > 0}
                  >
                    {submitting ? 'Saving...' : (isEditMode ? 'Update Log' : 'Create Log')}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LogCreate;