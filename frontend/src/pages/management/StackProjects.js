import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container, Typography, Box, Button,
  TableContainer, Table, TableBody, TableRow,
  TableCell, InputBase, TableHead
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import Divider from "@mui/material/Divider";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ReactMarkdown from "react-markdown";
import Avatar from "@mui/material/Avatar";
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import Menu from '@mui/material/Menu';
import { COLORS } from '../../constants/colors';
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import projectsMock from "../../mock/projects.json";
import policiesMock from "../../mock/policies.json"; // if needed
import stacksMock from "../../mock/stacks.json"; // if needed
import ChartKPIOverTime from "../../components/ChartKPIOverTime";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ChartPolicyOverTime from "../../components/ChartPolicyOverTime";

const StyledChip = styled('div')(({ theme, type }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.775rem',
  fontWeight: 500,
  margin: '2px',
  backgroundColor: COLORS[`tag${type}`] || COLORS.tagLanguages,
  color: '#4A4A4A',
}));

// NEW: Added StyledKPIChip copied from Policies.js
const StyledKPIChip = styled('div')(({ theme, type }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.675rem',
  fontWeight: 500,
  margin: '2px',
  backgroundColor: COLORS[`tag${type}`] || COLORS.tagLanguages,
  color: '#4A4A4A',
}));

// New helper function to truncate description to 256 words
const truncateDescription = (desc) => {
  if (!desc) return 'No description';
  desc = desc.trim().split('\n\n')[0]; // Get the first paragraph
  const words = desc.split(/\s+/);
  return words.length <= 28 ? desc : words.slice(0, 28).join(' ') + '...';
};

// New PolicyStatus component (copied from Project.js style)
const PolicyStatus = ({ status, result, lastLog, executionId, irrelevant }) => {
  if (irrelevant) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip label="IRRELEVANT" sx={{ backgroundColor: "#e0e0e0", color: "#000", fontWeight: 500 }} />
      </Box>
    );
  }
  const getStatusConfig = () => {
    if (!status) {
      return { label: 'PENDING', colors: { bg: COLORS.policyStatus.other.bg, color: COLORS.policyStatus.other.color } };
    }
    if (status === 1) {
      return result === 1 ? COLORS.policyStatus.passing : COLORS.policyStatus.failing;
    }
    return COLORS.policyStatus.other;
  };
  const config = getStatusConfig();
  const hasError = status === 1 && result === 0 && lastLog;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
      <Chip label={config.label} sx={{ backgroundColor: config.bg, color: config.color, fontWeight: 500 }} />
      {hasError && (
        <Tooltip title={lastLog}>
          <HelpOutlineIcon color="error" sx={{ fontSize: 20 }} />
        </Tooltip>
      )}
    </Box>
  );
};

