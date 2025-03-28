import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Typography, Paper, Box, Button,
  TableContainer, Table, TableBody, TableCell,
  TextField, InputAdornment, TableRow,
  Pagination, Select, MenuItem, TableHead
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import policiesMock from "../mock/policies.json";
import { BestPracticesKPI, ComplianceKPI, ResilienceKPI } from '../components/KPIShapes';
import ReactMarkdown from "react-markdown";
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import Menu from '@mui/material/Menu';
import ChartPolicyOverTime from "../components/ChartPolicyOverTime";
import { styled } from "@mui/material/styles";
import { COLORS } from '../constants/colors';
import ChartPolicyCounts from "../components/ChartPolicyCounts";

const MarkdownParagraph = ({ node, ...props }) => <p style={{ marginTop: 0, marginBottom: 0 }} {...props} />;

const StyledChip = styled('div')(({ theme, type }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.675rem',
  fontWeight: 500,
  margin: '2px',
  backgroundColor: COLORS[`tag${type}`] || COLORS.tagLanguages,
  color: '#4A4A4A',
}));

const StyledKPIChip = styled('div')(({ theme, type }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.775rem',
  fontWeight: 500,
  margin: '2px',
  backgroundColor: COLORS[type] || COLORS.tagLanguages,
  color: '#333',
}));


