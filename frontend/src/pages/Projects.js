import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { COLORS } from '../constants/colors';

import {
  Container, Typography, Paper, Box, Button,
  TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TextField, InputAdornment,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import Loading from "../components/Loading";
import { BestPracticesKPI, ComplianceKPI, ResilienceKPI } from '../components/KPIShapes';
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ReactMarkdown from "react-markdown";
import Avatar from "@mui/material/Avatar";
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import Menu from '@mui/material/Menu';
import projectsMock from "../mock/projects.json";
import ChartPolicyOverTime from "../components/ChartPolicyOverTime";
import ChartPolicyCounts from "../components/ChartPolicyCounts";



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

// New helper function to truncate description to 256 words
const truncateDescription = (desc) => {
  if (!desc) return 'No description';
  desc = desc.trim().split('\n\n')[0]; // Get the first paragraph
  const words = desc.split(/\s+/);
  return words.length <= 28 ? desc : words.slice(0, 28).join(' ') + '...';
};

// Add custom paragraph component for ReactMarkdown:
const MarkdownParagraph = ({ node, ...props }) => <p style={{ marginTop: 0, marginBottom: 0 }} {...props} />;

// Add helper function to get initials from a name
const getInitials = (name) => {
  const names = name.split(" ");
  return names.map(n => n[0]).join("").toUpperCase();
};

const Projects = () => {
  useEffect(() => {
    document.title = "Projects | gitgud";
  }, []);

  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  const policiesPerKPI = React.useMemo(() => {
    if (!projects) return [];
    const counts = projects.reduce((acc, policy) => {
      const kpi = policy.kpi.name || "Unknown";
      acc[kpi] = (acc[kpi] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([title, count]) => ({ title, count }));
  }, []);

  // Fetch Projects data from the API

  function sortProjects(projects, by = 'name', order = 'asc') {
    console.log('projects sort', projects);
    const sortedProjects = [...projects];
    sortedProjects.sort((a, b) => {
      if (order === 'asc') {
        console.log('asc');
        console.log(a[by])
        return a[by].localeCompare(b[by]);
      } else {
        return b[by].localeCompare(a[by]);
      }
    });
    return sortedProjects;
  }

  const fetchProjects = async () => {
    // Uncomment below to use backend API
    /*
    try {
      setProjects([]);
      setLoading(true);
      const response = await fetch(`/api/projects`);
      if (!response.ok) {
        throw new Error("Failed to fetch Projects");
      }
      const data = await response.json();
      let projects = sortProjects(data.results);
      projects = projects.map(project => {
        project.contributors = project.contributors.reduce((acc, contributor) => {
          if (!acc.find(c => c.name === contributor.name)) {
            acc.push(contributor);
          }
          return acc;
        }, []);
        return project;
      });
      setProjects(projects);
    } catch (err) {
      // ...error handling...
    } finally {
      setLoading(false);
    }
    */

    // Using mock data for demo
    let projectsData = projectsMock.results;
    projectsData = projectsData.map(project => {
      project.contributors = project.contributors.reduce((acc, contributor) => {
        if (!acc.find(c => c.name === contributor.name)) {
          acc.push(contributor);
        }
        return acc;
      }, []);
      return project;
    });
    setProjects(projectsData);
    setLoading(false);
  };

  // Fetch events data from the API when the component mounts
  useEffect(() => {
    fetchProjects();
  }, [page, rowsPerPage, searchQuery]);

  const handleRowClick = (id) => {
    navigate(`/projects/${id}`); // Navigate to the detailed view
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

  return (
    <>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", mb: 2, mt: 2, p: 2, pb: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1 }}>
          <Box sx={{ flex: 1, pr: 2, ml: 1 }}>
            <Typography variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "2.45rem",
                fontWeight: 700,
                textAlign: "left",
                marginTop: 0,
                ml: 1
              }}>
              Projects
            </Typography>
            <Typography variant="body1"
              component="p"
              gutterBottom
              sx={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "1rem",
                textAlign: "left",
                marginBottom: 2,
                paddingRight: 20,
                color: "text.secondary",
                ml: 1
              }}>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <p className="text-lg text-gray-700" style={{ marginBlock: 0 }}>
                  <strong>Manage and monitor all your projects</strong> in one place.
                  Track their <strong>compliance</strong>, <strong>best practices adherence</strong>, and <strong>resilience scores</strong> with ease.
                </p>
                <p>
                  <strong>Configure</strong> project-specific policies, <strong>evaluate</strong> them against your organization's standards,
                  and <strong>gain insights</strong> into their security, stability, and governance.
                </p>
              </div>
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: 1, pl: 2, display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'space-between' }}>
            {/* <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'left', width: '40%' }}>

              <Box sx={{ flex: 1, mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.75rem' }}>
                    TOTAL PROJECTS
                  </Typography>

                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 175 }}>

                </Box>

              </Box>
            </Box> */}
            {/* <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'left', width: '60%' }}>

              <Box sx={{ flex: 1, mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.75rem' }}>
                    EXECUTIONS/ERRORS
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last 30 days
                  </Typography>
                </Box>
                <Box sx={{ pt: 1 }}>

                </Box>

              </Box>
            </Box> */}

          </Box>
        </Box>
        <>
          <Box sx={{ boxShadow: 3, borderRadius: 1, bgcolor: "background.paper", p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0, p: 2, borderBottom: 1, borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", borderBottom: 0, borderColor: "divider" }}>
                <SearchIcon />
                <InputBase
                  placeholder={"Search " + projects.length + " Projects"}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  sx={{ ml: 1, flex: 1, minWidth: 400 }}
                />
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchProjects}
                  sx={{ mr: 2 }}
                >
                  Refresh
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
                  sx={{ mr: 2 }}
                >
                  Sort
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddProject}
                  color="primary"
                >
                  Add
                </Button>
              </Box>
            </Box>
            {/* Filter Menu */}
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              <MenuItem onClick={() => { /* ...filter by stack... */ handleFilterClose(); }}>Stack</MenuItem>
              <MenuItem onClick={() => { /* ...filter by lifecycle... */ handleFilterClose(); }}>Lifecycle</MenuItem>
              <MenuItem onClick={() => { /* ...filter by type... */ handleFilterClose(); }}>Type</MenuItem>
            </Menu>
            {/* Sort Menu */}
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem onClick={() => { /* ...sort name ascending... */ handleSortClose(); }}>Name Ascending</MenuItem>
              <MenuItem onClick={() => { /* ...sort name descending... */ handleSortClose(); }}>Name Descending</MenuItem>
            </Menu>
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
                  <Table >
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.id} sx={{ verticalAlign: 'top' }}>
                          <TableCell sx={{ width: '40%', verticalAlign: 'top' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, verticalAlign: 'bottom' }}>
                              <Typography variant="subtitle1" fontWeight={500} sx={{ fontSize: '1.0rem', lineHeight: 'normal', color: '#999' }} >
                                <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  {project.pathWithNamespace.split('/').splice(0, project.pathWithNamespace.split('/').length - 1).join('/')}/
                                </Link>

                                {/* Stacks */}
                              </Typography>
                              <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1.6rem', lineHeight: 'normal' }} >
                                <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  {project.name}
                                </Link>

                                {/* Stacks */}
                              </Typography>
                            </Box>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '1.025rem' }}>
                              <ReactMarkdown components={{ p: MarkdownParagraph }}>
                                {truncateDescription(project.description)}
                              </ReactMarkdown>
                            </Typography>

                          </TableCell>

                          <TableCell sx={{ width: '30%', verticalAlign: 'top' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'start', gap: '10%' }}>
                                  <Box sx={{ display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left', width: '30%' }}>
                                    <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem', borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
                                      STACK
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                                      <Link to={`/stacks/${project.stacks[0].name}/projects`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {project.stacks[0].name}
                                      </Link>
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left', width: '40%' }}>
                                    <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem', borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
                                      LIFECYCLE STAGE
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                                      {project.lifecycleName}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left', width: '30%' }}>
                                    <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem', borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
                                      TYPE
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                                      {project.runtimes[0].name}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'start', gap: '10%' }}>
                                  {project.languages.filter(x => x.name != null).length > 0 ? (
                                    <Box sx={{ width: '50%', display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left' }}>
                                      <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem', borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
                                        LANGUAGES ({project.languages.filter(x => x.name != null).length})
                                      </Typography>
                                      <Box>
                                        {project.languages.filter(x => x.name != null).length > 0 ? (
                                          <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem' }}>
                                            {[...new Set(project.languages.map(x => x.name))].map(lang => (
                                              <StyledChip key={lang} type="Languages">{lang}</StyledChip>
                                            ))}
                                          </Typography>
                                        )
                                          : (
                                            <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                                              None
                                            </Typography>
                                          )}
                                      </Box>
                                    </Box>
                                  ) : (
                                    <></>
                                  )}
                                  {project.contributors.filter(x => x.name != null).length > 0 ? (
                                    <Box sx={{ width: '50%', display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left' }}>
                                      <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem', borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
                                        CONTRIBUTORS ({project.contributors.filter(x => x.name != null).length})
                                      </Typography>
                                      {project.contributors.filter(x => x.name != null).length > 0 ? (
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                          {project.contributors.filter(x => x.name != null).map(contrib => (
                                            <Avatar key={contrib.id} sx={{ width: 24, height: 24, fontSize: '0.775rem', backgroundColor: COLORS.secondary, color: '#4A4A4A' }}>
                                              {getInitials(contrib.name)}
                                            </Avatar>
                                          ))}
                                        </Box>
                                      )
                                        : (
                                          <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                                            None
                                          </Typography>
                                        )}
                                    </Box>
                                  ) : (
                                    <></>
                                  )}
                                </Box>
                              </Box>
                            </Box>

                          </TableCell>
                          <TableCell sx={{ width: '30%', verticalAlign: 'top' }}>
                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'left' }}>
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between' }}>
                                  {/* Modified BEST PRACTICES title */}
                                  <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                                    BEST PRACTICES ({project.kpis && project.kpis[0] && project.kpis[0].policyCount ? Math.round((project.kpis[0].passedPolicyCount / project.kpis[0].policyCount) * 100) : 0}%)
                                  </Typography>
                                  {project.kpis[0] ? (
                                    <Typography variant="caption" color="text.secondary">
                                      {project.kpis[0].passedPolicyCount}/{project.kpis[0].policyCount} passed
                                    </Typography>
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      No checks yet
                                    </Typography>
                                  )}
                                </Box>
                                {(() => {
                                  const kpi = project.kpis[0] || { passedPolicyCount: 0, policyCount: 0, na: true };
                                  const percentage = kpi.na ? 0 : Math.round((kpi.passedPolicyCount / kpi.policyCount) * 100);
                                  const kpiColor = COLORS.bestPractices || "#4caf50";
                                  return (
                                    <Box sx={{ width: '100%', backgroundColor: `${kpiColor}30`, borderRadius: 2, height: 10, mt: 0.5 }}>
                                      <Box sx={{ width: `${percentage}%`, backgroundColor: kpiColor, height: '100%', borderRadius: 2 }} />
                                    </Box>
                                  );
                                })()}
                              </Box>
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between' }}>
                                  {/* Modified COMPLIANCE title */}
                                  <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                                    COMPLIANCE ({project.kpis && project.kpis[1] && project.kpis[1].policyCount ? Math.round((project.kpis[1].passedPolicyCount / project.kpis[1].policyCount) * 100) : 0}%)
                                  </Typography>
                                  {project.kpis[1] ? (
                                    <Typography variant="caption" color="text.secondary">
                                      {project.kpis[1].passedPolicyCount}/{project.kpis[1].policyCount} passed
                                    </Typography>
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      No checks yet
                                    </Typography>
                                  )}
                                </Box>
                                {(() => {
                                  const kpi = project.kpis[1] || { passedPolicyCount: 0, policyCount: 0, na: true };
                                  const percentage = kpi.na ? 0 : Math.round((kpi.passedPolicyCount / kpi.policyCount) * 100);
                                  const kpiColor = COLORS.compliance || "#ffeb3b";
                                  return (
                                    <Box sx={{ width: '100%', backgroundColor: `${kpiColor}30`, borderRadius: 2, height: 10, mt: 0.5 }}>
                                      <Box sx={{ width: `${percentage}%`, backgroundColor: kpiColor, height: '100%', borderRadius: 2 }} />
                                    </Box>
                                  );
                                })()}
                              </Box>
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between' }}>
                                  {/* Modified RESILIENCE title */}
                                  <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                                    RESILIENCE ({project.kpis && project.kpis[2] && project.kpis[2].policyCount ? Math.round((project.kpis[2].passedPolicyCount / project.kpis[2].policyCount) * 100) : 0}%)
                                  </Typography>
                                  {project.kpis[2] ? (
                                    <Typography variant="caption" color="text.secondary">
                                      {project.kpis[2].passedPolicyCount}/{project.kpis[2].policyCount} passed
                                    </Typography>
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      No checks yet
                                    </Typography>
                                  )}
                                </Box>
                                {(() => {
                                  const kpi = project.kpis[2] || { passedPolicyCount: 0, policyCount: 0, na: true };
                                  const percentage = kpi.na ? 0 : Math.round((kpi.passedPolicyCount / kpi.policyCount) * 100);
                                  const kpiColor = COLORS.resilience || "#9c27b0";
                                  return (
                                    <Box sx={{ width: '100%', backgroundColor: `${kpiColor}30`, borderRadius: 2, height: 10, mt: 0.5 }}>
                                      <Box sx={{ width: `${percentage}%`, backgroundColor: kpiColor, height: '100%', borderRadius: 2 }} />
                                    </Box>
                                  );
                                })()}

                              </Box>
                            </Box>

                          </TableCell>
                          {/* <TableCell>
                            <Box sx={{ display: 'flex', gap: 4 }}>
                              {project.kpis.map((kpi, index) => (
                                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {index === 0 && <BestPracticesKPI size={24} />}
                                    {index === 1 && <ComplianceKPI size={24} />}
                                    {index === 2 && <ResilienceKPI size={24} />}
                                    <Typography variant="h6">
                                      {Math.round((kpi.passedPolicyCount / kpi.policyCount) * 100)}%
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {kpi.passedPolicyCount}/{kpi.policyCount} passed
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

              )}
            </Box>

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
                count={Math.ceil(projects.length / rowsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </Box>
        </>
      </Container>
    </>
  );
};

export default Projects;
