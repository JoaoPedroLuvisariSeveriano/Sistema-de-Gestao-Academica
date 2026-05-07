import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { studentAPI, courseAPI, disciplineAPI, enrollmentAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    disciplines: 0,
    enrollments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, coursesRes, disciplinesRes, enrollmentsRes] = await Promise.all([
          studentAPI.getAll(),
          courseAPI.getAll(),
          disciplineAPI.getAll(),
          enrollmentAPI.getAll(),
        ]);

        setStats({
          students: studentsRes.data.length || 0,
          courses: coursesRes.data.length || 0,
          disciplines: disciplinesRes.data.length || 0,
          enrollments: enrollmentsRes.data.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Alunos', value: stats.students, icon: <PeopleIcon sx={{ fontSize: 40, color: '#1976d2' }} /> },
    { title: 'Cursos', value: stats.courses, icon: <SchoolIcon sx={{ fontSize: 40, color: '#2e7d32' }} /> },
    { title: 'Disciplinas', value: stats.disciplines, icon: <BookIcon sx={{ fontSize: 40, color: '#ed6c02' }} /> },
    { title: 'Matrículas', value: stats.enrollments, icon: <AssignmentIcon sx={{ fontSize: 40, color: '#9c27b0' }} /> },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Bem-vindo, {user?.email}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Perfil: {user?.role}
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
              }}
            >
              {card.icon}
              <Typography variant="h6" sx={{ mt: 2 }}>
                {card.title}
              </Typography>
              <Typography variant="h4" color="primary">
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;

