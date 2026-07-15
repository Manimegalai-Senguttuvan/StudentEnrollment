import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { reportApi, studentApi, courseApi } from '../services/api';

function EnrollmentReport() {
  const [data, setData] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filterStudent, setFilterStudent] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [error, setError] = useState(null);

  const loadAll = async () => {
    try {
      setError(null);
      const res = await reportApi.getStudentEnrollments();
      setData(res.data);
    } catch (err) {
      setError('Failed to load report data. Ensure the backend is active.');
      console.error(err);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await studentApi.getAll();
      setStudents(res.data);
    } catch (err) { console.error(err); }
  };

  const loadCourses = async () => {
    try {
      const res = await courseApi.getAll();
      setCourses(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadAll();
    loadStudents();
    loadCourses();
  }, []);

  const filterByStudent = async () => {
    if (!filterStudent) { loadAll(); return; }
    try {
      const res = await reportApi.getByStudent(filterStudent);
      setData(res.data);
    } catch (err) { setError('Failed to filter by student.'); }
  };

  const filterByCourse = async () => {
    if (!filterCourse) { loadAll(); return; }
    try {
      const res = await reportApi.getByCourse(filterCourse);
      setData(res.data);
    } catch (err) { setError('Failed to filter by course.'); }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold text-white mb-1">Academic Reports</h2>
        <p className="text-muted small">Cross-table SQL JOIN queries illustrating student-course enrollments</p>
      </div>

      {error && <Alert className="alert-danger-custom">{error}</Alert>}

      <Row className="mb-4 g-3">
        <Col md={4}>
          <div className="glass-card p-3 h-100">
            <Form.Group>
              <Form.Label className="small fw-bold uppercase tracking-wider text-muted">Filter by Student</Form.Label>
              <Form.Select value={filterStudent} onChange={e => setFilterStudent(e.target.value)}>
                <option value="" style={{backgroundColor:'black'}}>All Students</option>
                {students.map(s => <option key={s.studentId} value={s.studentId} style={{backgroundColor:'black'}}>{s.firstName} {s.lastName} (Roll: {s.rollNumber})</option>)}
              </Form.Select>
            </Form.Group>
            <Button className="btn-primary-custom btn-sm mt-3 px-4" onClick={filterByStudent}>Apply Filter</Button>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-3 h-100">
            <Form.Group>
              <Form.Label className="small fw-bold uppercase tracking-wider text-muted">Filter by Course</Form.Label>
              <Form.Select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
                <option value="" style={{backgroundColor:'black'}}>All Courses</option>
                {courses.map(c => <option key={c.courseId} value={c.courseId} style={{backgroundColor:'black'}}>{c.courseName} ({c.courseCode})</option>)}
              </Form.Select>
            </Form.Group>
            <Button className="btn-primary-custom btn-sm mt-3 px-4" onClick={filterByCourse}>Apply Filter</Button>
          </div>
        </Col>
      </Row>

      <div className="table-custom-container">
        <Table className="table-custom" responsive hover>
          <thead>
            <tr>
              <th>Enrollment ID</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Code</th>
              <th>Instructor</th>
              <th>Credits</th>
              <th>Grade</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-4 text-muted">No records matching the filters.</td>
              </tr>
            ) : (
              data.map(item => (
                <tr key={item.enrollmentId}>
                  <td className="fw-bold text-white">#{item.enrollmentId}</td>
                  <td className="text-white">{item.studentFirstName} {item.studentLastName}</td>
                  <td>{item.studentEmail}</td>
                  <td className="text-indigo-300 fw-bold">{item.courseName}</td>
                  <td>{item.courseCode}</td>
                  <td>{item.instructor}</td>
                  <td>{item.credits}</td>
                  <td className="text-white fw-bold">{item.grade || <span className="text-muted small italic">Ungraded</span>}</td>
                  <td>
                    <Badge bg={item.status === 'Active' ? 'primary' : item.status === 'Completed' ? 'success' : 'danger'} style={{
                      background: item.status === 'Active' ? 'rgba(99,102,241,0.2)' : item.status === 'Completed' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                      color: item.status === 'Active' ? '#a5b4fc' : item.status === 'Completed' ? '#34d399' : '#fca5a5',
                      border: item.status === 'Active' ? '1px solid rgba(99,102,241,0.3)' : item.status === 'Completed' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)'
                    }} className="px-3 py-2 rounded-pill">
                      {item.status}
                    </Badge>
                  </td>
                  <td>{item.enrollmentDate ? item.enrollmentDate.split('T')[0] : ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default EnrollmentReport;
