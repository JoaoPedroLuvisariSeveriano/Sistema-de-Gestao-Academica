const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('Testing API...\n');

  // Test 1: Check health
  try {
    const health = await axios.get(`${API_URL}/health`);
    console.log('✓ Health check:', health.data);
  } catch (e) {
    console.log('✗ Health check failed:', e.message);
  }

  // Test 2: Get students
  try {
    const students = await axios.get(`${API_URL}/students`);
    console.log('✓ Students:', students.data.data?.length || 0, 'students found');
  } catch (e) {
    console.log('✗ Get students failed:', e.message);
  }

  // Test 3: Register new student
  try {
    const newStudent = await axios.post(`${API_URL}/students/register`, {
      cpf: '98765432109',
      name: 'Novo Aluno Teste',
      email: 'novoteste@email.com',
      phone: '11999999999'
    });
    console.log('✓ Student registered:', newStudent.data.name);
  } catch (e) {
    console.log('✗ Register student failed:', e.response?.data?.error || e.message);
  }

  // Test 4: Get courses
  try {
    const courses = await axios.get(`${API_URL}/courses`);
    console.log('✓ Courses:', courses.data.length, 'courses found');
  } catch (e) {
    console.log('✗ Get courses failed:', e.message);
  }

  // Test 5: Register new course
  try {
    const newCourse = await axios.post(`${API_URL}/courses`, {
      name: 'Novo Curso Teste',
      description: 'Curso de teste',
      workload: 100,
      modality: 'presencial'
    });
    console.log('✓ Course registered:', newCourse.data.name);
  } catch (e) {
    console.log('✗ Register course failed:', e.response?.data?.error || e.message);
  }

  // Test 6: Get teachers
  try {
    const teachers = await axios.get(`${API_URL}/teachers`);
    console.log('✓ Teachers:', teachers.data.length, 'teachers found');
  } catch (e) {
    console.log('✗ Get teachers failed:', e.message);
  }

  // Test 7: Register new teacher
  try {
    const newTeacher = await axios.post(`${API_URL}/teachers`, {
      cpf: '11122233344',
      name: 'Novo Professor Teste',
      email: 'professor@teste.com',
      department: 'Computação',
      titulation: 'Mestrado'
    });
    console.log('✓ Teacher registered:', newTeacher.data.name);
  } catch (e) {
    console.log('✗ Register teacher failed:', e.response?.data?.error || e.message);
  }

  // Test 8: Check final database status
  try {
    const status = await axios.get(`${API_URL}/debug/db-status`);
    console.log('\n✓ Final DB Status:', status.data);
  } catch (e) {
    console.log('✗ DB status failed:', e.message);
  }
}

testAPI();