const StackProjects = () => {
  const { id } = useParams(); // Stack ID from URL
  const navigate = useNavigate();
  const [stack, setStack] = useState(null);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [viewType, setViewType] = useState("projects");
  const [showByAnchorEl, setShowByAnchorEl] = useState(null);

  const fetchStackProjects = () => {
    // Remove API call and use mock data
    const allProjects = projectsMock.results;
    // Filter Shannon Stack projects and assign executionStatus (80% passed, 20% failed)
    const shannonProjects = allProjects
      .filter(project =>
        project.stacks.some(stack => stack.name === "Shannon Stack")
      )
      .map(project => ({
        ...project,
        executionStatus: Math.random() < 0.8 ? 'passed' : 'failed'
      }));
    const updatedStacks = stacksMock.stacks.map(stack => {
      // Filter projects for the current stack based on matching stack name
      const stackProjects = projectsMock.results.filter(project =>
        project.stacks.some(s => s.name === stack.name)
      );
      // Aggregate KPIs from each project in the stack
      let aggregatedKpis = [];
      stackProjects.forEach(project => {
        project.kpis.forEach((kpi, i) => {
          if (aggregatedKpis[i]) {
            aggregatedKpis[i].passedPolicyCount += kpi.passedPolicyCount;
            aggregatedKpis[i].policyCount += kpi.policyCount;
          } else {
            aggregatedKpis[i] = { passedPolicyCount: kpi.passedPolicyCount, policyCount: kpi.policyCount };
          }
        });
      });
      // Aggregate languages and contributors to avoid undefined errors
      let aggregatedLanguages = [];
      let aggregatedContributors = [];
      stackProjects.forEach(project => {
        project.languages.forEach(lang => {
          if (lang.name && !aggregatedLanguages.find(l => l.name === lang.name)) {
            aggregatedLanguages.push({ name: lang.name });
          }
        });
        project.contributors.forEach(contrib => {
          if (contrib.name && !aggregatedContributors.find(c => c.id === contrib.id)) {
            aggregatedContributors.push(contrib);
          }
        });
      });

      return {
        ...stack,
        projects: stackProjects,
        totalProjects: stackProjects.length,
        kpis: aggregatedKpis,
        languages: aggregatedLanguages,     // Added aggregated languages
        contributors: aggregatedContributors // Added aggregated contributors
      };
    });



    setProjects(shannonProjects);
    // Optionally set the stack state to a fixed object for display
    setStack(updatedStacks[2]);
    setLoading(false);
  };

  // Add custom paragraph component for ReactMarkdown:
  const MarkdownParagraph = ({ node, ...props }) => <p style={{ marginTop: 0, marginBottom: 0 }} {...props} />;

  // Add helper function to get initials from a name
  const getInitials = (name) => {
    const names = name.split(" ");
    return names.map(n => n[0]).join("").toUpperCase();
  };

  const toggleFollow = async (stackId, newState) => {
    await axios.post(`/api/stacks/${stackId}/follow`, {
      userId: 1, // Replace with actual user ID
      state: newState
    });
    fetchStackProjects();
  };

  const handleAddProject = () => {
    navigate("/projects/add"); // Navigate to the add project page
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset to first page
  };

  // Handlers for Filter Menu
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handlers for Sort Menu
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  // New handlers for Show by menu
  const handleShowByClick = (event) => {
    setShowByAnchorEl(event.currentTarget);
  };
  const handleShowByClose = () => {
    setShowByAnchorEl(null);
  };
  const handleViewChange = (newView) => {
    setViewType(newView);
    handleShowByClose();
  };

  useEffect(() => {
    fetchStackProjects();
  }, [id, searchQuery]);

  const handleRowClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const getStateChip = (stack, m = 0) => {
    return <Chip label="Contributor" sx={{ bgcolor: COLORS.stateChips.contributor, color: "#fff" }} />;
    switch (stack.state) {
      case "not-following":
        if (stack.demo) {
          return (
            <Chip
              label="Follow"
              sx={{ mr: m, ml: m, bgcolor: COLORS.stateChips.follow, color: "#fff" }}
            />
          );
        } else {
          return (
            <Chip
              label="Follow"
              sx={{ mr: m, ml: m, bgcolor: COLORS.stateChips.follow, color: "#fff" }}
              onClick={() => toggleFollow(stack.id, 1)}
            />
          );
        }
      case "contributor":
        return <Chip label="Contributor" sx={{ bgcolor: COLORS.stateChips.contributor, color: "#fff" }} />;
      case "following":
        return <Chip label="Unfollow" sx={{ bgcolor: COLORS.stateChips.unfollow, color: "#000" }} onClick={() => toggleFollow(stack.id, 0)} />;
      default:
        return (
          <Chip
            label="Follow"
            sx={{ bgcolor: COLORS.stateChips.follow, color: "#fff" }}
            onClick={() => toggleFollow(stack.id, 1)}
          />
        );
    }
  };
  return (
    <Container maxWidth="xl">

      {stack && (

        <>
          <Box sx={{ display: "flex", mb: 2, mt: 2, p: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1 }}>
            <Box sx={{ flex: 1, pr: 2, ml: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h3"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: "2.45rem",
                    fontWeight: 700,
                    textAlign: "left",
                    marginTop: 2,
                    ml: 0,
                    mr: 2
                  }}>
                  {stack.name}
                </Typography>
                {getStateChip(stack, 3)}
              </Box>
              <Typography variant="body1"
                component="p"
                gutterBottom
                sx={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "1.15rem",
                  textAlign: "left",
                  marginBottom: 2,
                  paddingRight: 20,
                  color: "text.secondary",
                  ml: 1
                }}>
                {stack.description}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1, pl: 2 }}>
              {/* Future visualization goes here */}
            </Box>
          </Box>

          <>
            <Box sx={{ boxShadow: 3, borderRadius: 1, bgcolor: "background.paper", p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0, p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Box sx={{ display: "flex", alignItems: "center", borderBottom: 0, borderColor: "divider" }}>
                  <SearchIcon />
                  <InputBase
                    placeholder={
                      viewType === "projects"
                        ? "Search " + projects.length + " Projects"
                        : "Search " + policiesMock.results.length + " Policies"
                    }
                    value={searchQuery}
                    onChange={handleSearchChange}
                    sx={{ ml: 1, flex: 1, minWidth: 400 }}
                  />
                </Box>
                <Box>                  <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchStackProjects}
                  sx={{ mr: 2 }}
                >
                  Refresh
                </Button>
                  <Button
                    variant="outlined"
                    onClick={handleShowByClick}
                    sx={{ mr: 2 }}
                  >
                    Show by: {viewType === "projects" ? "Projects" : "Policy"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={handleFilterClick}
                    sx={{ mr: 2 }}
                  >
                    Filter
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SortIcon />}
                    onClick={handleSortClick}
                    sx={{}}
                  >
                    Sort
                  </Button>
                  {/* New "Show by" dropdown */}

                  <Menu
                    anchorEl={showByAnchorEl}
                    open={Boolean(showByAnchorEl)}
                    onClose={handleShowByClose}
                  >
                    <MenuItem onClick={() => handleViewChange("projects")}>Projects</MenuItem>
                    <MenuItem onClick={() => handleViewChange("policies")}>Policy</MenuItem>
                  </Menu>
                </Box>
              </Box>
              {/* Conditional table rendering based on viewType */}
              {viewType === "projects" ? (
                // ...existing project table code...
                <Box sx={{ mt: 0 }}>
                  {projects.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      {loading ? (
                        <Typography variant="body1">Loading...</Typography>
                      ) : (
                        <Typography variant="body1">No results found</Typography>
                      )}
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableBody>
                          {projects.map((project) => (
                            <TableRow key={project.id} sx={{ verticalAlign: 'top' }}>
                              {/* ...existing columns for project row... */}
                              <TableCell sx={{ width: '40%', verticalAlign: 'top' }}>
                                {/* ...existing project name and description rendering... */}
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                  <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1.6rem' }}>
                                    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                      {project.name}
                                    </Link>
                                  </Typography>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    <ReactMarkdown components={{ p: MarkdownParagraph }}>
                                      {truncateDescription(project.description)}
                                    </ReactMarkdown>
                                  </Typography>
                                </Box>
                              </TableCell>
                              {/* ...other columns unchanged... */}
                              <TableCell sx={{ width: '20%', verticalAlign: 'top' }}>
                                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'left' }}>
                                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between' }}>
                                      {/* <BestPracticesKPI size={18} /> */}
                                      <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                                        BEST PRACTICES ({stack.kpis && stack.kpis[0] && stack.kpis[0].policyCount ? Math.round((stack.kpis[0].passedPolicyCount / stack.kpis[0].policyCount) * 100) : 0}%)
                                      </Typography>
                                      {stack.kpis[0] ? (
                                        <Typography variant="caption" color="text.secondary">
                                          {stack.kpis[0].passedPolicyCount}/{stack.kpis[0].policyCount} passed
                                        </Typography>
                                      ) : (
                                        <Typography variant="caption" color="text.secondary">
                                          No checks yet
                                        </Typography>
                                      )}
                                    </Box>
                                    {(() => {
                                      const kpi = stack.kpis[0] || { passedPolicyCount: 0, policyCount: 0, na: true };
                                      const percentage = kpi.na ? 0 : Math.round((kpi.passedPolicyCount / kpi.policyCount) * 100);
                                      const kpiColor = COLORS.bestPractices || "#4caf50";
                                      return (
                                        <Box sx={{ width: '100%', backgroundColor: `${kpiColor}30`, borderRadius: 2, height: 10, mt: 0.5 }}>
                                          <Box sx={{ width: `${percentage}%`, backgroundColor: kpiColor, height: '100%', borderRadius: 2 }} />
                                        </Box>
                                      );
                                    })()}
                                  </Box>
                                  <Box>
                                    <ChartKPIOverTime height={50} />
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ width: '20%', verticalAlign: 'top' }}>
                                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'left' }}>
                                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between' }}>
                                      {/* <ComplianceKPI size={18} /> */}
                                      <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                                        COMPLIANCE ({stack.kpis && stack.kpis[1] && stack.kpis[1].policyCount ? Math.round((stack.kpis[1].passedPolicyCount / stack.kpis[1].policyCount) * 100) : 0}%)
                                      </Typography>
                                      {stack.kpis[1] ? (
                                        <Typography variant="caption" color="text.secondary">
                                          {stack.kpis[1].passedPolicyCount}/{stack.kpis[1].policyCount} passed
                                        </Typography>
                                      ) : (
                                        <Typography variant="caption" color="text.secondary">
                                          No checks yet
                                        </Typography>
                                      )}
                                    </Box>
                                    {(() => {
                                      const kpi = stack.kpis[1] || { passedPolicyCount: 0, policyCount: 0, na: true };
                                      const percentage = kpi.na ? 0 : Math.round((kpi.passedPolicyCount / kpi.policyCount) * 100);
                                      const kpiColor = COLORS.compliance || "#ffeb3b";
                                      return (
                                        <Box sx={{ width: '100%', backgroundColor: `${kpiColor}30`, borderRadius: 2, height: 10, mt: 0.5 }}>
                                          <Box sx={{ width: `${percentage}%`, backgroundColor: kpiColor, height: '100%', borderRadius: 2 }} />
                                        </Box>
                                      );
                                    })()}
                                  </Box>
                                  <Box>
                                    <ChartKPIOverTime color={COLORS.compliance} height={50} />
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ width: '20%', verticalAlign: 'top' }}>
                                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'left' }}>
                                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between' }}>
                                      {/* <ResilienceKPI size={18} /> */}
                                      <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                                        RESILIENCE ({stack.kpis && stack.kpis[2] && stack.kpis[2].policyCount ? Math.round((stack.kpis[2].passedPolicyCount / stack.kpis[2].policyCount) * 100) : 0}%)
                                      </Typography>
                                      {stack.kpis[2] ? (
                                        <Typography variant="caption" color="text.secondary">
                                          {stack.kpis[2].passedPolicyCount}/{stack.kpis[2].policyCount} passed
                                        </Typography>
                                      ) : (
                                        <Typography variant="caption" color="text.secondary">
                                          No checks yet
                                        </Typography>
                                      )}
                                    </Box>
                                    {(() => {
                                      const kpi = stack.kpis[2] || { passedPolicyCount: 0, policyCount: 0, na: true };
                                      const percentage = kpi.na ? 0 : Math.round((kpi.passedPolicyCount / kpi.policyCount) * 100);
                                      const kpiColor = COLORS.resilience || "#9c27b0";
                                      return (
                                        <Box sx={{ width: '100%', backgroundColor: `${kpiColor}30`, borderRadius: 2, height: 10, mt: 0.5 }}>
                                          <Box sx={{ width: `${percentage}%`, backgroundColor: kpiColor, height: '100%', borderRadius: 2 }} />
                                        </Box>
                                      );
                                    })()}
                                  </Box>
                                  <Box>
                                    <ChartKPIOverTime color={COLORS.resilience} height={50} />
                                  </Box>
                                </Box>
                              </TableCell>
                      
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              ) : (
                <Box sx={{ mt: 0 }}>
                  {policiesMock.results.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="body1">No policies found</Typography>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableBody>
                          {policiesMock.results.map(policy => {
                            // Build execution lists from all mocked projects with 80% pass rate
                            const passedExecutions = [];
                            const failedExecutions = [];
                            projectsMock.results.filter(x => x.stacks[0].name == "Shannon Stack").forEach(project => {
                              if (Math.random() < 0.8) {
                                passedExecutions.push({ projectName: project.name });
                              } else {
                                failedExecutions.push({ projectName: project.name });
                              }
                            });
                            return (
                              <TableRow key={policy.id}>
                                {/* Column 1: Policy name and description */}
                                <TableCell sx={{ width: '40%', verticalAlign: 'top' }}>
                                  <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1.6rem' }}>
                                    {policy.name}
                                  </Typography>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    <ReactMarkdown components={{ p: MarkdownParagraph }}>
                                      {truncateDescription(policy.description)}
                                    </ReactMarkdown>
                                  </Typography>
                                </TableCell>
                                {/* Column 2: Passed projects */}
                                <TableCell sx={{ width: '35%', verticalAlign: 'top' }}>
                                  {passedExecutions.map((exec, index) => (
                                    <Chip
                                      key={index}
                                      label={exec.projectName}
                                      sx={{
                                        backgroundColor: COLORS.policyStatus.passing.bg,
                                        color: COLORS.policyStatus.passing.color,
                                        fontWeight: 500,
                                        mr: 0.5,
                                        mb: 0.5
                                      }}
                                    />
                                  ))}
                    
                                  {failedExecutions.map((exec, index) => (
                                    <Chip
                                      key={index}
                                      label={exec.projectName}
                                      sx={{
                                        backgroundColor: COLORS.policyStatus.failing.bg,
                                        color: COLORS.policyStatus.failing.color,
                                        fontWeight: 500,
                                        mr: 0.5,
                                        mb: 0.5
                                      }}
                                    />
                                  ))}
                                </TableCell>
                                {/* Column 4: Empty */}
                                <TableCell sx={{ width: '25%', verticalAlign: 'top' }}>
                              
                                  <ChartPolicyOverTime height={70}/>
                     
                              </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", p: 2, borderTop: 0, borderColor: "divider" }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Rows per page:
                </Typography>
                <Select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  sx={{ mr: 2, minWidth: 60 }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        padding: 0,
                      },
                    },
                  }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
                <Pagination
                  count={
                    viewType === "projects"
                      ? Math.ceil(projects.length / rowsPerPage)
                      : Math.ceil(policiesMock.results.length / rowsPerPage)
                  }
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            </Box>
          </>

        </>
      )}

    </Container>

  );
};

export default StackProjects;
