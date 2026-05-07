import React, { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Chip, InputAdornment, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { teacherAPI } from '../services/api';

interface Teacher {
  id: string;
  cpf: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  titulation: string;
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    cpf: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    titulation: '',
  });

  const fetchTeachers = async () => {
    try {
      const response = await teacherAPI.getAll();
      // API returns { data: teachers, total, page, limit, totalPages }
      setTeachers(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpen = (teacher?: Teacher) => {
    if (teacher) {
      setEditTeacher(teacher);
      setFormData({
        cpf: teacher.cpf,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone || '',
        department: teacher.department,
        titulation: teacher.titulation,
      });
    } else {
      setEditTeacher(null);
      setFormData({ cpf: '', name: '', email: '', phone: '', department: '', titulation: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTeacher(null);
  };

  const handleSave = async () => {
    try {
      if (editTeacher) {
        await teacherAPI.update(editTeacher.id, formData);
      } else {
        await teacherAPI.create(formData);
      }
      handleClose();
      fetchTeachers();
    } catch (error: any) {
      console.error('Error saving teacher:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao salvar professor. Verifique os dados e tente novamente.';
      alert(errorMessage);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Professores</Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Buscar por nome ou departamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Novo Professor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell>Titulação</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTeachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>{teacher.cpf}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.department}</TableCell>
                <TableCell>{teacher.titulation}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(teacher)} color="primary">
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editTeacher ? 'Editar Professor' : 'Novo Professor'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="CPF" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} margin="normal" required />
          <TextField fullWidth label="Nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} margin="normal" required />
          <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} margin="normal" required />
          <TextField fullWidth label="Telefone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} margin="normal" />
          <TextField fullWidth label="Departamento" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} margin="normal" required />
          <FormControl fullWidth margin="normal">
            <InputLabel>Titulação</InputLabel>
            <Select value={formData.titulation} label="Titulação" onChange={(e) => setFormData({ ...formData, titulation: e.target.value })}>
              <MenuItem value="Graduação">Graduação</MenuItem>
              <MenuItem value="Especialização">Especialização</MenuItem>
              <MenuItem value="Mestrado">Mestrado</MenuItem>
              <MenuItem value="Doutorado">Doutorado</MenuItem>
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

export default Teachers;