const Policies = () => {
  useEffect(() => {
    document.title = "Policies | gitgud";
  }, []);

  const [policies, setPolicies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // New pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);

  useEffect(() => {
    // Using mock data instead:
    setPolicies(policiesMock.results);
    setLoading(false);
  }, [page, rowsPerPage, searchQuery]);

  // New: compute policies per stack (assuming policy.stack exists)
  const policiesPerKPI = React.useMemo(() => {
    if (!policies) return [];
    let counts = policies.reduce((acc, policy) => {
      const kpi = policy.kpi.name || "Unknown";
      acc[kpi] = (acc[kpi] || 0) + 1;
      return acc;
    }, {});
    //sort
    counts = Object.keys(counts).sort().reduce((acc, key) => {
      acc[key] = counts[key];
      return acc;
    }
      , {});


    return Object.entries(counts).map(([title, count]) => ({ title, count }));
  }, [policies]);

  const handleToggle = async (policy) => {
    const updatedPolicy = { ...policy, enabled: !policy.enabled };
    try {
      const response = await fetch(
        `/api/policies/${encodeURIComponent(policy.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPolicy),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update policy");
      }

      setPolicies((prevPolicies) =>
        Object.values(prevPolicies).map((p) =>
          p.id === policy.id ? updatedPolicy : p
        )
      );
    } catch (err) {
      setError(err);
    }
  };

  const handleAddPolicy = () => {
    navigate("/policies/new");
  };

  const handleRefresh = () => {
    setLoading(true);
    setPolicies(policiesMock.results);
    setLoading(false);
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

  const filteredPolicies = policies
    ? policies.filter(policy => policy.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <>
      <Container maxWidth="xl">
        {policies && (
          <>
            <Box sx={{ display: "flex", mb: 2, mt: 2, p: 2, pb: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1 }}>
              <Box sx={{ flex: 1, pr: 2, ml: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', verticalAlign: 'middle' }}>
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
                    Policies
                  </Typography>
                </Box>
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
                      <strong>gitgud policies</strong> automate checks for key repository attributes—
                      from README files to security rules—ensuring every project
                      meets organizational and industry standards without friction.
                    </p>
                    <p>
                      <strong>Browse</strong> and review existing policies, <strong>propose</strong> new checks to improve code quality, <strong>edit</strong> and refine policies to match evolving requirements
                    </p>

                  </div>
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ flex: 1, pl: 2, display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'left', width: '40%' }}>

                  <Box sx={{ flex: 1, mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between', width: '100%' }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.75rem' }}>
                        TOTAL POLICIES
                      </Typography>

                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 185 }}>
                      <ChartPolicyCounts data={policiesPerKPI} height={170} />
                    </Box>

                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'left', width: '60%' }}>

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
                      <ChartPolicyOverTime color={COLORS['best-practices']} height={160}></ChartPolicyOverTime>
                    </Box>

                  </Box>
                </Box>

              </Box>
            </Box>

            <Box sx={{ boxShadow: 3, borderRadius: 1, bgcolor: "background.paper", p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0, p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Box sx={{ display: "flex", alignItems: "center", borderBottom: 0, borderColor: "divider" }}>
                  <SearchIcon />
                  <InputBase
                    placeholder={"Search " + policies.length + " Policies"}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    sx={{ ml: 1, flex: 1, minWidth: 400 }}
                  />
                </Box>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    //onClick={fetchProjects}
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
                    //onClick={handleAddProject}
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

              <TableContainer>
                <Table>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredPolicies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          No results found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPolicies.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((policy) => {
                        // Generate random coverage per policy
                        const randomCoverage = Math.floor(Math.random() * (22 - 7 + 1)) + 7;
                        const coverageDenom = 27;
                        const percentage = Math.round((randomCoverage / coverageDenom) * 100);
                        return (
                          <TableRow key={policy.id} onClick={() => navigate(`/policies/${policy.id}`)}>
                            <TableCell sx={{ width: '40%', verticalAlign: 'top' }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, verticalAlign: 'bottom' }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                                  <Link to={`/kpis/${policy.kpi.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <StyledKPIChip key={policy.kpi.name} type={policy.kpi.name}>{policy.kpi.name}</StyledKPIChip>
                                  </Link>
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1.6rem', lineHeight: 'normal' }} >
                                  <Link to={`/policies/${policy.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {policy.name}
                                  </Link>
                                  {/* Stacks */}
                                </Typography>
                              </Box>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '1rem' }}>
                                <ReactMarkdown components={{ p: MarkdownParagraph }}>
                                  {policy.description}
                                </ReactMarkdown>
                              </Typography>
                            </TableCell>


                            <TableCell sx={{ width: '30%', verticalAlign: 'top' }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'start', gap: '10%' }}>
                                    {/* <Box sx={{ display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left', width: '30%' }}>
                                      <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem', borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
                                        KPI
                                      </Typography>
                                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                                        <Link to={`/kpis/${policy.kpi.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                          {policy.kpi.name}
                                        </Link>
                                      </Typography>
                                    </Box> */}

                                    {policy.criteria.events.length > 0 ? (
                                      <Box sx={{ width: '50%', display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left' }}>
                                        <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem', borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
                                          TRIGGERS ({policy.criteria.events.length})
                                        </Typography>
                                        <Box>
                                          {policy.criteria.events.length > 0 ? (
                                            <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem' }}>
                                              {[...new Set(policy.criteria.events)].map(lang => (
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
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'start', gap: '10%' }}>

                                    {policy.criteria.events.length > 0 ? (
                                      <Box sx={{ width: '50%', display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left' }}>
                                        <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem', borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
                                          CRITERIA ({Object.keys(policy.criteria).length - 1})
                                        </Typography>
                                        <Box>
                                          {Object.keys(policy.criteria).length - 1 > 0 ? (
                                            <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem' }}>
                                              {[...new Set(Object.keys(policy.criteria).filter(x => x != 'events'))].map(lang => (
                                                <StyledChip key={lang} type="Languages">{lang}: /{policy.criteria[lang]}/</StyledChip>
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
                                  </Box>
                                </Box>
                              </Box>

                            </TableCell>
                            <TableCell sx={{ width: '30%', verticalAlign: 'top' }}>
                              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'left' }}>
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, alignItems: 'left', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                                      COVERAGE ({percentage}%)
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {randomCoverage}/{coverageDenom} projects passing
                                    </Typography>
                                  </Box>
                                  {(() => {
                                    const kpi = { passedPolicyCount: randomCoverage, policyCount: coverageDenom };
                                    const kpiColor = "#4caf50";
                                    const percentageBar = kpi.na ? 0 : Math.round((kpi.passedPolicyCount / kpi.policyCount) * 100);
                                    return (
                                      <Box sx={{ width: '100%', backgroundColor: `${kpiColor}30`, borderRadius: 2, height: 10, mt: 0.5 }}>
                                        <Box sx={{ width: `${percentageBar}%`, backgroundColor: kpiColor, height: '100%', borderRadius: 2 }} />
                                      </Box>
                                    );
                                  })()}
                                </Box>
                                <Box sx={{ flex: 1, mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                                      EXECUTIONS/ERRORS
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Last 30 days
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <ChartPolicyOverTime color={COLORS['best-practices']}></ChartPolicyOverTime>
                                  </Box>

                                </Box>
                              </Box>

                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", p: 2, borderTop: 1, borderColor: "divider" }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Rows per page:
                </Typography>
                <Select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  sx={{ mr: 2, minWidth: 60 }}
                  variant="standard"
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
                <Pagination
                  count={Math.ceil(filteredPolicies.length / rowsPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            </Box>
          </>
        )}
      </Container>
    </>
  );
};

export default Policies;
