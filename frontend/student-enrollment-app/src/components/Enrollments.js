import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Form, Modal, Row, Col, Alert, Badge } from 'react-bootstrap';
import { enrollmentApi, studentApi, courseApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Enrollments() {
  const { isAdmin } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ studentId: '', courseId: '', grade: '', status: 'Active' });
  const [error, setError] = useState(null);
const load = useCallback(async () => {
  try {
    setError(null);

    if (isAdmin()) {
      const [eRes, sRes, cRes] = await Promise.all([
        enrollmentApi.getAll(),
        studentApi.getAll(),
        courseApi.getAll()
      ]);

      setEnrollments(eRes.data);
      setStudents(sRes.data);
      setCourses(cRes.data);
    } else {
      const [eRes, cRes] = await Promise.all([
        enrollmentApi.getAll(),
        courseApi.getAll()
      ]);

      setEnrollments(eRes.data);
      setCourses(cRes.data);
    }
  } catch (err) {
    setError("Failed to load enrollments. Ensure the backend is active.");
    console.error(err);
  }
}, [isAdmin]);

  useEffect(() => {
  load();
}, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ studentId: '', courseId: '', grade: '', status: 'Active' });
    setShowModal(true);
  };

  const openEdit = (en) => {
    setEditing(en.enrollmentId);
    setForm({
      studentId: en.studentId,
      courseId: en.courseId,
      grade: en.grade || '',
      status: en.status || 'Active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = {
        studentId: parseInt(form.studentId),
        courseId: parseInt(form.courseId),
        grade: form.grade,
        status: form.status
      };

      if (editing) {
        await enrollmentApi.update(editing, payload);
      } else {
        await enrollmentApi.create(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.title || err.message;
      setError('Failed to save enrollment: ' + msg);
      console.error('Enrollment save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel/delete this enrollment?')) {
      try {
        await enrollmentApi.delete(id);
        load();
      } catch (err) {
        setError('Failed to delete enrollment.');
      }
    }
  };

  const getStudentName = (id) => {
    const s = students.find(x => x.studentId === id);
    return s ? `${s.firstName} ${s.lastName}` : `Student ID: ${id}`;
  };

  const getCourseName = (id) => {
    const c = courses.find(x => x.courseId === id);
    return c ? c.courseName : `Course ID: ${id}`;
  };

  const getCourseCode = (id) => {
    const c = courses.find(x => x.courseId === id);
    return c ? c.courseCode : '';
  };

  const getCourseCredits = (id) => {
    const c = courses.find(x => x.courseId === id);
    return c ? `${c.credits} Credits` : '';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge bg="primary" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)' }} className="px-3 py-2 rounded-pill">Active</Badge>;
      case 'Completed':
        return <Badge bg="success" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }} className="px-3 py-2 rounded-pill">Completed</Badge>;
      case 'Dropped':
        return <Badge bg="danger" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }} className="px-3 py-2 rounded-pill">Dropped</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2 rounded-pill">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">
            {isAdmin() ? 'Student Enrollments' : 'My Course Enrollments'}
          </h2>
          <p className="text-muted small">
            {isAdmin() ? 'Manage active student enrollment states and academic grades' : 'View your current course schedule, grades, and completion status'}
          </p>
        </div>
        {isAdmin() && <Button className="btn-primary-custom" onClick={openNew}>Add Enrollment</Button>}
      </div>

      {error && <Alert className="alert-danger-custom">{error}</Alert>}

      <div className="table-custom-container">
        <Table className="table-custom" responsive hover>
          <thead>
            <tr>
              <th>ID</th>
              {isAdmin() && <th>Student Name</th>}
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credits</th>
              <th>Grade</th>
              <th>Status</th>
              <th>Enrollment Date</th>
              {isAdmin() && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan={isAdmin() ? 9 : 7} className="text-center py-4 text-muted">No enrollments found.</td>
              </tr>
            ) : (
              enrollments.map(en => (
                <tr key={en.enrollmentId}>
                  <td className="fw-bold text-white">#{en.enrollmentId}</td>
                  {isAdmin() && <td>{getStudentName(en.studentId)}</td>}
                  <td className="fw-bold text-indigo-400">{getCourseCode(en.courseId)}</td>
                  <td className="text-white">{getCourseName(en.courseId)}</td>
                  <td>{getCourseCredits(en.courseId)}</td>
                  <td className="text-white fw-bold">{en.grade || <span className="text-muted font-normal small italic">Not Graded</span>}</td>
                  <td>{getStatusBadge(en.status)}</td>
                  <td>{en.enrollmentDate ? en.enrollmentDate.split('T')[0] : ''}</td>
                  {isAdmin() && (
                    <td>
                      <Button size="sm" variant="warning" onClick={() => openEdit(en)} className="me-2 px-3">Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(en.enrollmentId)} className="px-3">Delete</Button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="modal-content-custom text-white">
        <Modal.Header closeButton closeVariant="white" className="modal-header-custom">
          <Modal.Title className="fw-bold">{editing ? 'Edit' : 'Add'} Enrollment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label>Student</Form.Label>
              <Form.Select value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} required>
                <option value="">Select Student</option>
                {students.map(s => <option key={s.studentId} value={s.studentId}>{s.firstName} {s.lastName} (Roll: {s.rollNumber})</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Course</Form.Label>
              <Form.Select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} required>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseName} ({c.courseCode})</option>)}
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Grade</Form.Label>
                  <Form.Control value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} placeholder="e.g. A, B+, Pass" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Dropped</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button variant="secondary" className="btn-secondary-custom" onClick={() => setShowModal(false)}>Close</Button>
            <Button type="submit" className="btn-primary-custom">Save Enrollment</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Enrollments;
