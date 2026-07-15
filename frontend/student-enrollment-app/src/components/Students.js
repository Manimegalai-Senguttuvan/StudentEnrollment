import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Modal, Row, Col, Alert, Card } from 'react-bootstrap';
import { studentApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Students() {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ rollNumber: '', firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '' });
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setError(null);
      const res = await studentApi.getAll();
      setStudents(res.data);
    } catch (err) {
      setError('Failed to load student profiles. Ensure the backend is active.');
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ rollNumber: '', firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '' });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s.studentId);
    setForm({
      rollNumber: s.rollNumber || '',
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone || '',
      dateOfBirth: s.dateOfBirth ? s.dateOfBirth.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = { ...form };
      if (editing) {
        await studentApi.update(editing, payload);
      } else {
        await studentApi.create(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.title || err.message;
      setError('Failed to save student profile: ' + msg);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      try {
        await studentApi.delete(id);
        load();
      } catch (err) {
        setError('Failed to delete student.');
      }
    }
  };

  // Render Admin View: Full Student Directory with CRUD operations
  const renderAdminView = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Students Directory</h2>
          <p className="text-muted small">Manage all enrolled student profiles and credentials</p>
        </div>
        <Button className="btn-primary-custom" onClick={openNew}>Add Student</Button>
      </div>

      {error && <Alert className="alert-danger-custom">{error}</Alert>}

      <div className="table-custom-container">
        <Table className="table-custom" responsive hover>
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Date of Birth</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">No student profiles found.</td>
              </tr>
            ) : (
              students.map(s => (
                <tr key={s.studentId}>
                  <td className="fw-bold text-white">{s.rollNumber}</td>
                  <td>{s.firstName} {s.lastName}</td>
                  <td>{s.email}</td>
                  <td>{s.phone || '-'}</td>
                  <td>{s.dateOfBirth ? s.dateOfBirth.split('T')[0] : ''}</td>
                  <td>
                    <Button size="sm" variant="warning" onClick={() => openEdit(s)} className="me-2 px-3">Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(s.studentId)} className="px-3">Delete</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );

  // Render Student View: Personal Profile Dashboard
  const renderStudentView = () => {
    if (students.length === 0) {
      return (
        <Card className="glass-card p-4 text-center my-5">
          <Card.Body>
            <h3 className="text-white fw-bold mb-3">Complete Your Profile</h3>
            <p className="text-muted mb-4">You have registered an account, but your student profile details are incomplete. Click below to add your details.</p>
            <Button className="btn-primary-custom" onClick={openNew}>Create Profile</Button>
          </Card.Body>
        </Card>
      );
    }

    const s = students[0];
    return (
      <div className="max-w-3xl mx-auto">
        <div className="profile-header-gradient d-flex align-items-center gap-4">
          <div className="profile-avatar">
            {s.firstName[0]}{s.lastName[0]}
          </div>
          <div>
            <h2 className="text-white fw-bold mb-1">{s.firstName} {s.lastName}</h2>
            <span className="badge bg-indigo-500 bg-opacity-20 text-indigo-300 border border-indigo-500 border-opacity-30 px-3 py-2 rounded-pill font-medium" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
              Roll Number: {s.rollNumber}
            </span>
          </div>
        </div>

        <Row className="g-4">
          <Col md={6}>
            <Card className="glass-card h-100">
              <Card.Body className="p-4">
                <h5 className="text-white fw-bold mb-4 border-bottom border-secondary border-opacity-10 pb-2">Personal Details</h5>
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="text-muted small uppercase fw-bold d-block">First Name</label>
                    <span className="text-white">{s.firstName}</span>
                  </div>
                  <div>
                    <label className="text-muted small uppercase fw-bold d-block">Last Name</label>
                    <span className="text-white">{s.lastName}</span>
                  </div>
                  <div>
                    <label className="text-muted small uppercase fw-bold d-block">Date of Birth</label>
                    <span className="text-white">{s.dateOfBirth ? s.dateOfBirth.split('T')[0] : ''}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="glass-card h-100">
              <Card.Body className="p-4">
                <h5 className="text-white fw-bold mb-4 border-bottom border-secondary border-opacity-10 pb-2">Contact Details</h5>
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="text-muted small uppercase fw-bold d-block">Email Address</label>
                    <span className="text-white">{s.email}</span>
                  </div>
                  <div>
                    <label className="text-muted small uppercase fw-bold d-block">Phone Number</label>
                    <span className="text-white">{s.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <label className="text-muted small uppercase fw-bold d-block">Enrollment Date</label>
                    <span className="text-white">{s.enrollmentDate ? s.enrollmentDate.split('T')[0] : ''}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div>
      {isAdmin() ? renderAdminView() : renderStudentView()}

      <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="modal-content-custom text-white">
        <Modal.Header closeButton closeVariant="white" className="modal-header-custom">
          <Modal.Title className="fw-bold">{editing ? 'Edit' : 'Create'} Student Profile</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-4">
            {isAdmin() && (
              <Form.Group className="mb-3">
                <Form.Label>Roll Number</Form.Label>
                <Form.Control 
                  value={form.rollNumber} 
                  onChange={e => setForm({...form, rollNumber: e.target.value})} 
                  placeholder="e.g. STU101"
                  required 
                />
              </Form.Group>
            )}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button variant="secondary" className="btn-secondary-custom" onClick={() => setShowModal(false)}>Close</Button>
            <Button type="submit" className="btn-primary-custom">Save Profile</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Students;
