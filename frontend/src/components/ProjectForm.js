import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Box,
  CircularProgress,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { toast, ToastContainer } from "react-toastify";

const ProjectForm = ({ projectId }) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [badges, setBadges] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [lifecycle, setLifecycle] = useState("");
  const [stackOptions, setStackOptions] = useState([]);
  const [stack, setStack] = useState("");
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [owners, setOwners] = useState([]);
  const [runtimes, setRuntimes] = useState([]);
  const [runtimeOptions, setRuntimeOptions] = useState([]);
  const [addProjectBadgeEnabled, setAddProjectBadgeEnabled] = useState(true);
  const [addProjectWebhookEnabled, setAddProjectWebhookEnabled] = useState(false);
  const [addProjectKpiEnabled, setAddProjectKpiEnabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (projectId) {
      // Fetch existing project details and populate the form fields
      fetchProjectDetails(projectId);
    }
  }, [projectId]);

  const fetchProjectDetails = async (id) => {
    // Replace with the actual API call to fetch project details
    const response = await fetch(`/api/projects/${id}`);
    const project = await response.json();

    setSelectedProject(project.id);
    setLifecycle(project.lifecycle);
    setStack(project.stack);
    setOwners(project.owners);
    setRuntimes(project.runtimes);
    setAddProjectBadgeEnabled(project.add_project_badge);
    setAddProjectWebhookEnabled(project.add_project_webhook);
    // Fetch related policies
    fetchPolicies(project.id);
  };

  const fetchPolicies = async (projectId) => {
    const response = await fetch(`/api/projects/${projectId}/policies`);
    const data = await response.json();
    setPolicies(data.results);
    setBadges(
      [...new Set(data.results.map((x) => (Array.isArray(x.badge) ? x.badge[0] : x.badge)))]
        .sort()
    );
  };

  const handleSave = async () => {
    const payload = {
      project_id: selectedProject,
      lifecycle: lifecycle,
      stack: stack,
      owners: owners,
      runtimes: runtimes,
      policies: policies.filter((policy) => !policy.enabled),
      add_project_badge: addProjectBadgeEnabled,
      add_project_webhook: addProjectWebhookEnabled,
    };
    
    try {
      const response = await fetch(projectId ? `/api/projects/${projectId}` : '/api/projects', {
        method: projectId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate("/projects");
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message || 'Something went wrong'}`);
      }
    } catch (error) {
      toast.error(`Error: ${error.message || 'Something went wrong'}`);
    }
  };

  return (
    <Container maxWidth="md">
      <ToastContainer />
      <Paper elevation={3} sx={{ padding: 2 }}>
        <Typography variant="h6">Project Details</Typography>
        {/* Form Fields for Project Details */}
        <Grid container spacing={2}>
          {/* Lifecycle Field */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="lifecycle-label">Lifecycle</InputLabel>
              <Select
                labelId="lifecycle-label"
                id="lifecycle"
                value={lifecycle}
                label="Lifecycle"
                onChange={(e) => setLifecycle(e.target.value)}
              >
                <MenuItem value="early-development">Early Development</MenuItem>
                <MenuItem value="operational">Operational</MenuItem>
                <MenuItem value="end-of-life">End of Life</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Stack Field */}
          <Grid item xs={6}>
            <Autocomplete
              id="stack"
              options={stackOptions}
              value={stack}
              onChange={(event, newValue) => setStack(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Stack" variant="outlined" />
              )}
            />
          </Grid>
          
          {/* Other form fields similar to the above */}
          {/* ... */}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        <Typography variant="h6">Available Policies</Typography>
        {/* Render policies and switches here */}
        {/* ... */}
      </Paper>

      <Accordion elevation={3} sx={{ marginTop: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Advanced Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Switch
                checked={addProjectBadgeEnabled}
                onChange={(e) => setAddProjectBadgeEnabled(e.target.checked)}
              />
            }
            label="Add Project Badges"
          />
          <FormControlLabel
            control={
              <Switch
                checked={addProjectWebhookEnabled}
                onChange={(e) => setAddProjectWebhookEnabled(e.target.checked)}
              />
            }
            label="Add Project Webhooks"
          />
          <FormControlLabel
            control={
              <Switch
                checked={addProjectKpiEnabled}
                onChange={(e) => setAddProjectKpiEnabled(e.target.checked)}
              />
            }
            label="Add Project KPIs"
          />
        </AccordionDetails>
      </Accordion>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ marginTop: 2 }}
      >
        {projectId ? "Save Changes" : "Add Project"}
      </Button>
    </Container>
  );
};

export default ProjectForm;
