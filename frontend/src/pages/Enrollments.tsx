import React, { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Select, MenuItem, FormControl, InputLabel, Chip, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { enrollmentAPI, studentAPI, courseAPI, disciplineAPI } from '../services/api';

interface Enrollment { id: string; student?: { name: string; registrationNumber: string }; course?: { name: string }; year: number; period: number; status: string; }

const Enrollments: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openDiscipline, setOpenDiscipline] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [formData, setFormData] = useState({ studentId: '', courseId: '', year: new Date().getFullYear(), period: 1 });
  const [disciplineData, setDisciplineData] = useState({ disciplineIds: [] as string[], year: new Date().getFullYear(), period: 1 });

  const fetchData = async () => {
    try {
      const [enrollmentsRes, studentsRes, coursesRes, disciplinesRes] = await Promise.all([enrollmentAPI.getAll(), studentAPI.getAll(), courseAPI.getAll(), disciplineAPI.getAll()]);
      // Handle both wrapped and unwrapped responses
      setEnrollments(enrollmentsRes.data.data || enrollmentsRes.data);
      setStudents(studentsRes.data.data || studentsRes.data);
      setCourses(coursesRes.data.data || coursesRes.data);
      setDisciplines(disciplinesRes.data.data || disciplinesRes.data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpen = () => { setFormData({ studentId: '', courseId: '', year: new Date().getFullYear(), period: 1 }); setOpen(true); };
  const handleClose = () => { setOpen(false); };

  const handleSave = async () => {
    try { await enrollmentAPI.create(formData); handleClose(); fetchData(); } catch (error: any) { console.error('Error:', error); alert(error.response?.data?.error || 'Erro ao criar matrícula.'); }
  };

  const handleOpenDiscipline = (enrollment: Enrollment) => { setSelectedEnrollment(enrollment); setDisciplineData({ disciplineIds: [], year: enrollment.year, period: enrollment.period }); setOpenDiscipline(true); };
  const handleCloseDiscipline = () => { setOpenDiscipline(false); setSelectedEnrollment(null); };

  const handleSaveDiscipline = async () => {
    if (!selectedEnrollment) return;
    try { await enrollmentAPI.enrollInDiscipline(selectedEnrollment.id, disciplineData); handleCloseDiscipline(); fetchData(); } catch (error: any) { console.error('Error:', error); alert(error.response?.data?.error || 'Erro ao matricular em disciplinas.'); }
  };

  const getStatusChip = (status: string) => {
    const colors: any = { active: 'success', cancelled: 'error', completed: 'info' };
    const labels: any = { active: 'Ativo', cancelled: 'Cancelado', completed: 'Concluído' };
    return <Chip label={labels[status] || status} color={colors[status] || 'default'} size="small" />;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Matrículas</Typography>
      <Box sx={{ mb: 3 }}><Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>Nova Matrícula</Button></Box>
      <TableContainer component={Paper}>
        <Table><TableHead><TableRow><TableCell>Aluno</TableCell><TableCell>Curso</TableCell><TableCell>Ano</TableCell><TableCell>Período</TableCell><TableCell>Status</TableCell><TableCell>Ações</TableCell></TableRow></TableHead>
          <TableBody>{enrollments.map((e) => (<TableRow key={e.id}><TableCell>{e.student?.name} ({e.student?.registrationNumber})</TableCell><TableCell>{e.course?.name}</TableCell><TableCell>{e.year}</TableCell><TableCell>{e.period}º</TableCell><TableCell>{getStatusChip(e.status)}</TableCell><TableCell><Button size="small" onClick={() => handleOpenDiscipline(e)}>Disciplinas</Button></TableCell></TableRow>))}</TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Matrícula</DialogTitle>
        <DialogContent><FormControl fullWidth margin="normal"><InputLabel>Aluno</InputLabel><Select value={formData.studentId} label="Aluno" onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}>{students.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</Select></FormControl><FormControl fullWidth margin="normal"><InputLabel>Curso</InputLabel><Select value={formData.courseId} label="Curso" onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}>{courses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}</Select></FormControl><TextField fullWidth label="Ano" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} margin="normal" /><TextField fullWidth label="Período" type="number" value={formData.period} onChange={(e) => setFormData({ ...formData, period: parseInt(e.target.value) })} margin="normal" /></DialogContent>
        <DialogActions><Button onClick={handleClose}>Cancelar</Button><Button onClick={handleSave} variant="contained">Salvar</Button></DialogActions>
      </Dialog>
      <Dialog open={openDiscipline} onClose={handleCloseDiscipline} maxWidth="sm" fullWidth>
        <DialogTitle>Matricular em Disciplinas</DialogTitle>
        <DialogContent><FormControl fullWidth margin="normal"><InputLabel>Disciplinas</InputLabel><Select multiple value={disciplineData.disciplineIds} label="Disciplinas" onChange={(e) => setDisciplineData({ ...disciplineData, disciplineIds: e.target.value as string[] })}>{disciplines.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}</Select></FormControl></DialogContent>
        <DialogActions><Button onClick={handleCloseDiscipline}>Cancelar</Button><Button onClick={handleSaveDiscipline} variant="contained">Salvar</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default Enrollments;

