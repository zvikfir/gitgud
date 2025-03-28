import React from "react";
import ReactECharts from "echarts-for-react";
import { COLORS } from "../constants/colors";

const ChartKPISummary = ({ color = COLORS.bestPractices, limit = 30, v1=1,v2=2,v3=3 }) => {
  // Updated generateData with varying trend patterns
  
  const generateData = () => {
    const data = [];
    const totalPoints = 30;
    const patternType = Math.floor(Math.random() * 3); // 0: linear; 1: accelerating; 2: plateau-spike
    for (let i = 0; i < totalPoints; i++) {
      let value = 0;
      switch (patternType) {
        case 0: { // linear trend with noise
          const baseIncrement = limit / totalPoints;
          if (i === 0) {
            value = Math.random() * (baseIncrement * 0.5);
          } else {
            const noiseRange = baseIncrement * 0.3 * (1 - i / (totalPoints - 1));
            const noise = Math.random() * (2 * noiseRange) - noiseRange;
            value = data[i - 1] + baseIncrement + noise;
            if (value < data[i - 1]) value = data[i - 1];
            if (value > limit) value = limit;
          }
          break;
        }
        case 1: { // accelerating (quadratic) trend
          value = (Math.pow(i / (totalPoints - 1), 2)) * limit;
          if (i > 0 && value < data[i - 1]) value = data[i - 1];
          break;
        }
        case 2: { // plateau then spike trend
          if (i < totalPoints / 2) {
            const plateauIncrement = (limit * 0.2) / (totalPoints / 2);
            if (i === 0) {
              value = Math.random() * (plateauIncrement * 0.5);
            } else {
              value = data[i - 1] + plateauIncrement;
            }
          } else {
            const remaining = totalPoints - i;
            const midValue = data[Math.floor(totalPoints / 2) - 1] || 0;
            const spikeIncrement = (limit - midValue) / remaining;
            value = data[i - 1] + spikeIncrement;
          }
          break;
        }
        default: {
          value = data[i - 1] || 0;
        }
      }
      data.push(Number(value.toFixed(2)));
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
    polar: {
      radius: [30, '80%'],
      label: {
        show: false
      },
      axisLine: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },
    angleAxis: {
      max: 4.8,
      startAngle: 75,
      label: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisPointer: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },
    radiusAxis: {
      type: 'category',
      data: ['bestPractices', 'compliance', 'resilience'],
      axisLabel: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      }
    },
    tooltip: {},
    series: {
      type: 'bar',
      data: [
        {
          value: v1,
          itemStyle: {
            color: '#A8E6CF'
          },
          label: 'bestPractices'
        },
        {
          value: v2,
          itemStyle: {
            color: '#FFD54F'
          },
          label: 'compliance'
        },
        {
          value: v3,
          itemStyle: {
            color: '#D184E9'
          },
          label: 'resilience'
        }
      ],
      coordinateSystem: 'polar',
      label: {
        show: false,
        position: 'middle',
        formatter: '{b}: {c}'
      }
    },
    xAxis: {
      label: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        show: false
      }
    },
    yAxis: {
      label: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        show: false
      }
    }
  };;

  return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />;
};

export default ChartKPISummary;
