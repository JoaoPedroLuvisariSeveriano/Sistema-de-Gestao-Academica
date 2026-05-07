import React, { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Select, MenuItem, FormControl, InputLabel, Grid, Chip } from '@mui/material';
import { gradeAPI, enrollmentAPI, disciplineAPI, studentAPI, courseAPI } from '../services/api';

interface GradeRecord { 
  id: string; 
  studentId?: string;
  studentName?: string; 
  studentRegistration?: string;
  disciplineId?: string;
  disciplineName?: string; 
  teacherName?: string;
  courseName?: string;
  year?: number;
  period?: number;
  grade1?: number; 
  grade2?: number;
  grade3?: number;
  average?: number; 
  attendancePercentage?: number; 
  finalStatus?: string; 
}

const Grades: React.FC = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [disciplineEnrollments, setDisciplineEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    disciplineEnrollmentId: '', 
    grade1: 0, 
    grade2: 0, 
    grade3: 0, 
    totalClasses: 60, 
    attendedClasses: 60 
  });

  const fetchData = async () => {
    try {
      // Use the new endpoint to get all discipline enrollments for grade entry
      const disciplineEnrollmentsRes = await enrollmentAPI.getAllDisciplineEnrollments();
      
      const data = disciplineEnrollmentsRes.data.data || disciplineEnrollmentsRes.data;
      setDisciplineEnrollments(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpen = () => { 
    setFormData({ 
      disciplineEnrollmentId: '', 
      grade1: 0, 
      grade2: 0, 
      grade3: 0, 
      totalClasses: 60, 
      attendedClasses: 60 
    }); 
    setOpen(true); 
  };
  const handleClose = () => { setOpen(false); };

  const handleSave = async () => {
    try {
      // First create/update grades
      await gradeAPI.createOrUpdate({ 
        disciplineEnrollmentId: formData.disciplineEnrollmentId, 
        grade1: formData.grade1, 
        grade2: formData.grade2, 
        grade3: formData.grade3 
      });
      
      // Then update attendance
      await gradeAPI.updateAttendance(formData.disciplineEnrollmentId, { 
        totalClasses: formData.totalClasses, 
        attendedClasses: formData.attendedClasses 
      });
      
      handleClose();
      fetchData();
    } catch (error: any) {
      console.error('Error saving grade:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao lançar notas. Verifique os dados e tente novamente.';
      alert(errorMessage);
    }
  };

  const getStatusChip = (status: string) => {
    const colors: any = { 
      approved: 'success', 
      failed: 'error', 
      recovery: 'warning', 
      in_progress: 'info' 
    };
    const labels: any = { 
      approved: 'Aprovado', 
      failed: 'Reprovado', 
      recovery: 'Recuperação', 
      in_progress: 'Em Andamento' 
    };
    // Normalize status
    const normalizedStatus = status?.toLowerCase();
    return <Chip label={labels[normalizedStatus] || status} color={colors[normalizedStatus] || 'default'} size="small" />;
  };

  // Use disciplineEnrollments directly for display
  const gradeRecords: GradeRecord[] = disciplineEnrollments.map((de) => ({
    id: de.id,
    studentId: de.studentId,
    studentName: de.studentName || 'Aluno',
    studentRegistration: de.studentRegistration || '',
    disciplineId: de.disciplineId,
    disciplineName: de.disciplineName || 'Disciplina',
    teacherName: de.teacherName || 'Professor',
    courseName: de.courseName || 'Curso',
    year: de.year,
    period: de.period,
    grade1: de.grade1,
    grade2: de.grade2,
    grade3: de.grade3,
    average: de.average,
    attendancePercentage: de.attendancePercentage,
    finalStatus: de.finalStatus
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Notas e Frequência</Typography>
      <Box sx={{ mb: 3 }}><Button variant="contained" onClick={handleOpen}>Lançar Notas</Button></Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Aluno</TableCell>
              <TableCell>Curso</TableCell>
              <TableCell>Disciplina</TableCell>
              <TableCell>Nota 1</TableCell>
              <TableCell>Nota 2</TableCell>
              <TableCell>Nota 3</TableCell>
              <TableCell>Média</TableCell>
              <TableCell>Frequência</TableCell>
              <TableCell>Situação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gradeRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">Nenhum registro de notas encontrado</TableCell>
              </TableRow>
            ) : (
              gradeRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.studentName}</TableCell>
                  <TableCell>{record.courseName}</TableCell>
                  <TableCell>{record.disciplineName}</TableCell>
                  <TableCell>{typeof record.grade1 === 'number' ? record.grade1.toFixed(1) : '-'}</TableCell>
                  <TableCell>{typeof record.grade2 === 'number' ? record.grade2.toFixed(1) : '-'}</TableCell>
                  <TableCell>{typeof record.grade3 === 'number' ? record.grade3.toFixed(1) : '-'}</TableCell>
                  <TableCell>{typeof record.average === 'number' ? record.average.toFixed(1) : '-'}</TableCell>
                  <TableCell>{typeof record.attendancePercentage === 'number' ? record.attendancePercentage.toFixed(0) : '0'}%</TableCell>
                  <TableCell>{getStatusChip(record.finalStatus ?? 'Pendente')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Lançar Notas</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Matrícula na Disciplina</InputLabel>
            <Select 
              value={formData.disciplineEnrollmentId} 
              label="Matrícula na Disciplina" 
              onChange={(e) => setFormData({ ...formData, disciplineEnrollmentId: e.target.value })}
            >
              {gradeRecords.map((record) => (
                <MenuItem key={record.id} value={record.id}>
                  {record.studentName} - {record.disciplineName} ({record.courseName})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField fullWidth label="Nota 1" type="number" value={formData.grade1} onChange={(e) => setFormData({ ...formData, grade1: parseFloat(e.target.value) || 0 })} margin="normal" inputProps={{ min: 0, max: 10, step: 0.1 }} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Nota 2" type="number" value={formData.grade2} onChange={(e) => setFormData({ ...formData, grade2: parseFloat(e.target.value) || 0 })} margin="normal" inputProps={{ min: 0, max: 10, step: 0.1 }} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Nota 3" type="number" value={formData.grade3} onChange={(e) => setFormData({ ...formData, grade3: parseFloat(e.target.value) || 0 })} margin="normal" inputProps={{ min: 0, max: 10, step: 0.1 }} />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField fullWidth label="Total de Aulas" type="number" value={formData.totalClasses} onChange={(e) => setFormData({ ...formData, totalClasses: parseInt(e.target.value) || 0 })} margin="normal" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Aulas Presenciadas" type="number" value={formData.attendedClasses} onChange={(e) => setFormData({ ...formData, attendedClasses: parseInt(e.target.value) || 0 })} margin="normal" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Grades;

