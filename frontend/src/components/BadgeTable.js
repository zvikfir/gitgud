import React, { useState, useEffect } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  dividerClasses,
  Paper,
} from "@mui/material";

const BadgeTable = ({ id }) => {
  const [tableData, setTableData] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/badges/${id}/policies`);
        if (!response.ok) {
          throw new Error("Failed to fetch project policies");
        }
        const data = await response.json();
        setTableData(data);
      } catch (err) {}
    };

    fetchData();
  }, [id]);

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Policy</TableCell>
              <TableCell align="right">Completeness</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(tableData).map((key) => (
              <TableRow key={key}>
                <TableCell component="th" scope="row">
                  {key}
                </TableCell>
                <TableCell align="right">{tableData[key].total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default BadgeTable;
