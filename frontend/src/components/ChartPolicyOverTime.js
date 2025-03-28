import React from "react";
import ReactECharts from "echarts-for-react";
import { COLORS } from "../constants/colors";

const ChartPolicyOverTime = ({ color = "#718f8e45", limit = 63, height = 50, totalPoints= 30 }) => {
  // New function generating two series: executions and errors
  const generateSeriesData = () => {
    const executions = [];
    const errors = [];
    // Initialize first value
    executions.push(Math.floor(Math.random() * (63 - 7 + 1)) + 7);
    errors.push(Math.floor(Math.random() * 14)); // 0 to 13
    for (let i = 1; i < totalPoints; i++) {
      // executions: previous value plus jitter in [-5,5], clamped between 7 and 63
      let exec = executions[i - 1] + Math.floor(Math.random() * 11) - 5;
      exec = Math.max(7, Math.min(exec, 63));
      executions.push(exec);
      // errors: previous value with jitter in [-2,2], clamped between 0 and 13
      let err = errors[i - 1] + Math.floor(Math.random() * 5) - 2;
      err = Math.max(0, Math.min(err, 13));
      errors.push(err);
    }
    return { executions, errors };
  };

  const { executions, errors } = generateSeriesData();
  const xAxisData = executions.map((_, i) => i.toString());

  // Create a gradient color using echarts.graphic if available
  const gradientColor = (window.echarts && window.echarts.graphic)
    ? new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color },
        { offset: 1, color: "#fff" }
      ])
    : color;

  const option = {
    tooltip: { trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const [executions, errors] = params;
        return `Executions: ${executions.value}<br />Errors: ${errors.value}`;
      }
     },
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
    series: [
      {
        name: "Executions",
        type: "bar",
        data: executions,
        itemStyle: { color: gradientColor },
        animationDelay: function (idx) { return idx * 30; }
      },
      {
        name: "Errors",
        type: "scatter",
        data: errors,
        symbol: "circle",
        symbolSize: 8,
        itemStyle: { color: "#c23531" } // fixed color for errors
      }
    ]
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} />;
};

export default ChartPolicyOverTime;
