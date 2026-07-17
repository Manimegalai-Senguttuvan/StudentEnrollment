import axios from "axios";

// Backend API URL
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://studentenrollment-api.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================
// AUTH APIs
// =====================
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// =====================
// STUDENT APIs
// =====================
export const studentApi = {
  getAll: () => api.get("/students"),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post("/students", data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// =====================
// COURSE APIs
// =====================
export const courseApi = {
  getAll: () => api.get("/courses"),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post("/courses", data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// =====================
// ENROLLMENT APIs
// =====================
export const enrollmentApi = {
  getAll: () => api.get("/enrollments"),
  getById: (id) => api.get(`/enrollments/${id}`),
  create: (data) => api.post("/enrollments", data),
  update: (id, data) => api.put(`/enrollments/${id}`, data),
  delete: (id) => api.delete(`/enrollments/${id}`),
};

// =====================
// REPORT APIs
// =====================
export const reportApi = {
  getStudentEnrollments: () =>
    api.get("/reports/student-enrollments"),
  getByStudent: (studentId) =>
    api.get(`/reports/student-enrollments/${studentId}`),
  getByCourse: (courseId) =>
    api.get(`/reports/course-enrollments/${courseId}`),
};

export default api;