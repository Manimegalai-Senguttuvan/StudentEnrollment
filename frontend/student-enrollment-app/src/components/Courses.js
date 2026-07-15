import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Modal, Row, Col, Alert, Badge } from 'react-bootstrap';
import { courseApi, enrollmentApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Courses() {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ courseName: '', courseCode: '', description: '', credits: '', instructor: '', maxCapacity: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const load = async () => {
    try {
      setError(null);
      const cRes = await courseApi.getAll();
      setCourses(cRes.data);

      if (!isAdmin()) {
        const eRes = await enrollmentApi.getAll();
        setMyEnrollments(eRes.data);
      }
    } catch (err) {
      setError('Failed to load courses. Ensure the backend is active.');
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ courseName: '', courseCode: '', description: '', credits: '', instructor: '', maxCapacity: '' });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c.courseId);
    setForm({
      courseName: c.courseName,
      courseCode: c.courseCode,
      description: c.description || '',
      credits: c.credits,
      instructor: c.instructor,
      maxCapacity: c.maxCapacity
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = { ...form, credits: parseInt(form.credits), maxCapacity: parseInt(form.maxCapacity) };
      if (editing) {
        await courseApi.update(editing, payload);
      } else {
        await courseApi.create(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.title || err.message;
      setError('Failed to save course: ' + msg);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseApi.delete(id);
        load();
      } catch (err) {
        setError('Failed to delete course.');
      }
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setError(null);
      setSuccess(null);
      await enrollmentApi.create({ courseId });
      setSuccess('Enrolled in course successfully!');
      load();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError('Failed to enroll: ' + msg);
    }
  };

  const isEnrolled = (courseId) => {
    return myEnrollments.some(e => e.courseId === courseId);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Courses Directory</h2>
          <p className="text-muted small">
            {isAdmin() ? 'Manage curriculum catalog and instructor assignments' : 'Explore and enroll in active academic courses'}
          </p>
        </div>
        {isAdmin() && <Button className="btn-primary-custom" onClick={openNew}>Add Course</Button>}
      </div>

      {error && <Alert className="alert-danger-custom">{error}</Alert>}
      {success && <Alert className="alert-custom">{success}</Alert>}

      <div className="table-custom-container">
        <Table className="table-custom" responsive hover>
          <thead>
            <tr>
              <th>Code</th>
              <th>Course Name</th>
              <th>Description</th>
              <th>Credits</th>
              <th>Instructor</th>
              <th>Capacity</th>
              <th>Status / Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">No courses found.</td>
              </tr>
            ) : (
              courses.map(c => {
                const enrolled = !isAdmin() && isEnrolled(c.courseId);
                return (
                  <tr key={c.courseId}>
                    <td className="fw-bold text-white">{c.courseCode}</td>
                    <td className="text-white font-medium">{c.courseName}</td>
                    <td className="text-truncate" style={{ maxWidth: '250px' }}>{c.description || '-'}</td>
                    <td>{c.credits} Credits</td>
                    <td>{c.instructor}</td>
                    <td>{c.maxCapacity} Seats</td>
                    <td>
                      {isAdmin() ? (
                        <>
                          <Button size="sm" variant="warning" onClick={() => openEdit(c)} className="me-2 px-3">Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(c.courseId)} className="px-3">Delete</Button>
                        </>
                      ) : (
                        enrolled ? (
                          <Badge bg="success" className="px-3 py-2 rounded-pill font-semibold" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            Enrolled
                          </Badge>
                        ) : (
                          <Button size="sm" className="btn-primary-custom px-3 py-1" onClick={() => handleEnroll(c.courseId)}>
                            Enroll Now
                          </Button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="modal-content-custom text-white">
        <Modal.Header closeButton closeVariant="white" className="modal-header-custom">
          <Modal.Title className="fw-bold">{editing ? 'Edit' : 'Add'} Course</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Name</Form.Label>
                  <Form.Control value={form.courseName} onChange={e => setForm({...form, courseName: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Code</Form.Label>
                  <Form.Control value={form.courseCode} onChange={e => setForm({...form, courseCode: e.target.value})} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the course curriculum..." />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Credits</Form.Label>
                  <Form.Control type="number" value={form.credits} onChange={e => setForm({...form, credits: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Capacity</Form.Label>
                  <Form.Control type="number" value={form.maxCapacity} onChange={e => setForm({...form, maxCapacity: e.target.value})} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Instructor</Form.Label>
              <Form.Control value={form.instructor} onChange={e => setForm({...form, instructor: e.target.value})} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button variant="secondary" className="btn-secondary-custom" onClick={() => setShowModal(false)}>Close</Button>
            <Button type="submit" className="btn-primary-custom">Save Course</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Courses;
