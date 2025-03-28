import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Chip, IconButton, Tab, Tooltip } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { COLORS } from '../constants/colors';
import mockPoliciesData from "../mock/policies.json";

import Loading from "../components/Loading";

import Button from "@mui/material/Button";
import PageHeader from "../components/PageHeader";
import AssessmentIcon from "@mui/icons-material/Assessment"; // Import AddIcon
import KPIStats from '../components/KPIStats';
import KPICard from '../components/KPICard';
import PoliciesTable from '../components/PoliciesTable';
import Divider from "@mui/material/Divider";
import ReactMarkdown from "react-markdown";
import Avatar from "@mui/material/Avatar";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import ChartKPIOverTime from "../components/ChartKPIOverTime";


const drawerWidth = 240;  // Add this line after imports
const MarkdownParagraph = ({ node, ...props }) => <p style={{ marginTop: 0, marginBottom: 0 }} {...props} />;
// Add helper function to get initials from a name
const getInitials = (name) => {
  const names = name.split(" ");
  return names.map(n => n[0]).join("").toUpperCase();
};
const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));
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

const ProjectDetails = () => {
  const { id } = useParams(); // Get the project ID from the URL
  const [project, setProject] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [kpis, setKPIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (project) {
      document.title = `${project.name} | gitgud`;
    }
  }, [project]);

  useEffect(() => {
    // Use the API call for project details and override policies only with mock data.
    const fetchProjectDetails = async () => {
      try {
        const projectResponse = await fetch(`/api/projects/${id}`);
        if (!projectResponse.ok) {
          throw new Error("Failed to fetch project details");
        }
        const projectData = await projectResponse.json();
        // Override policies with mock data
        projectData.result.policies = mockPoliciesData.results;
        setProject(projectData.result);
        setPolicies(mockPoliciesData.results);
        setKPIs(projectData.result.kpis);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [id]);

  const handleTogglePolicy = async (policy) => {
    const updatedPolicy = { ...policy, enabled: !policy.enabled };
    try {
      //const endpoint = "http://localhost:3001";
      const response = await fetch(
        `/api/projects/${id}/policies/${encodeURIComponent(policy.id)}`,
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

  const handleEvaluate = async () => {
    try {
      //const endpoint = "http://localhost:3001";
      const response = await fetch(`/api/projects/${id}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      setError(err);
    }
  };

  const getChipColor = (type) => {
    switch (type) {
      case 'languages':
        return COLORS.tagLanguages;
      case 'stacks':
        return COLORS.tagStack;
      case 'runtimes':
        return COLORS.tagRuntime;
      case 'owners':
        return COLORS.tagOwners;
      case 'lifecycles':
        return COLORS.tagLifecycle;
      default:
        return undefined;
    }
  };

  return (
    <>
      {project && (
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", mb: 2, mt: 2, p: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1 }}>
            <Box sx={{ flex: 1, pr: 2, ml: 1 }}>
              <Typography variant="subtitle1" fontWeight={500} sx={{
                fontSize: '1.2rem', lineHeight: 'normal', color: '#999', textAlign: "left",
                marginTop: 2,
                ml: 1
              }} >
                {project.pathWithNamespace.split('/').splice(0, project.pathWithNamespace.split('/').length - 1).join('/')}/
              </Typography>
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
                {project.name}
              </Typography>
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
                <ReactMarkdown components={{ p: MarkdownParagraph }}>
                  {project.description}
                </ReactMarkdown>

              </Typography>



            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1, pl: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', p: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: '10%' }}>
                    <Box sx={{ display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left' }}>
                      <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem', borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
                        STACK
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                        {project.stacks && project.stacks[0] ? (
                          <Link to={`/management/stacks/${project.stacks[0].id}`} style={{ textDecoration: "none", color: "inherit" }}>
                            {project.stacks[0].name}
                          </Link>
                        ) : (
                          "N/A"
                        )}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left' }}>
                      <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem', borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
                        LIFECYCLE STAGE
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                        {project.lifecycleName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left' }}>
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
            </Box>
          </Box>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', gap: 2, mt: 1, verticalAlign: 'top' }}>
            {kpis.map((kpi) => (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, mb: 2, mt: 0, p: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1, p: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, justifyContent: 'space-between' }}>
                    {/* <BestPracticesKPI size={18} /> */}
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                      {kpi.name.toUpperCase()}
                    </Typography>
                    {kpi ? (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {kpi.passedPolicyCount}/{kpi.policyCount} passed
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        No checks yet
                      </Typography>
                    )}
                  </Box>
                  {(() => {
                    kpi = kpi || { passedPolicyCount: 0, policyCount: 0, na: true };
                    const percentage = kpi.na ? 0 : Math.round((kpi.passedPolicyCount / kpi.policyCount) * 100);
                    const kpiColor = COLORS[kpi.name] || "#4caf50";
                    return (
                      <Box sx={{ width: '100%', backgroundColor: `${kpiColor}30`, borderRadius: 2, height: 15, mt: 0.5 }}>
                        <Box sx={{ width: `${percentage}%`, backgroundColor: kpiColor, height: '100%', borderRadius: 2 }} />
                      </Box>
                    );
                  })()}
                  <Box sx={{ pt: 1, }}>
                    <ChartKPIOverTime color={COLORS[kpi.name]}></ChartKPIOverTime>
                  </Box>

                  <Divider sx={{ mt: 2, mb: 2 }} />
                  <Box sx={{ pt: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Table>
                      <TableBody>
                        {project.policies.filter(p => p.kpi.name === kpi.name).map((policy) => (
                          <TableRow>
                            <TableCell>

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
                              <Link to={`/events/2611`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <PolicyStatus
                                  status={policy.last_execution?.status}
                                  result={policy.last_execution?.result}
                                  lastLog={policy.last_execution?.message || policy.last_execution?.logs?.[0]?.message}
                                  executionId={policy.last_execution?.id}
                                  irrelevant={policy.irrelevant}
                                />
                              </Link>
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

          <>




            {/* <Box sx={{ mt: 4 }}>
                <PoliciesTable projectId={id} />
              </Box> */}
          </>


        </Container>
      )}
    </>

  );
};

export default ProjectDetails;
