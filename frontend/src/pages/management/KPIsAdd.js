import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Autocomplete, CircularProgress } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import PageHeader from '../../components/PageHeader'; // Assuming you have a PageHeader component

const ManagementKPIsAdd = () => {
  const [kpi, setKPI] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch KPI options when the component mounts

  }, []);

  const handleInputChange = (field, value) => {
    setKPI((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await fetch('/api/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kpi),
      });
      navigate('/management/kpis'); // Redirect back to the kpis page after adding a new kpi
    } catch (error) {
      console.error('Failed to save kpi', error);
    }
  };

  return (
    <Container maxWidth="md">
      <ToastContainer />
      <PageHeader
        title="Add a new KPI"
        description="Add a new KPI."
      />

      <Paper elevation={3} sx={{ padding: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Fill out the details to create a new KPI
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* KPI Name Input */}
          <Grid item xs={12}>
            <TextField
              label="KPI Name"
              variant="outlined"
              fullWidth
              value={kpi.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </Grid>

          {/* Description Input */}
          <Grid item xs={12}>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={kpi.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Grid>


          {/* Save Button */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!kpi.name}
            >
              Save KPI
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ManagementKPIsAdd;
