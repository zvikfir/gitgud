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

const ManagementKPIs = () => {
  const navigate = useNavigate(); // Hook for navigation

  const [kpis, setKPIs] = useState([]);
  const [editingKPI, setEditingKPI] = useState(null);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    const response = await axios.get("/api/kpis");
    setKPIs(response.data.results);
  };

  const updateKPI = async (id) => {
    await axios.put(`/api/kpis/${id}`, editingKPI);
    setEditingKPI(null);
    fetchKPIs();
  };

  const deleteKPI = async (id) => {
    await axios.delete(`/api/kpis/${id}`);
    fetchKPIs();
  };

  const handleAdd = () => {
    navigate("/management/kpis/add"); // Navigate to the add project page
  };

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="KPI Management"
        description={`Use this management view to manage the different KPIs.`}
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
          onClick={fetchKPIs}
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
              <TableCell># of Badges</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {kpis.map((kpi) => {
              if (editingKPI?.id === kpi.id) {
                return (
                  <TableRow key={kpi.id} hover>
                    <TableCell colSpan={5}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="KPI Name"
                            value={editingKPI.name}
                            onChange={(e) =>
                              setEditingKPI({
                                ...editingKPI,
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
                            value={editingKPI.description}
                            onChange={(e) =>
                              setEditingKPI({
                                ...editingKPI,
                                description: e.target.value,
                              })
                            }
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4} // Larger textarea when editing
                          />
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
                            onClick={() => updateKPI(kpi.id)}
                            sx={{ mr: 1 }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<Cancel />}
                            onClick={() => setEditingKPI(null)}
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
                  <TableRow key={kpi.id}>
                    <TableCell>{kpi.name}</TableCell>
                    <TableCell>{kpi.description}</TableCell>
                    <TableCell>{kpi.badgesCount}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setEditingKPI(kpi)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Delete />}
                        disabled={kpi.badgesCount > 0}
                        onClick={() => deleteKPI(kpi.id)}
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

export default ManagementKPIs;
