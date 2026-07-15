import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Spinner } from 'react-bootstrap';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Students from './components/Students';
import Courses from './components/Courses';
import Enrollments from './components/Enrollments';
import EnrollmentReport from './components/EnrollmentReport';
import Home from './components/Home';
import Login from './components/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { isLoggedIn, isAdmin, user, logout, loading } = useAuth();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="indigo" style={{ color: '#6366f1', width: '3rem', height: '3rem' }} />
          <h5 className="mt-3 text-muted">Loading Portal...</h5>
        </div>
      </Container>
    );
  }

  if (!isLoggedIn()) {
    return <Login />;
  }

  return (
    <>
      <Navbar expand="lg" className="navbar-custom navbar-dark" variant="dark">
        <Container>
          <Navbar.Brand as={NavLink} to="/">
            {isAdmin() ? 'Admin Portal' : 'Student Portal'}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
            <Nav className="me-auto">
              {isAdmin() ? (
                <>
                  <Nav.Link as={NavLink} to="/">Dashboard</Nav.Link>
                  <Nav.Link as={NavLink} to="/students">Students</Nav.Link>
                  <Nav.Link as={NavLink} to="/courses">Courses</Nav.Link>
                  <Nav.Link as={NavLink} to="/enrollments">Enrollments</Nav.Link>
                  <Nav.Link as={NavLink} to="/reports">Join Report</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={NavLink} to="/students">My Profile</Nav.Link>
                  <Nav.Link as={NavLink} to="/courses">Available Courses</Nav.Link>
                  <Nav.Link as={NavLink} to="/enrollments">My Enrollments</Nav.Link>
                </>
              )}
            </Nav>
            <Nav className="align-items-center gap-3">
              <span className="text-muted small">
                Signed in as: <strong className="text-white">{user?.username}</strong> ({user?.role})
              </span>
              <Button size="sm" variant="outline-danger" onClick={logout} className="px-3 border-opacity-50">
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-5 pb-5">
        <Routes>
          {isAdmin() ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/students" element={<Students />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/enrollments" element={<Enrollments />} />
              <Route path="/reports" element={<EnrollmentReport />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/students" element={<Students />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/enrollments" element={<Enrollments />} />
              <Route path="*" element={<Navigate to="/students" replace />} />
            </>
          )}
        </Routes>
      </Container>
    </>
  );
}

export default App;
