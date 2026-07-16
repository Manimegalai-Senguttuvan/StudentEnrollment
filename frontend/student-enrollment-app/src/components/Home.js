import React, { useEffect, useState } from 'react';
import {  Row, Col, Alert, Spinner } from 'react-bootstrap';
import { studentApi, courseApi, enrollmentApi } from '../services/api';

function Home() {
  const [stats, setStats] = useState({ students: 0, courses: 0, enrollments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [sRes, cRes, eRes] = await Promise.all([
          studentApi.getAll(),
          courseApi.getAll(),
          enrollmentApi.getAll()
        ]);
        setStats({
          students: sRes.data.length,
          courses: cRes.data.length,
          enrollments: eRes.data.length
        });
      } catch (err) {
        setError('Failed to load system statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="indigo" style={{ color: '#6366f1' }} />
        <p className="text-muted mt-2">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="profile-header-gradient mb-5 text-center p-5">
        <h1 className="fw-bold text-white mb-2">Administrative Dashboard</h1>
        <p className="text-muted mb-0">System status and enrollment overview for Student Enrollment System</p>
      </div>

      {error && <Alert className="alert-danger-custom">{error}</Alert>}

      <Row className="g-4 mb-4">
        <Col md={4}>
          <div className="stat-card glass-card">
            <h5 className="text-muted small uppercase fw-bold mb-1">Total Students</h5>
            <div className="stat-number">{stats.students}</div>
            <p className="text-muted small mb-0 mt-2">Registered student profiles</p>
          </div>
        </Col>
        <Col md={4}>
          <div className="stat-card glass-card">
            <h5 className="text-muted small uppercase fw-bold mb-1">Active Courses</h5>
            <div className="stat-number">{stats.courses}</div>
            <p className="text-muted small mb-0 mt-2">Academic catalog modules</p>
          </div>
        </Col>
        <Col md={4}>
          <div className="stat-card glass-card">
            <h5 className="text-muted small uppercase fw-bold mb-1">Enrollments</h5>
            <div className="stat-number">{stats.enrollments}</div>
            <p className="text-muted small mb-0 mt-2">Total course registrations</p>
          </div>
        </Col>
      </Row>

      <div className="glass-card p-4 mt-5">
        <h4 className="text-white fw-bold mb-3">Quick Navigation Tips</h4>
        <p className="text-muted">Use the top navigation bar to manage the system databases:</p>
        <ul className="text-muted mb-0">
          <li><strong>Students:</strong> View full directories, edit details, or delete profiles.</li>
          <li><strong>Courses:</strong> Maintain the curriculum, create new modules, and check sizes.</li>
          <li><strong>Enrollments:</strong> Register students for classes, input grades, and manage status.</li>
          <li><strong>Join Reports:</strong> Formulate custom queries and compile JOIN lists.</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
