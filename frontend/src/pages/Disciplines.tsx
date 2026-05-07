
import React, { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, InputAdornment, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { disciplineAPI, courseAPI } from '../services/api';

interface Discipline {
  id: string;
  name: string;
  description: string;
  ementa: string;
  workload: number;
  credits: number;
  period: number;
  courseId: string;
  course?: { name: string };
  prerequisiteIds?: string[];
  status?: string;
}

const Disciplines: React.FC = () => {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editDiscipline, setEditDiscipline] = useState<Discipline | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    ementa: '',
    workload: 0, 
    credits: 0,
    period: 1,
    courseId: '', 
    prerequisiteIds: [] as string[] 
  });

  const fetchData = async () => {
    try {
      const [disciplinesRes, coursesRes] = await Promise.all([disciplineAPI.getAll(), courseAPI.getAll()]);
      // API returns { data: items, total, page, limit, totalPages }
      setDisciplines(disciplinesRes.data.data || disciplinesRes.data);
      setCourses(coursesRes.data.data || coursesRes.data);
    } catch (error) { 
      console.error('Error:', error); 
    }
    finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpen = (discipline?: Discipline) => {
    if (discipline) {
      setEditDiscipline(discipline);
      setFormData({ 
        name: discipline.name, 
        description: discipline.description || '', 
        ementa: discipline.ementa || '',
        workload: discipline.workload || 0, 
        credits: discipline.credits || 0,
        period: discipline.period || 1,
        courseId: discipline.courseId, 
        prerequisiteIds: discipline.prerequisiteIds || [] 
      });
    } else { 
      setEditDiscipline(null); 
      setFormData({ 
        name: '', 
        description: '', 
        ementa: '',
        workload: 0, 
        credits: 0,
        period: 1,
        courseId: '', 
        prerequisiteIds: [] 
      }); 
    }
    setOpen(true);
  };

  const handleClose = () => { setOpen(false); setEditDiscipline(null); };

  const handleSave = async () => {
    try {
      if (editDiscipline) {
        await disciplineAPI.update(editDiscipline.id, formData);
      } else {
        await disciplineAPI.create(formData);
      }
      handleClose();
      fetchData();
    } catch (error: any) { 
      console.error('Error:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao salvar disciplina. Verifique os dados e tente novamente.';
      alert(errorMessage);
    }
  };

  const filteredDisciplines = disciplines.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getStatusChip = (status: string) => {
    const isActive = status === 'active' || status === 'ACTIVE';
    return <Chip label={isActive ? 'Ativo' : 'Inativo'} color={isActive ? 'success' : 'error'} size="small" />;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Disciplinas</Typography>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField 
          placeholder="Buscar por nome..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          InputProps={{ 
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ) 
          }} 
          sx={{ flexGrow: 1, maxWidth: 400 }} 
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Nova Disciplina
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Carga Horária</TableCell>
              <TableCell>Créditos</TableCell>
              <TableCell>Período</TableCell>
              <TableCell>Curso</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDisciplines.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.name}</TableCell>
                <TableCell>{d.description}</TableCell>
                <TableCell>{d.workload}h</TableCell>
                <TableCell>{d.credits}</TableCell>
                <TableCell>{d.period}º</TableCell>
                <TableCell>{d.course?.name}</TableCell>
                <TableCell>{getStatusChip(d.status || 'active')}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(d)} color="primary">
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editDiscipline ? 'Editar Disciplina' : 'Nova Disciplina'}</DialogTitle>
        <DialogContent>
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
            label="Descrição" 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            margin="normal" 
          />
          <TextField 
            fullWidth 
            label="Ementa" 
            value={formData.ementa} 
            onChange={(e) => setFormData({ ...formData, ementa: e.target.value })} 
            margin="normal" 
            multiline
            rows={3}
          />
          <TextField 
            fullWidth 
            label="Carga Horária" 
            type="number" 
            value={formData.workload} 
            onChange={(e) => setFormData({ ...formData, workload: parseInt(e.target.value) || 0 })} 
            margin="normal" 
          />
          <TextField 
            fullWidth 
            label="Créditos" 
            type="number" 
            value={formData.credits} 
            onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })} 
            margin="normal" 
          />
          <TextField 
            fullWidth 
            label="Período" 
            type="number" 
            value={formData.period} 
            onChange={(e) => setFormData({ ...formData, period: parseInt(e.target.value) || 1 })} 
            margin="normal" 
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Curso</InputLabel>
            <Select 
              value={formData.courseId} 
              label="Curso" 
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            >
              {courses.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
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

export default Disciplines;


