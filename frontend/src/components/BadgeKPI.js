import React from "react";
import { Box, Typography, Tooltip, IconButton, Paper } from "@mui/material";
import { Chart as ChartJS, registerables } from "chart.js";
import { Bar } from "react-chartjs-2";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

ChartJS.register(...registerables);

const BadgeKPI = ({
  title,
  description,
  percentage,
  summary,
  history,
}) => {
  const chartData = {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "KPI Trend",
        data: history,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <Paper elevation={3} sx={{ padding: 2, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            marginRight: "8px",
          }}
        >
          {title}
        </Typography>
        <Tooltip
          title={
            <Typography sx={{ fontSize: "1.1rem" }}>{description}</Typography>
          }
          PopperProps={{
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, 10],
                },
              },
            ],
          }}
        >
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography
        variant="h3"
        color="primary"
        sx={{ fontWeight: "bold", marginY: "16px" }}
      >
        {percentage}%
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {summary}
      </Typography>

      <Bar
        key={title}
        datasetIdKey="id"
        data={chartData}
        options={{
          scales: {
            x: {
              beginAtZero: true,
            },
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </Paper>
  );
};

export default BadgeKPI;
