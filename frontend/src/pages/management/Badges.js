import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
import { Add, Save, Cancel, Delete } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add"; // Import AddIcon
import RefreshIcon from "@mui/icons-material/Refresh";
import PageHeader from "../../components/PageHeader";
import { Navigate } from "react-router-dom";

const ManagementBadges = () => {
  const navigate = useNavigate(); // Hook for navigation

  const [badges, setBadges] = useState([]);
  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    kpiId: "",
  });
  const [editingBadge, setEditingBadge] = useState(null);
  const [kpis, setKpis] = useState([]);

  useEffect(() => {
    fetchBadges();
    fetchKpis();
  }, []);

  const fetchBadges = async () => {
    const response = await axios.get("/api/badges");
    setBadges(response.data.results);
  };

  const fetchKpis = async () => {
    const response = await axios.get("/api/kpis");
    setKpis(response.data.results);
  };

  const createBadge = async () => {
    await axios.post("/api/badges", newBadge);
    setNewBadge({ name: "", description: "", kpiId: "" });
    fetchBadges();
  };

  const updateBadge = async (id) => {
    await axios.put(`/api/badges/${id}`, editingBadge);
    setEditingBadge(null);
    fetchBadges();
  };

  const deleteBadge = async (id) => {
    await axios.delete(`/api/badges/${id}`);
    fetchBadges();
  };

  const handleAdd = () => {
    navigate("/management/badges/add"); // Navigate to the add project page
  };

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Badge Management"
        description={`Use this management view to manage the different Badges.`}
      />
       <div
        style={{
          display: "flex",
          justifyContent: "right",
          marginBottom: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchBadges}
          sx={{ mr: 2 }}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          color="primary"
        >
          Add
        </Button>
      </div>
      
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>KPI</TableCell>
                <TableCell># of Policies</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {badges.map((badge) => {
                const kpiName =
                  kpis.find((kpi) => kpi.id === badge.kpiId)?.name || "N/A"; // Get KPI name

                if (editingBadge?.id === badge.id) {
                  return (
                    <TableRow key={badge.id} hover>
                      <TableCell colSpan={5}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Badge Name"
                              value={editingBadge.name}
                              onChange={(e) =>
                                setEditingBadge({
                                  ...editingBadge,
                                  name: e.target.value,
                                })
                              }
                              variant="outlined"
                              fullWidth
                            />
                          </Grid>

                          <Grid item xs={12} mt={2}>
                            <TextField
                              label="Description"
                              value={editingBadge.description}
                              onChange={(e) =>
                                setEditingBadge({
                                  ...editingBadge,
                                  description: e.target.value,
                                })
                              }
                              variant="outlined"
                              fullWidth
                              multiline
                              rows={4} // Larger textarea when editing
                            />
                          </Grid>

                          <Grid item xs={12} sm={6} mt={2}>
                            <FormControl fullWidth variant="outlined">
                              <InputLabel>KPI</InputLabel>
                              <Select
                                value={editingBadge.kpiId}
                                onChange={(e) =>
                                  setEditingBadge({
                                    ...editingBadge,
                                    kpiId: e.target.value,
                                  })
                                }
                                label="KPI"
                              >
                                {kpis.map((kpi) => (
                                  <MenuItem key={kpi.id} value={kpi.id}>
                                    {kpi.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid
                            item
                            xs={12}
                            sm={12}
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                            mt={4}
                          >
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<Save />}
                              onClick={() => updateBadge(badge.id)}
                              sx={{ mr: 1 }}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              color="secondary"
                              startIcon={<Cancel />}
                              onClick={() => setEditingBadge(null)}
                            >
                              Cancel
                            </Button>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  return (
                    <TableRow key={badge.id} >
                      <TableCell>{badge.name}</TableCell>
                      <TableCell>{badge.description}</TableCell>
                      <TableCell>{kpiName}</TableCell>
                      <TableCell>{badge.policyCount}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => setEditingBadge(badge)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<Delete />}
                          disabled={badge.policyCount > 0}
                          onClick={() => deleteBadge(badge.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>
      
    </Container>
  );
};

export default ManagementBadges;
