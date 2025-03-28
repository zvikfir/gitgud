import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { Container, Box } from "@mui/material";
import PolicyForm from '../components/PolicyForm';
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import PageHeader from "../components/PageHeader";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { styled } from "@mui/material/styles";
import Loading from "../components/Loading";  // Add this import
import EditIcon from '@mui/icons-material/Edit';  // Add this import
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@mui/material/IconButton"; // added import
import { COLORS } from "../constants/colors";
import ChartPolicyOverTime from "../components/ChartPolicyOverTime";

const MarkdownParagraph = ({ node, ...props }) => <p style={{ marginTop: 0, marginBottom: 0, padding: 0 }} {...props} />;

// Add new styled components for chip styles:
const StyledKPIChip = styled('div')(({ theme, type }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.775rem',
  fontWeight: 500,
  margin: '2px 0',
  backgroundColor: "#E0F7FA",
  color: '#333',
}));

const StyledChip = styled('div')(({ theme }) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.675rem',
  fontWeight: 500,
  margin: '2px',
  backgroundColor: "#F4F1EA",
  color: "#4A4A4A",
}));

// Update TabPanel to remove internal padding
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    {...other}
  >
    {value === index && (
      <Box sx={{ p: 0 }}>
        {children}
      </Box>
    )}
  </div>
);

const Policy = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const mode = location.pathname.endsWith('/edit') ? 'edit' :
    location.pathname.endsWith('/new') ? 'new' : 'view';

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    if (mode === 'new') {
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/policies/${id}`);
        if (!response.ok) throw new Error("Failed to fetch details");
        const data = await response.json();
        setPolicy(data.result);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, mode]);

  const handleSubmit = async (formData) => {
    try {
      const endpoint = mode === 'edit' ? `/api/policies/${id}` : '/api/policies';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save policy");

    } catch (err) {
      setError(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <Loading />;
  if (error) return <Typography color="error">Error loading policy details</Typography>;

  return (

    <Container maxWidth="xl">
      {mode === 'view' ? (
        <>

          <Box sx={{ display: "flex", mb: 2, mt: 2, p: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1 }}>
            <Box sx={{ flex: 1, pr: 2, ml: 1 }}>
              {/* Add KPI Chip above the title */}
              <StyledKPIChip type={COLORS.bestPractices}>
                {policy.kpi.name}
              </StyledKPIChip>
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
                  {policy.name}
                </Typography>
                <IconButton onClick={() => navigate(`/policies/${id}/edit`)} size="small" sx={{ ml: 1, mt: -1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
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
                <ReactMarkdown components={{ p: MarkdownParagraph }}>
                  {policy.description}
                </ReactMarkdown>

              </Typography>

              {/* Render triggers using StyledChip */}
              <Box sx={{ display: 'flex', flexDirection: 'column', p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'start', gap: '10%' }}>
                  {policy.criteria.events && policy.criteria.events.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem' }}>
                        TRIGGERS ({policy.criteria.events.length})
                      </Typography>
                      <Box>

                        <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem' }}>

                          <StyledChip key="Push" >Push</StyledChip>
                          <StyledChip key="MR" >Merge Request</StyledChip>
                        </Typography>

                      </Box>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'start', gap: '10%' }}>
                  {Object.keys(policy.criteria).filter(key => key !== 'events').length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem' }}>
                        CRITERIA ({Object.keys(policy.criteria).filter(key => key !== 'events').length})
                      </Typography>
                      <Box>
                        {Object.keys(policy.criteria).filter(key => key !== 'events').map(crit => (
                          <StyledChip key={crit}>
                            {crit}: /{policy.criteria[crit]}/
                          </StyledChip>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem />
            {/* Replace visualization box */}
            <Box sx={{ flex: 1, pl: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                    COVERAGE (67%)
                  </Typography>
                  <Typography variant="caption">
                    18/27 projects passing
                  </Typography>
                  <Box sx={{ width: '100%', backgroundColor: '#4caf5030', borderRadius: 2, height: 10, mt: 0.5 }}>
                    <Box sx={{ width: '67%', backgroundColor: '#4caf50', height: '100%', borderRadius: 2 }} />
                  </Box>
                </Box>
                <Box sx={{ flex: 1, mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0, flexBasis: 'start', alignItems: 'left', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                      EXECUTIONS/ERRORS
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last 60 days
                    </Typography>
                  </Box>
                  <Box>
                    <ChartPolicyOverTime color={COLORS['best-practices']} totalPoints={60} height={120}></ChartPolicyOverTime>
                  </Box>

                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ width: '100%', mt: 2, p: 4, pt: 2, pb: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1 }}>
            <Tabs value={selectedTab} onChange={handleTabChange} indicatorColor="primary" sx={{ p: 0 }}>
              <Tab label="Documentation" />
              <Tab label="Script" />
            </Tabs>
            <TabPanel value={selectedTab} index={0} >
              <Box sx={{ pt: 4 }}>
                <ReactMarkdown components={{ p: MarkdownParagraph }} >
                  {policy.longDescription || '*No documentation available*'}
                </ReactMarkdown>
              </Box>
            </TabPanel>
            <TabPanel value={selectedTab} index={1} sx={{ p: 0 }}>
              <SyntaxHighlighter language="javascript" style={materialLight} sx={{ p: 0 }}>
                {policy.scriptJs.replace(/\n\n/ig, '\n')}
              </SyntaxHighlighter>
            </TabPanel>
          </Box>

        </>
      ) : (
        <PolicyForm
          policy={policy}
          onSubmit={handleSubmit}
          mode={mode}
        />
      )}
    </Container>
  );
};

export default Policy;
