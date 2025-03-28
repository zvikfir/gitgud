import React from "react";
import Typography from "@mui/material/Typography";
import { Paper, Box, List, ListItem, ListItemText } from "@mui/material";

import JsonView from "@uiw/react-json-view";
import JsonViewEditor from "@uiw/react-json-view/editor";
import { lightTheme } from "@uiw/react-json-view/light";
import { darkTheme } from "@uiw/react-json-view/dark";
import { TriangleArrow } from "@uiw/react-json-view/triangle-arrow";
import { TriangleSolidArrow } from "@uiw/react-json-view/triangle-solid-arrow";

const ProjectDetails = ({ project }) => {
  return (
    <Paper elevation={3} style={{ padding: "20px", marginTop: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Project details
      </Typography>

      <JsonView collapsed={true} value={project} />
    </Paper>
  );
};

export default ProjectDetails;
