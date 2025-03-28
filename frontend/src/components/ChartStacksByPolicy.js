import React from "react";
import ReactECharts from "echarts-for-react";
import { COLORS } from "../constants/colors";
import projectsData from "../mock/projects.json";
import policiesData from "../mock/policies.json";

// Helper to compute a heatmap color from a value between 30 and 100.
// Interpolates from green (#00FF00) at 30% to red (#FF0000) at 100%.
const getHeatmapColor = (val) => {
  const ratio = (val - 30) / 70;
  const r = Math.round(ratio * 255);
  const g = Math.round(255 - ratio * 255);
  return `rgb(${r}, ${g}, 0)`;
};

const ChartKPIOverTime = ({ height = 400 }) => {

  // Generate tree data with two levels: stack -> project.
  const generateTreeData = () => {
    // Group projects by their first stack name.
    const groupedStacks = {};
    projectsData.results.forEach(project => {
      const stackName = project.stacks && project.stacks[0]?.name || "Unknown Stack";
      if (!groupedStacks[stackName]) groupedStacks[stackName] = [];
      groupedStacks[stackName].push(project);
    });

    // Build tree: each project gets a random percentage and corresponding heatmap color.
    return Object.entries(groupedStacks).map(([stackName, projects]) => ({
      name: stackName,
      // Optional styling for stacks.
      itemStyle: { gapWidth: 3, borderColor: "#000" },
      children: projects.map(project => {
        const randomPercent = Math.floor(Math.random() * 71) + 30; // random between 30 and 100
        const color = getHeatmapColor(randomPercent);
        return {
          name: project.name,
          value: randomPercent,
          itemStyle: { color, gapWidth: 3 }
        };
      })
    }));
  };

  const treeData = generateTreeData();

  const option = {
    series: [
      {
        type: 'treemap',
        data: treeData,
        visibleMin: 300,
        label: {
          show: false,
          formatter: '{b}'
        },
        upperLabel: {
          show: false,
          height: 30
        },
        itemStyle: {
          borderColor: '#fff',
          gapWidth: 1
        }
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: "200px", width: "100%" }} />;
};

export default ChartKPIOverTime;
