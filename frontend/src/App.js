// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav, Alert } from 'react-bootstrap';
import { FilterProvider } from './context/FilterContext';
import { Dashboard } from './components/dashboard/Dashboard';
import LogList from './components/logs/LogList';
import LogDetail from './components/logs/LogDetail';
import LogCreate from './components/logs/LogCreate';

/**
 * AlertManager Component - Handles displaying alerts from navigation state
 */
const AlertManager = () => {
  const location = useLocation();
  const [alert, setAlert] = useState(null);

  // Set alert from location state
  useEffect(() => {
    if (location.state?.alert) {
      setAlert(location.state.alert);

      // Auto-dismiss alert after 5 seconds
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  // Don't render anything if no alert
  if (!alert) return null;

  return (
    <Container className="mt-3">
      <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
        {alert.message}
      </Alert>
    </Container>
  );
};

/**
 * Main App Component - Sets up routing and application structure
 */
const App = () => {
  return (
    <Router>
      <FilterProvider>
        <div className="d-flex flex-column min-vh-100">
          {/* Navigation */}
          <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
            <Container>
              <Navbar.Brand as={Link} to="/">Dashboard</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/logs">Filter Logs</Nav.Link>
                  <Nav.Link as={Link} to="/logs/create">Create Log</Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

          {/* Main content */}
          <div className="flex-grow-1">
            <AlertManager />
            <Routes>
              {/* Default route - Make sure Dashboard is the index route */}
              <Route index element={<Dashboard />} />
              <Route exact path="/" element={<Dashboard />} />
              <Route path="/logs" element={<LogList />} />
              <Route path="/logs/create" element={<LogCreate />} />
              <Route path="/logs/:id" element={<LogDetail />} />
              <Route path="/logs/:id/edit" element={<LogCreate />} />
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Footer */}
          <footer className="bg-light py-3 mt-4">
            <Container>
              <p className="text-center text-muted mb-0">
                Log Management System &copy; {new Date().getFullYear()}
              </p>
            </Container>
          </footer>
        </div>
      </FilterProvider>
    </Router>
  );
};

export default App;