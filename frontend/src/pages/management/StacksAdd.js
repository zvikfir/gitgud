import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, Autocomplete, CircularProgress } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import PageHeader from '../../components/PageHeader'; // Assuming you have a PageHeader component

const ManagementStacksAdd = () => {
  const [stack, setStack] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch stack options when the component mounts

  }, []);

  const handleInputChange = (field, value) => {
    setStack((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await fetch('/api/stacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stack),
      });
      navigate('/management/stacks'); // Redirect back to the stacks page after adding a new stack
    } catch (error) {
      console.error('Failed to save stack', error);
    }
  };

  return (
    <Container maxWidth="md">
      <ToastContainer />
      <PageHeader
        title="Add a new Stack"
        description="Add a new technology stack."
      />

      <Paper elevation={3} sx={{ padding: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Fill out the details to create a new Stack
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* Stack Name Input */}
          <Grid item xs={12}>
            <TextField
              label="Stack Name"
              variant="outlined"
              fullWidth
              value={stack.name}
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
              value={stack.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Grid>


          {/* Save Button */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!stack.name}
            >
              Save Stack
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ManagementStacksAdd;
