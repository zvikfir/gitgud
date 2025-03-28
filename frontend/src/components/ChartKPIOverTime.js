import React from "react";
import ReactECharts from "echarts-for-react";
import { COLORS } from "../constants/colors";

const ChartKPIOverTime = ({ color = COLORS.bestPractices, limit = 30, height = 70 }) => {

  // Updated generateData to start from a random value between limit/5 and limit/3.
  const generateData = () => {
    const data = [];
    const totalPoints = 30;
    const minStart = Math.floor(limit / 5);
    const maxStart = Math.floor(limit / 3);
    let current = Math.floor(Math.random() * (maxStart - minStart + 1)) + minStart;
    for (let i = 0; i < totalPoints; i++) {
      // 30% chance to earn badges on a given day
      if (Math.random() < 0.3) {
        const badgesEarned = Math.floor(Math.random() * 2) + 1; // 1 or 2 badges
        current = Math.min(current + badgesEarned, limit);
      }
      data.push(current);
    }
    return data;
  };

  const data = generateData();
  const xAxisData = data.map((_, i) => i.toString());

  // Create a gradient color using echarts.graphic if available
  const gradientColor = (window.echarts && window.echarts.graphic)
    ? new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color },
        { offset: 1, color: "#fff" }
      ])
    : color;

  const option = {
    tooltip: {},
    grid: {
      right: 0,
      left: 0,
      top: 0,
      bottom: 0
    },
    xAxis: {
      data: xAxisData,
      axisLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      axisLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    series: [{
      name: "Value",
      type: "bar",
      data,
      itemStyle: { color: gradientColor },
      animationDelay: function (idx) { return idx * 30; }
    }]
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} />;
};

export default ChartKPIOverTime;
