import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'User',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      let res;
      if (isLogin) {
        res = await authApi.login({ username: form.username, password: form.password });
      } else {
        // Build payload. For Admins, we don't need student fields.
        const payload = form.role === 'Admin' ? {
          username: form.username,
          email: form.email,
          password: form.password,
          role: 'Admin'
        } : {
          ...form,
          dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null
        };
        res = await authApi.register(payload);
      }

      if (res.data.token) {
        login(res.data.token, res.data.username, res.data.role);
        setSuccess(res.data.message);
        setTimeout(() => navigate('/'), 1000);
      } else {
        setError(res.data.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Something went wrong');
    }
  };

  if (showLanding) {
    return (
      <div className="landing-container d-flex align-items-center">
        <div className="landing-content-left text-start">
          <h1 className="landing-title fw-bold mb-3">
            EXPLORE THE FUTURE OF EDUCATION
          </h1>
          <p className="landing-subtitle text-muted mb-4">
            Join a world-class academic community on the cutting edge of technology and innovation.
          </p>
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <Button 
              className="btn-primary-custom landing-cta-btn-new" 
              onClick={() => setShowLanding(false)}
            >
              Get Started
            </Button>
            <Button 
              className="btn-secondary-custom landing-secondary-btn"
              onClick={() => setShowLanding(false)}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
      <Col md={isLogin ? 5 : 7} className="transition-all duration-300">
        <Card className="glass-card p-2">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h2 className="fw-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text" style={{ 
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-muted small">
                {isLogin ? 'Login to manage your student dashboard' : 'Sign up to register your profile and courses'}
              </p>
            </div>

            {error && <Alert className="alert-danger-custom">{error}</Alert>}
            {success && <Alert className="alert-custom">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              {!isLogin && (
                <Form.Group className="mb-3">
                  <Form.Label>Account Type</Form.Label>
                  <Form.Select
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="User"  style={{backgroundColor:'black'}}>Student (logs in with Roll Number)</option>
                    <option value="Admin" style={{backgroundColor:'black'}}>Administrator</option>
                  </Form.Select>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>{(!isLogin && form.role === 'User') ? 'Roll Number' : 'Username'}</Form.Label>
                <Form.Control
                  placeholder={(!isLogin && form.role === 'User') ? 'e.g. STU101' : 'Enter username'}
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
              </Form.Group>

              {!isLogin && (
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </Form.Group>

              {/* Student Profile details requested during student registration */}
              {!isLogin && form.role === 'User' && (
                <div className="border-top pt-3 mt-3 border-secondary border-opacity-20">
                  <h5 className="mb-3 text-white opacity-90 small uppercase tracking-wider">Student Profile Details</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          placeholder="First Name"
                          value={form.firstName}
                          onChange={e => setForm({ ...form, firstName: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          placeholder="Last Name"
                          value={form.lastName}
                          onChange={e => setForm({ ...form, lastName: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          placeholder="e.g. 555-0101"
                          value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                          type="date"
                          value={form.dateOfBirth}
                          onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              )}

              <Button type="submit" className="btn-primary-custom w-100 mb-3 mt-2">
                {isLogin ? 'Login' : 'Register & Create Profile'}
              </Button>
            </Form>

            <div className="text-center">
              <Button variant="link" className="text-decoration-none text-indigo-400 p-0" style={{ color: '#a855f7' }} onClick={() => { setIsLogin(!isLogin); setError(null); }}>
                {isLogin ? 'Need an account? Register here' : 'Already have an account? Login here'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Container>
  );
}

export default Login;
