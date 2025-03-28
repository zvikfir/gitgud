import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import PageHeader from "../components/PageHeader";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Grid, Divider, Box, CircularProgress, Link } from "@mui/material";
import { toast, ToastContainer } from "react-toastify"; // Assuming you use react-toastify for the toast messages
// Import the required CSS for react-toastify
import "react-toastify/dist/ReactToastify.css";
import mockPoliciesData from "../mock/policies.json";
import { COLORS } from '../constants/colors';

import {
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import { Chip, IconButton, Tab, Tooltip } from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import ChartKPIOverTime from "../components/ChartKPIOverTime";

const AddProject = () => {
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const [inputValue, setInputValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 500); // Adjust delay as needed

  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);
  const [badges, setBadges] = useState([]);
  const [policies, setPolicies] = useState([]);

  const [addProjectBadgeEnabled, setAddProjectBadgeEnabled] = useState(true);
  const [addProjectWebhookEnabled, setAddProjectWebhookEnabled] =
    useState(true);
  const [lifecycle, setLifecycle] = useState("");
  const [stackOptions, setStackOptions] = useState([]);
  const [stack, setStack] = useState("");
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [kpis, setKPIs] = useState([]);

  const [owners, setOwners] = useState([]);
  const [runtimes, setRuntimes] = useState([]);
  const [runtimeOptions, setRuntimeOptions] = useState([]);
  const [showBoxes, setShowBoxes] = useState(false);
  const navigate = useNavigate();


  const PolicyStatus = ({ status, result, lastLog, executionId, irrelevant }) => {
    // If marked as irrelevant, show an IRRELEVANT badge
    if (irrelevant) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
          <Chip
            label="IRRELEVANT"
            sx={{
              backgroundColor: "#e0e0e0",
              color: "#000",
              fontWeight: 500
            }} />
        </Box>
      );
    }

    const getStatusConfig = () => {
      if (!status) {
        return { label: 'PENDING', colors: COLORS.policyStatus.other };
      }

      if (status === 1) {
        if (result === 1) {
          return { label: 'PASSING', colors: COLORS.policyStatus.passing };
        }
        return { label: 'FAILING', colors: COLORS.policyStatus.failing };
      }

      return { label: 'ERROR', colors: COLORS.policyStatus.other };
    };

    const config = getStatusConfig();
    const hasError = status === 1 && result === 0 && lastLog;

    return (
      <Box
        component={executionId ? Link : 'div'}
        to={executionId ? `/events/1234` : undefined}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          textDecoration: 'none',
          cursor: executionId ? 'pointer' : 'default'
        }}
      >
        <Chip
          label={config.label}
          sx={{
            backgroundColor: config.colors.bg,
            color: config.colors.color,
            fontWeight: 500,
          }}
        />
        {hasError && (
          <Tooltip title={lastLog}>
            <HelpOutlineIcon color="error" sx={{ fontSize: 20 }} />
          </Tooltip>
        )}
      </Box>
    );
  };

  useEffect(() => {
    // Use the API call for project details and override policies only with mock data.
    const fetchProjectDetails = async () => {
      try {
        let id = 13;
        const projectResponse = await fetch(`/api/projects/${id}`);
        if (!projectResponse.ok) {
          throw new Error("Failed to fetch project details");
        }
        const projectData = await projectResponse.json();
        projectData.result.policies = mockPoliciesData.results;
        setPolicies(mockPoliciesData.results);
        setKPIs(projectData.result.kpis);
      } catch (err) {
      }
    };
    fetchProjectDetails();
  }, []);

  const [policyStates, setPolicyStates] = useState(() =>
    policies.reduce((acc, policy) => {
      acc[policy.id] = false; // Assuming all switches are initially off
      return acc;
    }, {})
  );

  const handleDropdownChange = (event, value) => {
    if (value) {
      setSelectedProject(value.id);
      setShowBoxes(true);
    } else {
      setShowBoxes(false);
    }
  };

  const handleInputChange = async (event, newInputValue) => {
    if (event.type == "change") {
      setInputValue(newInputValue);
    }
  };

  const fetchOptions = async (searchValue = "") => {
    setOptionsLoading(true);
    try {
      const response = await fetch(
        `/api/projects/external?search=${searchValue}`
      );
      if (response.ok) {
        const data = await response.json();
        setOptions(
          data.results.map((x) => {
            return { label: x.path_with_namespace, id: x.id };
          })
        );
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    }
    setOptionsLoading(false);
  };
  useEffect(() => {
    fetchOptions(debouncedInputValue);
  }, [debouncedInputValue]);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await fetch(
          `/api/projects/external/${selectedProject}/policies`
        );
        if (response.ok) {
          const data = await response.json();
          //setPolicies(data.results);
          let badges = [...new Set(data.results.map((x) => { return x.kpi }))].sort();
          //console.log('badges', badges)
          setBadges(badges);
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    if (selectedProject) {
      fetchPolicies();
    }
  }, [selectedProject]);

  const handleLifecycleChange = (event) => {
    setLifecycle(event.target.value);
  };

  useEffect(() => {
    const fetchStacks = async () => {
      try {
        const response = await fetch("/api/stacks");
        if (response.ok) {
          const data = await response.json();
          // setStackOptions(
          //   data.results.map((x) => {
          //     console.log('stack', x)
          //     return { label: x.name, id: x.id };
          //   })
          // );
          setStackOptions(["Turing Stack", "Euler Stack", "Shannon Stack", "Gauss Stack", "Diffie-Stack", "Gödel Stack"].map((x) => {
            return { label: x, id: x };
          }));
        }
      } catch (error) {
        console.error("Error fetching stack options:", error);
      }
    };
    if (selectedProject) {
      fetchStacks();
    }
  }, [selectedProject]);

  const handleStackChange = (event, newValue) => {
    setStack(newValue); // Update selected stack
  };

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await fetch("/api/owners"); // Adjust endpoint as necessary
        if (response.ok) {
          const data = await response.json();
          setOwnerOptions(
            data.results.map((x) => {
              return { label: x.name, id: x.id };
            })
          );
        }
      } catch (error) {
        console.error("Error fetching owner options:", error);
      }
    };
    if (selectedProject) {
      fetchOwners();
    }
  }, [selectedProject]);

  const handleOwnersChange = (event, newValue) => {
    setOwners(newValue);
  };

  useEffect(() => {
    const fetchRuntimeOptions = async () => {
      try {
        const response = await fetch(`/api/runtime_types`);
        if (response.ok) {
          // const data = await response.json();
          // setRuntimeOptions(data.results.map((x) => {
          //   return { label: x.name, id: x.id };
          // }));
          setRuntimeOptions(['Container', 'DLL', 'Documentation', 'CLI', 'Executable', 'Lambda'].map((x) => {
            return { label: x, id: x };
          }));
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    if (selectedProject) {
      fetchRuntimeOptions();
    }
  }, [selectedProject]);

  const handleRuntimeChange = (event, newValue) => {
    setRuntimes(newValue);
  };

  const handleAddProjectBadgeEnabledChange = (event) => {
    setAddProjectBadgeEnabled(event.target.checked);
  };

  const handleAddProjectWebhookEnabledChange = (event) => {
    setAddProjectWebhookEnabled(event.target.checked);
  };

  // Handle switch change
  const handlePolicySwitch = (policyId) => (event) => {
    policies.forEach((policy) => {
      if (policy.id === policyId) {
        policy.enabled = event.target.checked;
      }
    });
    setPolicies([...policies]);
  };
  const handleSave = async () => {
    console.log("save");
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
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        let newProject = await response.json();
        navigate(`/projects/${newProject.result.id}`); // Navigate away if the request was successful
      } else {
        const errorData = await response.json(); // Parse the error response
        toast.error(`Error: ${errorData.message || "Something went wrong"}`, {
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error(`Error: ${error.message || "Something went wrong"}`, {
        position: "top-right",
      });
    }
  };

  return (
    <Container maxWidth="xl">
      <ToastContainer />
      <PageHeader
        title="Onboard a new project"
        description={`Onboard a new project and track its progress to earn badges and more.`}
      />

      <Paper elevation={3} sx={{ padding: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Select one or more projects to onboard
        </Typography>

        <Autocomplete
          options={options}
          onChange={handleDropdownChange}
          onInputChange={handleInputChange}
          loading={optionsLoading} // Pass the loading state to the Autocomplete component
          //filterOptions={(x) => {console.log(x); return x}}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Projects"
              margin="normal"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {optionsLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Paper>
      {showBoxes && (
        <div>
          {/* Render the 4 boxes */}
          <Paper elevation={3} sx={{ padding: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tell us more about your project(s)
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: "#666" }}>
              Based on your selections, we will be able to determine which
              policies are relevant for this project.
            </Typography>
            <Grid container spacing={2} sx={{ mt: 4 }}>
              {/* Left side: Dropdowns */}
              <Grid container item>
                <Grid item xs={5}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="lifecycle-label">Lifecycle</InputLabel>
                    <Select
                      labelId="lifecycle-label"
                      id="lifecycle"
                      value={lifecycle}
                      label="Select Lifecycle"
                      onChange={(e) => setLifecycle(e.target.value)}
                    >
                      <MenuItem value="early-development">
                        Early development
                      </MenuItem>
                      <MenuItem value="operational">Operational</MenuItem>
                      <MenuItem value="end-of-life">End-of-life</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ ml: 2, mr: 2 }}
                />
                <Grid item xs={6}>
                  <Typography variant="h7" sx={{ fontWeight: "bold" }}>
                    Lifecycle
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: "#666" }}>
                    Early development: The project is actively being developed,
                    with frequent changes and updates. This is the initial phase
                    of the project lifecycle.
                    <br />
                    Operational: The project is larger, with more users and more
                    features. The focus here is on stability, security, and
                    performance.
                    <br />
                    End-of-life: The project is no longer actively developed or
                    maintained. This stage may involve archiving the project or
                    transitioning it to a new team. test
                    <br />
                  </Typography>
                </Grid>
              </Grid>

              <Grid container item>
                <Grid item xs={5}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <Autocomplete
                      freeSolo
                      id="stack"
                      options={stackOptions}
                      value={stack}
                      onChange={handleStackChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Stack"
                          margin="normal"
                          variant="outlined"
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ ml: 2, mr: 2 }}
                />
                <Grid item xs={6}>
                  <Typography variant="h7" sx={{ fontWeight: "bold" }}>
                    Stack
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: "#666" }}>
                    When working on a project, it may be part of a larger stack.
                    For example, a frontend project may be part of a larger
                    stack that includes several services.
                    <br />
                    Use this field to either select an existing stack or create
                    a new one.
                  </Typography>
                </Grid>
              </Grid>

              <Grid container item>
                {/* <Grid item xs={5}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <Autocomplete
                      freeSolo
                      multiple
                      id="owners"
                      options={ownerOptions}
                      value={owners}
                      onChange={handleOwnersChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Owners"
                          margin="normal"
                          variant="outlined"
                          placeholder="Add owners"
                        />
                      )}
                    />
                  </FormControl>
                </Grid> */}
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ ml: 2, mr: 2 }}
                />
                {/* <Grid item xs={6}>
                  <Typography variant="h7" sx={{ fontWeight: "bold" }}>
                    Owners
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: "#666" }}>
                    When working on a project, it may involve multiple
                    stakeholders or team members. Use this field to either
                    select existing owners or add new ones to the project.
                  </Typography>
                </Grid> */}
              </Grid>

              <Grid container item>
                <Grid item xs={5}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <Autocomplete
                      multiple
                      id="runtime"
                      options={runtimeOptions}
                      value={runtimes}
                      onChange={handleRuntimeChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Runtime Type"
                          margin="normal"
                          variant="outlined"
                          placeholder="Select Runtime Type"
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ ml: 2, mr: 2 }}
                />
                <Grid item xs={6}>
                  <Typography variant="h7" sx={{ fontWeight: "bold" }}>
                    Type
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: "#666" }}>
                    Not all projects are the same, some are executables within a
                    container and some are libraries for example.
                    <br />
                    Use this field to either select an existing type for your
                    project.
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', gap: 2, mt: 1, verticalAlign: 'top' }}>
            {kpis.map((kpi) => (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, mb: 2, mt: 0, p: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1, p: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, justifyContent: 'space-between' }}>
                    {/* <BestPracticesKPI size={18} /> */}
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                      {kpi.name.toUpperCase()}
                    </Typography>

                  </Box>

                  <Divider sx={{ mt: 2, mb: 0 }} />
                  <Box sx={{ pt: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Table>
                      <TableBody>
                        {policies.filter(p => p.kpi.name === kpi.name).map((policy) => (
                          <TableRow>
                            <TableCell sx={{ pl: 0 }}>

                              <Box>
                                <Link to={`/policies/1`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                                    {policy.name}
                                  </Typography>
                                </Link>
                                <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.85rem', color: "text.secondary" }}>
                                  {policy.description}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={policy.enabled}
                                onChange={handlePolicySwitch(policy.id)}
                                color="primary"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>

                    </Table>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          <Accordion elevation={3} sx={{ mt: 2 }} disableGutters>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="advanced-content"
              id="advanced-header"
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Advanced
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Grid container alignItems="flex-start">
                  {/* Switch on the left */}
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={addProjectBadgeEnabled}
                          onChange={handleAddProjectBadgeEnabledChange}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </Grid>

                  {/* Title and Description on the right */}
                  <Grid item>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      Add Project Badges
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      Add badges to your Gitlab project to help developers
                      easily track their progress towards their goals.
                    </Typography>
                  </Grid>
                </Grid>
                <Divider orientation="horizontal" flexItem sx={{ mt: 1 }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Grid container alignItems="flex-start">
                  {/* Switch on the left */}
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={addProjectWebhookEnabled}
                          onChange={handleAddProjectWebhookEnabledChange}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </Grid>

                  {/* Title and Description on the right */}
                  <Grid item>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      Add webhook integration for the selected projects
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      Webhook integration is usually done on a group/system
                      level, but if needed can also be done for the specific
                      project.
                      <br />
                      <strong>Note:</strong> that this may result with multiple
                      policy executions for the same event.
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Button
            disabled={
              lifecycle === "" ||
              stack === "" ||
              owners.length === 0 ||
              runtimes.length === 0
            }
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ marginTop: 2 }}
          >
            Save
          </Button>
        </div>
      )}
    </Container>
  );
};

export default AddProject;
