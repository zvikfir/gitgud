import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  TableContainer,
  Paper,
  Box,
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook for navigation

  const fetchEvents = async (search = "") => {
    try {
      setLoading(true);
      setEvents();
      console.log(`Fetching with search query: ${search}`);

      //const endpoint = "http://localhost:3001";
      const response = await fetch(`/api/events?search=${search}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data.results);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err);
    }
  };

  let debounceTimeout;
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    if (debounceTimeout) {
      return;
    }
    debounceTimeout = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchEvents(event.target.value); // Call the API whenever the search input changes
        clearTimeout(debounceTimeout);
      }
    }, 300); // 300ms debounce time
  };

  // Fetch events data from the API when the component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRowClick = (id) => {
    navigate(`/events/${id}`); // Navigate to the detailed view
  };

  return (
    <>
      <Container maxWidth="xl" sx={{ px: 2, mt: '16px', mx: 'auto', maxWidth: '100%' }}>

         <>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          borderRadius: 1,
          boxShadow: 3,
          mb: 4,
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
                Events
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View the latest incoming webhook events from GitLab repositories and groups.
                The table below lists the last 50 events, including details such as
                headers, payloads, executed policies, and their logs.
                Click on any item to dive into the event details and understand what happened.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchEvents(searchQuery)}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        {loading && <Loading />}
        {events && (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          borderRadius: 1,
          boxShadow: 3,
          mb: 3,
        }}>
          <Box sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}>
            <TextField
              variant="outlined"
              placeholder="Search events..."
              value={searchQuery}
              onChange={handleSearchChange}
              size="small"
              sx={{ width: '300px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Policy</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Result</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow
                    key={event.id}
                    hover
                    sx={{ cursor: "pointer" }} // This adds the hand cursor
                  >
                    <TableCell>
                      <Link to={`/events/${event.id}`} style={{ color: "inherit" }}>
                        {new Date(event.createdAt).toLocaleString()}
                      </Link>
                    </TableCell>
                    <TableCell>{event.project?.name || "--"}</TableCell>
                    <TableCell>{event.policy?.name || "--"}</TableCell>
                    <TableCell>
                      {event.status == 2
                        ? "Error"
                        : event.status == 1
                        ? "Executed"
                        : "Pending"}
                    </TableCell>
                    <TableCell>{event.result == 1 ? "Passed" : "Failed"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
         )}
        </> 
     
      </Container>  
 
      </>
  );
};

const formatDuration = (ms) => {
  if (ms < 1000) {
    return `${ms}ms`;
  } else {
    return `${(ms / 1000).toFixed(1)}s`;
  }
};

export default Events;
