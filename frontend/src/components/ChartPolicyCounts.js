import React from "react";
import ReactECharts from "echarts-for-react";
import { COLORS } from "../constants/colors";
import { ConstructionOutlined } from "@mui/icons-material";

const ChartPolicyCounts = ({ data, color = "#F4F1EA", limit = 63, height = 150 }) => {
  // New KPI data: each with title and count.
  const kpis = data;

  // Map titles to colors from COLORS.
  const kpiColors = {
    'Best Practices': COLORS.bestPractices,
    'Compliance': COLORS.compliance,
    'Resilience': COLORS.resilience
  };

  const total = kpis.reduce((sum, kpi) => sum + kpi.count, 0);

  const seriesData = kpis.map(kpi => ({
    value: kpi.count,
    name: kpi.title,
    itemStyle: { color: kpiColors[kpi.title] }
  }));

  // This example requires ECharts v5.5.0 or later
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      formatter: function (name) {
        return name + ': ' + (seriesData.find(s => s.name === name).value);
      }
    },
    series: [
      {
        name: 'KPIs',
        type: 'pie',
        radius: [20, height - 85],
        left: '55%',
        center: ['25%', '50%'],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 5
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          }
        },
        data: seriesData,

      }
    ],
    // graphic: {
    //   type: 'text',
    //   left: '50%',
    //   top: '60%',
    //   style: {
    //     text: total.toString(), // displays the total count
    //     textAlign: 'center',
    //     fill: '#000',
    //     fontSize: 24,
    //     fontWeight: 'bold'
    //   }
    // }
  };

  return <ReactECharts option={option} style={{ height, width: "100%" }} />;
};

export default ChartPolicyCounts;
