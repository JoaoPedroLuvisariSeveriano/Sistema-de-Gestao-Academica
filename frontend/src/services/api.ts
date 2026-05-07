import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Student API
export const studentAPI = {
  getAll: (params?: any) => api.get('/students', { params }),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students/register', data),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};

// Teacher API
export const teacherAPI = {
  getAll: (params?: any) => api.get('/teachers', { params }),
  getById: (id: string) => api.get(`/teachers/${id}`),
  create: (data: any) => api.post('/teachers', data),
  update: (id: string, data: any) => api.put(`/teachers/${id}`, data),
};

// Course API
export const courseAPI = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  toggleStatus: (id: string) => api.put(`/courses/${id}/status`),
  addDiscipline: (id: string, disciplineIds: string[]) => api.post(`/courses/${id}/disciplines`, { disciplineIds }),
};

// Discipline API
export const disciplineAPI = {
  getAll: (params?: any) => api.get('/disciplines', { params }),
  getById: (id: string) => api.get(`/disciplines/${id}`),
  getByCourse: (courseId: string) => api.get(`/disciplines/course/${courseId}`),
  create: (data: any) => api.post('/disciplines', data),
  update: (id: string, data: any) => api.put(`/disciplines/${id}`, data),
};

// Enrollment API
export const enrollmentAPI = {
  getAll: (params?: any) => api.get('/enrollments', { params }),
  getById: (id: string) => api.get(`/enrollments/${id}`),
  getByStudent: (studentId: string) => api.get(`/enrollments/student/${studentId}`),
  create: (data: any) => api.post('/enrollments', data),
  enrollInDiscipline: (id: string, data: any) => api.post(`/enrollments/${id}/disciplines`, data),
  cancelDiscipline: (id: string, disciplineId: string) => api.delete(`/enrollments/${id}/disciplines/${disciplineId}`),
  getHistory: (id: string) => api.get(`/enrollments/${id}/history`),
  getAllDisciplineEnrollments: (params?: any) => api.get('/enrollments/discipline-enrollments', { params }),
};

// Grade API
export const gradeAPI = {
  createOrUpdate: (data: any) => api.post('/grades', data),
  updateAttendance: (disciplineEnrollmentId: string, data: any) => 
    api.put(`/grades/${disciplineEnrollmentId}/attendance`, data),
  getAverage: (disciplineEnrollmentId: string) => api.get(`/grades/${disciplineEnrollmentId}/average`),
  getStatus: (disciplineEnrollmentId: string) => api.get(`/grades/${disciplineEnrollmentId}/status`),
  getByDiscipline: (disciplineId: string) => api.get(`/grades/discipline/${disciplineId}`),
  getByStudent: (studentId: string) => api.get(`/grades/student/${studentId}`),
};

// Document API
export const documentAPI = {
  getTranscript: (studentId: string) => api.get(`/documents/transcript/${studentId}`, { responseType: 'blob' }),
  getEnrollmentCertificate: (studentId: string) => api.get(`/documents/enrollment-certificate/${studentId}`, { responseType: 'blob' }),
  getBoletim: (studentId: string, period: number, year?: number) => 
    api.get(`/documents/boletim/${studentId}/${period}`, { responseType: 'blob', params: { year } }),
  getCertificate: (studentId: string, type?: string) => api.get(`/documents/certificate/${studentId}`, { responseType: 'blob', params: { type } }),
};

