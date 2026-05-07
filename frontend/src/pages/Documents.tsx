import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Grid, Select, MenuItem, FormControl, InputLabel, TextField, Card, CardContent, CardActions, CircularProgress, Alert } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { studentAPI, documentAPI } from '../services/api';

const Documents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [period, setPeriod] = useState(1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await studentAPI.getAll();
        // Handle both wrapped and unwrapped responses
        const studentsData = response.data.data || response.data;
        setStudents(studentsData);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchStudents();
  }, []);

  const handleDownload = async (type: string) => {
    if (!selectedStudent) {
      setError('Selecione um aluno primeiro');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let response: any;
      let filename = `documento_${selectedStudent}.pdf`;

      switch (type) {
        case 'transcript':
          response = await documentAPI.getTranscript(selectedStudent);
          filename = `historico_${selectedStudent}.pdf`;
          break;
        case 'enrollment':
          response = await documentAPI.getEnrollmentCertificate(selectedStudent);
          filename = `declaracao_matricula_${selectedStudent}.pdf`;
          break;
        case 'boletim':
          response = await documentAPI.getBoletim(selectedStudent, period, year);
          filename = `boletim_${selectedStudent}_${period}${year}.pdf`;
          break;
        case 'certificate':
          response = await documentAPI.getCertificate(selectedStudent);
          filename = `certificado_${selectedStudent}.pdf`;
          break;
        default:
          setLoading(false);
          return;
      }

      console.log('[Documents] Response received:', response);
      console.log('[Documents] Response status:', response.status);
      console.log('[Documents] Response headers:', response.headers);

      // Check if response is successful
      if (response.status !== 200) {
        throw new Error(`Erro do servidor: ${response.status}`);
      }

      // Get the response data - it should be a Blob
      const responseData = response.data;
      console.log('[Documents] Response data type:', typeof responseData);
      console.log('[Documents] Response data:', responseData);

      // Create blob from response data
      let blob: Blob;
      if (responseData instanceof Blob) {
        blob = responseData;
      } else if (responseData instanceof ArrayBuffer) {
        blob = new Blob([responseData], { type: 'application/pdf' });
      } else {
        // If it's a regular object, check if it's an error
        throw new Error('Resposta inválida do servidor');
      }

      console.log('[Documents] Blob created, size:', blob.size);
      console.log('[Documents] Blob type:', blob.type);

      if (blob.size === 0) {
        throw new Error('PDF gerado está vazio');
      }

      // Check content type
      if (!blob.type.includes('application/pdf')) {
        throw new Error('Resposta do servidor não é um PDF válido');
      }

      // Create URL and download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('[Documents] Download initiated successfully');
    } catch (err: any) {
      console.error('[Documents] Error downloading:', err);
      
      // Try to extract error message from response
      let errorMessage = 'Erro ao gerar documento';
      
      if (err.response) {
        // Server responded with error
        const contentType = err.response.headers?.['content-type'] || err.response.headers?.['Content-Type'];
        
        if (contentType?.includes('application/json')) {
          errorMessage = err.response.data?.error || errorMessage;
        } else {
          errorMessage = `Erro ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const documentTypes = [
    {
      title: 'Histórico Escolar',
      description: 'Documento completo com todas as disciplinas cursadas e notas',
      icon: <PictureAsPdfIcon sx={{ fontSize: 48, color: '#1976d2' }} />,
      type: 'transcript',
    },
    {
      title: 'Declaração de Matrícula',
      description: 'Comprovante de vínculo ativo com a instituição',
      icon: <DescriptionIcon sx={{ fontSize: 48, color: '#2e7d32' }} />,
      type: 'enrollment',
    },
    {
      title: 'Boletim Acadêmico',
      description: 'Notas e frequência do período selecionado',
      icon: <DescriptionIcon sx={{ fontSize: 48, color: '#ed6c02' }} />,
      type: 'boletim',
    },
    {
      title: 'Certificado',
      description: 'Certificado de conclusão ou participação',
      icon: <PictureAsPdfIcon sx={{ fontSize: 48, color: '#9c27b0' }} />,
      type: 'certificate',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Documentos</Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Gere documentos oficiais em PDF com código de verificação digital
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Selecione o Aluno</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Aluno</InputLabel>
              <Select
                value={selectedStudent}
                label="Aluno"
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name} ({student.registrationNumber})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              label="Período"
              type="number"
              value={period}
              onChange={(e) => setPeriod(parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              label="Ano"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {documentTypes.map((doc) => (
          <Grid item xs={12} sm={6} md={3} key={doc.type}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                {doc.icon}
                <Typography variant="h6" sx={{ mt: 2 }}>{doc.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {doc.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleDownload(doc.type)}
                  disabled={loading || !selectedStudent}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? 'Gerando...' : 'Gerar PDF'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Documents;

