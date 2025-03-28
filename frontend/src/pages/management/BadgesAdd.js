import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Autocomplete, CircularProgress } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import PageHeader from '../../components/PageHeader'; // Assuming you have a PageHeader component

const ManagementBadgesAdd = () => {
  const [badge, setBadge] = useState({ name: '', description: '', kpiId: '' });
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch KPI options when the component mounts
    fetchKpis();
  }, []);

  const fetchKpis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/kpis'); // Adjust this to match your API
      const data = await response.json();
      setKpis(data.results);
    } catch (error) {
      console.error('Failed to fetch KPIs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBadge((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badge),
      });
      navigate('/management/badges'); // Redirect back to the badges page after adding a new badge
    } catch (error) {
      console.error('Failed to save badge', error);
    }
  };

  return (
    <Container maxWidth="md">
      <ToastContainer />
      <PageHeader
        title="Add a new Badge"
        description="Add a new badge associated with a specific KPI."
      />

      <Paper elevation={3} sx={{ padding: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Fill out the details to create a new badge
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* Badge Name Input */}
          <Grid item xs={12}>
            <TextField
              label="Badge Name"
              variant="outlined"
              fullWidth
              value={badge.name}
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
              value={badge.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Grid>

          {/* KPI Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select KPI</InputLabel>
              <Select
                value={badge.kpiId}
                onChange={(e) => handleInputChange('kpiId', e.target.value)}
                label="Select KPI"
              >
                {loading ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : (
                  kpis.map((kpi) => (
                    <MenuItem key={kpi.id} value={kpi.id}>
                      {kpi.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!badge.name || !badge.kpiId}
            >
              Save Badge
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ManagementBadgesAdd;
