import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Badge, Alert } from 'react-bootstrap';
import LogAPI from '../../api/api';
import { LoadingSpinner, Breadcrumb } from '../common';
import { formatDateTime, getSeverityColor } from '../../utils/formatters';

/**
 * LogDetail Component - Displays a detailed view of a log entry with edit and delete options
 */
const LogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Component state
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /**
   * Fetch log data from API
   */
  const fetchLogData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Fetching log details for ID: ${id}`);
      const data = await LogAPI.getLog(id);
      console.log('Log details fetched:', data);
      setLog(data);
    } catch (err) {
      console.error(`Error fetching log ${id}:`, err);

      // Handle API error
      if (err.originalError?.response) {
        const { status } = err.originalError.response;

        if (status === 404) {
          setError('The requested log does not exist or has been deleted.');
        } else {
          setError(`Failed to fetch log details: ${err.message || 'Unknown error'}`);
        }
      } else {
        setError('Failed to fetch log details. It may have been deleted or you may not have permission to view it.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete the current log
   */
  const handleDelete = async () => {
    try {
      setDeleting(true);
      console.log(`Deleting log with ID: ${id}`);

      await LogAPI.deleteLog(id);
      console.log('Log deleted successfully');

      setShowDeleteModal(false);

      // Navigate back to logs list with success message
      navigate('/logs', {
        state: { alert: { type: 'success', message: 'Log deleted successfully!' } }
      });
    } catch (err) {
      console.error(`Error deleting log ${id}:`, err);
      setShowDeleteModal(false);
      setError(`Failed to delete log: ${err.message || 'Please try again later.'}`);
      setDeleting(false);
    }
  };

  // Fetch log data when component mounts or ID changes
  useEffect(() => {
    fetchLogData();
  }, [id]);

  // Breadcrumb configuration
  const breadcrumbItems = [
    { label: 'Filter Logs', path: '/' },
    { label: `Log #${id}`, path: `/logs/${id}` }
  ];

  // Show loading spinner while fetching data
  if (loading) return <LoadingSpinner text="Loading log details..." />;

  // Show error state
  if (error) {
    return (
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
        <div className="mt-3">
          <Link to="/logs" className="btn btn-primary">
            Back to Logs
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Breadcrumb items={breadcrumbItems} />

      <Row className="mb-4">
        <Col>
          {/* Log detail header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Log Details</h2>
            <div>
              <Link
                to={`/logs/${id}/edit`}
                className="btn btn-outline-primary me-2"
              >
                Edit Log
              </Link>
              <Button
                variant="outline-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Log
              </Button>
            </div>
          </div>

          {/* Log detail card */}
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <Badge
                  bg="secondary"
                  style={{ backgroundColor: getSeverityColor(log.severity) }}
                  className="me-2"
                >
                  {log.severity}
                </Badge>
                <Badge bg="light" text="dark">{log.source}</Badge>
              </div>
              <small className="text-muted">
                {formatDateTime(log.timestamp)}
              </small>
            </Card.Header>
            <Card.Body>
              <Card.Title>Message</Card.Title>
              <Card.Text className="p-3 bg-light rounded">
                {log.message}
              </Card.Text>

              {/* Additional details */}
              <div className="mt-4">
                <h5>Additional Information</h5>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th style={{ width: '150px' }}>Log ID</th>
                      <td>{log.id}</td>
                    </tr>
                    <tr>
                      <th>Source</th>
                      <td>{log.source}</td>
                    </tr>
                    <tr>
                      <th>Severity</th>
                      <td>{log.severity}</td>
                    </tr>
                    <tr>
                      <th>Timestamp</th>
                      <td>{formatDateTime(log.timestamp)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="d-flex justify-content-end">
                <Link to="/logs" className="btn btn-secondary">
                  Back to Logs
                </Link>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => !deleting && setShowDeleteModal(false)}
        backdrop="static"
        keyboard={!deleting}
      >
        <Modal.Header closeButton={!deleting}>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this log? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Log'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LogDetail;