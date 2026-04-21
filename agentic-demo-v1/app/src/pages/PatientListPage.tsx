import { useNavigate } from 'react-router-dom';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { usePatients } from '../hooks/useFhir';
import { calculateAge, formatHumanName, getMRN } from '../utils/fhir';

export default function PatientListPage() {
  const navigate = useNavigate();
  const { data: patients, isLoading, error } = usePatients();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) return <Typography color="error">Failed to load patients</Typography>;

  const rows = (patients ?? []).map((p: any) => ({
    id: p.id,
    name: formatHumanName(p.name),
    mrn: getMRN(p),
    age: calculateAge(p.birthDate) ?? '—',
    gender: p.gender ?? '—',
    dob: p.birthDate ?? '—',
  }));

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Patient', flex: 1.5, minWidth: 180 },
    { field: 'mrn', headerName: 'MRN', width: 140 },
    { field: 'age', headerName: 'Age', width: 80, type: 'number' },
    { field: 'gender', headerName: 'Sex', width: 100 },
    { field: 'dob', headerName: 'DOB', width: 140 },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Hypertension Patients
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        onRowClick={(p) => navigate(`/patients/${p.id}`)}
        disableRowSelectionOnClick
        autoHeight
        sx={{ cursor: 'pointer' }}
        pageSizeOptions={[10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      />
    </Paper>
  );
}
