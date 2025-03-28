import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Paper from "@mui/material/Paper";
import PageHeader from "../components/PageHeader";
import ProjectDetails from "../components/ProjectDetails";
import PolicyDetails from "../components/PolicyDetails";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import Box from "@mui/material/Box";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Divider from "@mui/material/Divider";
import ReactMarkdown from 'react-markdown';

const MarkdownParagraph = ({ node, ...props }) => <p style={{ marginTop: 0, marginBottom: 0, padding: 0 }} {...props} />;

const Event = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getBorderColor = (level) => {
    switch (level.toLowerCase()) {
      case "error":
        return "red";
      case "warning":
        return "yellow";
      default:
        return "green";
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event details");
        }
        const data = await response.json();
        let _event = data.result;
        _event.logs = _event.logs.reverse();
        setEvent(_event);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [id]);

  if (error) {
    return (
      <Container>
        <Typography variant="body1" color="error">
          {error.message}
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="xl" sx={{ px: 2, mt: '16px', mx: 'auto', maxWidth: '100%' }}>
        {event && (
          <>
            <Box sx={{ display: "flex", mb: 2, mt: 2, p: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1 }}>
              <Box sx={{ flex: 1, pr: 2, ml: 1 }}>

                <Box sx={{ display: 'flex', alignItems: 'center', verticalAlign: 'middle' }}> {/* modified region */}
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
                    Event #{event.id}
                  </Typography>

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
                    {event.policy.description}
                  </ReactMarkdown>

                </Typography>


                <Box sx={{ display: 'flex', flexDirection: 'row', p: 1, gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                    <Box sx={{ display: 'flex', gap: '10%' }}>
                      <Box sx={{ display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left' }}>
                        <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem', borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
                          PROJECT
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                          <Link to={`/projects/${event.project.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {event.project.name}
                          </Link>
                        </Typography>
                      </Box>

                    </Box>
                    <Box sx={{ display: 'flex', gap: '10%' }}>
                      <Box sx={{ display: 'flex', flexGrow: 1, gap: 0.5, flexDirection: 'column', textAlign: 'left' }}>
                        <Typography variant="subtitle2" fontWeight={500} sx={{ fontSize: '0.775rem', borderBottom: 1, borderColor: "divider", color: "text.secondary" }}>
                          POLICY
                        </Typography>

                        <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                          <Link to={`/policies/${event.policy.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {event.policy.name}
                          </Link>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ flex: 1, pl: 2 }}>
                {/* Future visualization goes here */}
              </Box>
            </Box>



            {/* Event Details Section */}
            <Box sx={{ mb: 4 }}>
              <Paper sx={{ p: 3, backgroundColor: 'white', borderRadius: 1 }}>
                {/* Event logs table */}
                <Typography variant="h6" sx={{ mb: 2 }}>Event Logs</Typography>
                <TableContainer>
                  <Table>
                    <TableBody>
                      {event.logs.map((log) => (
                        <TableRow
                          key={log.id}
                          style={{ borderLeft: `3px solid ${getBorderColor(log.level)}` }}
                        >
                          <TableCell sx={{width:'15%'}}>
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell sx={{width:'8%'}}>
                            {log.level}
                          </TableCell>
                          <TableCell sx={{width:'70%'}}>
                            {expandedRows[log.id] ? log.message : log.message.substring(0, 80)}
                            {log.message.length > 80 && (
                              <button onClick={() => toggleRow(log.id)} style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", textDecoration: 'underline' }} sx={{  }}>
                                {expandedRows[log.id] ? "collapse" : "expand"}
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>

            {/* <PolicyDetails policy={event.policy} />
            <ProjectDetails project={event.project} /> */}
          </>
        )}
      </Container>
    </>
  );
};

export default Event;
