import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Box";
import { Add, Save, Cancel, Delete, ConstructionOutlined } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add"; // Import AddIcon
import RefreshIcon from "@mui/icons-material/Refresh";
import PageHeader from "../../components/PageHeader";
import { Navigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { COLORS } from "../../constants/colors";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "@mui/material/Pagination";
import SortIcon from '@mui/icons-material/Sort';
import Menu from '@mui/material/Menu';
import ReactMarkdown from "react-markdown";
import Avatar from "@mui/material/Avatar";
import { styled } from "@mui/material/styles";
import ChartKPISummary from "../../components/ChartKPISummary";
import stacksMock from "../../mock/stacks.json";
import projectsMock from "../../mock/projects.json";
import ChartKPIOverTime from "../../components/ChartKPIOverTime";
import ChartStacksByPolicy from "../../components/ChartStacksByPolicy";

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

// Add helper function to get initials from a name
const getInitials = (name) => {
  const names = name.split(" ");
  return names.map(n => n[0]).join("").toUpperCase();
};

const MarkdownParagraph = ({ node, ...props }) => <p style={{ marginTop: 0, marginBottom: 0 }} {...props} />;
// New helper function to truncate description to 256 words
const truncateDescription = (desc) => {
  if (!desc) return 'No description';
  desc = desc.trim().split('\n\n')[0]; // Get the first paragraph
  const words = desc.split(/\s+/);
  return words.length <= 28 ? desc : words.slice(0, 28).join(' ') + '...';
};

const ManagementStacks = () => {
  // New hook to update the page title
  useEffect(() => {
    document.title = "Software Stacks | gitgud";
  }, []);

  const navigate = useNavigate();

  const [stacks, setStacks] = useState([]);
  const [editingStack, setEditingStack] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);



  function sortStacks(_stacks, by = 'name', order = 'asc') {
    console.log('stacks sort', _stacks);
    const sortedStacks = [..._stacks];
    sortedStacks.sort((a, b) => {
      if (order === 'asc') {
        return a[by].localeCompare(b[by]);
      } else {
        return b[by].localeCompare(a[by]);
      }
    });



    return sortedStacks;
  }

  // Modified fetchStacks to use mock data. REST API code is commented out for later re-use.
  const fetchStacks = async () => {
    // REST API call (for later re-use):
    /*
    const response = await axios.get("/api/stacks", {
      params: {
        page,
        limit: rowsPerPage,
        search: searchQuery,
      },
    });
    let _stacks = sortStacks(response.data.results);
    // ...existing processing of API response...
    */

    // Using mock data instead:
    const stacksData = stacksMock.stacks;
    const projectsData = projectsMock.results;

    const updatedStacks = stacksData.map(stack => {
      // Filter projects for the current stack based on matching stack name
      const stackProjects = projectsData.filter(project =>
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

    setStacks(updatedStacks);
  };

  useEffect(() => {
    fetchStacks();
  }, [page, rowsPerPage, searchQuery]);

  const updateStack = async (id) => {
    await axios.put(`/api/stacks/${id}`, editingStack);
    setEditingStack(null);
    fetchStacks();
  };

  const deleteStack = async (id) => {
    await axios.delete(`/api/stacks/${id}`);
    fetchStacks();
  };

  const handleAdd = () => {
    navigate("/management/stacks/add");
  };

  const toggleFollow = async (stackId, newState) => {

    await axios.post(`/api/stacks/${stackId}/follow`, {
      userId: 1, // Replace with actual user ID
      state: newState
    });
    fetchStacks();
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

  // Handlers for Sort Menu
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const filteredStacks = stacks.filter((stack) =>
    stack.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedStacks = filteredStacks.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const getStateChip = (stack, m = 0) => {
    if (stack.name=="Shannon Stack"){
      return <Chip label="Contributor" sx={{ bgcolor: COLORS.stateChips.contributor, color: "#fff" }} />;
    }
    if (stack.name=="Turing Stack"){
      return <Chip label="Unfollow" sx={{ bgcolor: COLORS.stateChips.unfollow, color: "#000" }} onClick={() => toggleFollow(stack.id, 0)} />;
    }
    switch (stack.state) {
      case "not-following":
        if (stack.demo) {
          return (
            <Chip
              label="Follow"
              sx={{ mr: 0, ml: 0, bgcolor: COLORS.stateChips.follow, color: "#fff", mt: 0, mb: 0 }}
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
      <Box sx={{ display: "flex", mb: 2, mt: 2, p: 2, pb: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1 }}>
        <Box sx={{ flex: 1, pr: 2 }}>
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
            Software Stacks
          </Typography>
          <Typography variant="body1"
            component="p"
            gutterBottom
            sx={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "1rem",
              textAlign: "left",
              marginBottom: 2,
              paddingRight: 10,
              color: "text.secondary",
              ml: 1
            }}>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <p className="text-lg text-gray-700" style={{ marginBlock: 0 }}>
                <strong>Software stacks</strong> are collections of projects used together to run applications.
                <p>
                  Enable or disable policies at the <strong>stack level</strong>and evaluate your <strong>policy posture</strong> for an entire stack rather than managing policies on a per-project basis.
                </p>
                <p>
                  You can {getStateChip({ demo: true, state: "not-following" }, 1)} a stack to receive updates on new projects and policies.
                </p>
              </p>
            </div>
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ flex: 1, pl: 3, display: 'flex', gap: 1, flexDirection: 'row', alignItems: 'center' }}>
          
          <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'left', width: '100%' }}>
            {/* <ChartStacksByPolicy> </ChartStacksByPolicy> */}
          </Box>
        </Box>
      </Box>
      <Box sx={{ boxShadow: 3, borderRadius: 1, bgcolor: "background.paper", p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0, p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", borderBottom: 0, borderColor: "divider" }}>
            <SearchIcon />
            <InputBase
              placeholder={"Search " + stacks.length + " Software Stacks"}
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ ml: 1, flex: 1, minWidth: 400 }}
            />
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchStacks}
              sx={{ mr: 2 }}
            >
              Refresh
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
              onClick={handleAdd}
              color="primary"
            >
              Add
            </Button>
          </Box>
        </Box>
        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={handleSortClose}
        >
          <MenuItem onClick={() => { /* ...sort name ascending... */ handleSortClose(); }}>Name Ascending</MenuItem>
          <MenuItem onClick={() => { /* ...sort name descending... */ handleSortClose(); }}>Name Descending</MenuItem>
        </Menu>
        <Box sx={{ mt: 2, p: 2, pt: 0, pb: 0 }}>
          {stacks.length === 0 ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body1">No results found</Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table >
                  <TableBody>
                    {stacks.map((stack) => (
                      <TableRow key={stack.id} sx={{ verticalAlign: 'top' }}>
                        <TableCell sx={{ width: '40%', verticalAlign: 'top' }}>
                          <Box sx={{ display: 'flex' }}>

                            <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1.6rem', lineHeight: 'normal', mr: 2 }} >
                              <Link to={`/stacks/${stack.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {stack.name}
                              </Link>

                              {/* Stacks */}
                            </Typography>
                            {getStateChip(stack)}


                          </Box>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '1.025rem' }}>
                            <ReactMarkdown components={{ p: MarkdownParagraph }}>
                              {truncateDescription(stack.description)}
                            </ReactMarkdown>
                          </Typography>

                          {/*  */}
                        </TableCell>

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
              </TableContainer></>

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
            count={Math.ceil(stacks.length / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Box>
    </Container>
  );
};

export default ManagementStacks;
