import React, { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Chip, InputAdornment, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { courseAPI } from '../services/api';

interface Course {
  id: string;
  name: string;
  description: string;
  workload: number;
  modality: string;
  type: string;
  status: string;
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', workload: 0, modality: '', type: 'graduacao' });

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      // API returns { data: courses, total, page, limit, totalPages }
      setCourses(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleOpen = (course?: Course) => {
    if (course) {
      setEditCourse(course);
      setFormData({ 
        name: course.name, 
        description: course.description || '', 
        workload: course.workload || 0, 
        modality: course.modality || '', 
        type: course.type || 'graduacao' 
      });
    } else {
      setEditCourse(null);
      setFormData({ name: '', description: '', workload: 0, modality: '', type: 'graduacao' });
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditCourse(null); };

  const handleSave = async () => {
    try {
      if (editCourse) await courseAPI.update(editCourse.id, formData);
      else await courseAPI.create(formData);
      handleClose();
      fetchCourses();
    } catch (error: any) {
      console.error('Error saving course:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao salvar curso. Verifique os dados e tente novamente.';
      alert(errorMessage);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await courseAPI.toggleStatus(id);
      fetchCourses();
    } catch (error: any) {
      console.error('Error toggling course status:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao alterar status do curso.';
      alert(errorMessage);
    }
  };

  const filteredCourses = courses.filter(course => course.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getStatusLabel = (status: string) => {
    if (status === 'active' || status === 'ACTIVE') return 'Ativo';
    if (status === 'inactive' || status === 'INACTIVE') return 'Inativo';
    return status;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Cursos</Typography>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField placeholder="Buscar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ flexGrow: 1, maxWidth: 400 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Novo Curso</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Carga Horária</TableCell>
              <TableCell>Modalidade</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.description}</TableCell>
                <TableCell>{course.workload} h</TableCell>
                <TableCell>{course.modality}</TableCell>
                <TableCell>{course.type === 'graduacao' ? 'Graduação' : course.type === 'tecnico' ? 'Técnico' : course.type}</TableCell>
                <TableCell><Chip label={getStatusLabel(course.status)} color={course.status === 'active' || course.status === 'ACTIVE' ? 'success' : 'error'} size="small" /></TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(course)} color="primary"><EditIcon /></IconButton>
                  <Button onClick={() => handleToggleStatus(course.id)} size="small">{course.status === 'active' || course.status === 'ACTIVE' ? 'Inativar' : 'Ativar'}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editCourse ? 'Editar Curso' : 'Novo Curso'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} margin="normal" required />
          <TextField fullWidth label="Descrição" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} margin="normal" />
          <TextField fullWidth label="Carga Horária" type="number" value={formData.workload} onChange={(e) => setFormData({ ...formData, workload: parseInt(e.target.value) || 0 })} margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Modalidade</InputLabel>
            <Select value={formData.modality} label="Modalidade" onChange={(e) => setFormData({ ...formData, modality: e.target.value })}>
              <MenuItem value="Presencial">Presencial</MenuItem>
              <MenuItem value="EAD">EAD</MenuItem>
              <MenuItem value="Híbrido">Híbrido</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select value={formData.type} label="Tipo" onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              <MenuItem value="graduacao">Graduação</MenuItem>
              <MenuItem value="tecnico">Técnico</MenuItem>
              <MenuItem value="pos-graduacao">Pós-Graduação</MenuItem>
              <MenuItem value="mestrado">Mestrado</MenuItem>
              <MenuItem value="doutorado">Doutorado</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Courses;

