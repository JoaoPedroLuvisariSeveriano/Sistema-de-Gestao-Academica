import React, { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Chip, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { studentAPI } from '../services/api';

interface Student {
  id: string;
  cpf: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  registrationNumber: string;
  status: string;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    cpf: '',
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      // API returns { data: students, total, page, limit, totalPages }
      setStudents(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpen = (student?: Student) => {
    if (student) {
      setEditStudent(student);
      setFormData({
        cpf: student.cpf,
        name: student.name,
        email: student.email,
        phone: student.phone || '',
        address: student.address || '',
      });
    } else {
      setEditStudent(null);
      setFormData({ cpf: '', name: '', email: '', phone: '', address: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditStudent(null);
  };

  const handleSave = async () => {
    try {
      if (editStudent) {
        await studentAPI.update(editStudent.id, formData);
      } else {
        await studentAPI.create(formData);
      }
      handleClose();
      fetchStudents();
    } catch (error: any) {
      console.error('Error saving student:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao salvar aluno. Verifique os dados e tente novamente.';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja inativar este aluno?')) {
      try {
        await studentAPI.delete(id);
        fetchStudents();
      } catch (error: any) {
        console.error('Error deleting student:', error);
        const errorMessage = error.response?.data?.error || 'Erro ao inativar aluno.';
        alert(errorMessage);
      }
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registrationNumber.includes(searchTerm) ||
    student.cpf.includes(searchTerm)
  );

  const getStatusChip = (status: string) => {
    const colors: any = {
      active: 'success',
      inactive: 'error',
      suspended: 'warning',
      graduated: 'info',
    };
    const labels: any = {
      active: 'Ativo',
      inactive: 'Inativo',
      suspended: 'Suspenso',
      graduated: 'Formado',
    };
    return <Chip label={labels[status] || status} color={colors[status] || 'default'} size="small" />;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Alunos</Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Buscar por nome, matrícula ou CPF..."
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
          Novo Aluno
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Matrícula</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.registrationNumber}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.cpf}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{getStatusChip(student.status)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(student)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(student.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editStudent ? 'Editar Aluno' : 'Novo Aluno'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="CPF"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Telefone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Endereço"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students;

