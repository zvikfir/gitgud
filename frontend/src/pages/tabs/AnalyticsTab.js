
import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WelcomeMessage = ({ user, lastContribution }) => (
  <Box sx={{ mb: 4, textAlign: 'left', width: '100%' }}>
    {user && (
      <Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Welcome back, {user.displayName.split(' ')[0]} 👋
        </Typography>
        {lastContribution && (
          <Typography variant="subtitle1" color="text.secondary">
            Nice work on your recent contribution to {lastContribution.policyName} 
            in project {lastContribution.projectName}!
          </Typography>
        )}
      </Box>
    )}
  </Box>
);

const TaskSuggestion = ({ tasks = [] }) => (
  <Paper elevation={1} sx={{ p: 3, mb: 4, width: '100%' }}>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Suggested Tasks
    </Typography>
    {tasks.length > 0 ? (
      tasks.map(task => (
        <Box key={task.id} sx={{ mb: 2, p: 1, '&:hover': { bgcolor: 'action.hover' } }}>
          <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
            {task.description} ({task.estimatedTime})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Priority: {task.priority} • Impact: {task.impact}
          </Typography>
        </Box>
      ))
    ) : (
      <Typography>No pending tasks at the moment</Typography>
    )}
  </Paper>
);


const AnalyticsTab = () => {
  const [dashboardData, setDashboardData] = useState({
    activePoliciesCount: 0,
    policyTrends: { labels: [], data: [] },
    totalProjects: 0,
    projectTrends: { labels: [], data: [] },
    totalContributors: 0,
    contributorTrends: { labels: [], data: [] },
    kpiCompliance: { labels: [], data: [] },
    badgesCompletion: { labels: [], data: [] }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/management/dashboard');
        const data = await response.json();
        if (data.status === 'ok') {
          console.log('Dashboard data:', data.data);  // Debug log
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const lineChartData = {
    labels: dashboardData.projectTrends.labels,
    datasets: [
      {
        label: 'Projects',
        data: dashboardData.projectTrends.data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const complianceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Compliance',
        data: [65, 68, 72, 75, 76, 78],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const policiesData = {
    labels: dashboardData.policyTrends.labels,
    datasets: [
      {
        label: 'Policies',
        data: dashboardData.policyTrends.data,
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1
      }
    ]
  };

  const contributorsData = {
    labels: dashboardData.contributorTrends.labels,
    datasets: [
      {
        label: 'Contributors',
        data: dashboardData.contributorTrends.data,
        borderColor: 'rgb(255, 159, 64)',
        tension: 0.1
      }
    ]
  };

  const barChartData = {
    labels: dashboardData.badgesCompletion.labels,
    datasets: [
      {
        label: 'Badge Completion',
        data: dashboardData.badgesCompletion.data,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      }
    ]
  };

  const trendChartData = {
    labels: dashboardData.badgesCompletion.labels,
    datasets: [
      {
        label: 'Policy Compliance',
        data: dashboardData.badgesCompletion.data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    }
  };

  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { 
        display: false,
        min: Math.min(...lineChartData.datasets[0].data) * 0.95,
        max: Math.max(...lineChartData.datasets[0].data) * 1.05
      }
    },
    elements: {
      point: { radius: 0 },
      line: { borderWidth: 1.5 }
    }
  };

  const KPICard = ({ title, value, description, sparklineData }) => {
    console.log(`KPICard ${title}:`, sparklineData); // Debug log

    const getTrendPercentage = (data) => {
      if (!data?.datasets?.[0]?.data || data.datasets[0].data.length === 0) return '0';
      const values = data.datasets[0].data;
      const lastMonth = values[values.length - 1];
      const previousMonth = values[values.length - 2];
      if (previousMonth === undefined || lastMonth === undefined) return '0';
      
      // Handle case where previousMonth is 0
      if (previousMonth === 0) {
        return lastMonth > 0 ? '100' : '0';
      }
      
      const change = ((lastMonth - previousMonth) / previousMonth) * 100;
      return change.toFixed(1);
    };

    const trendPercentage = sparklineData ? getTrendPercentage(sparklineData) : '0';

    const getSparklineOptions = (data) => {
      if (!data?.datasets?.[0]?.data || data.datasets[0].data.length === 0) {
        return null;
      }

      // Even if all values are 0, show the sparkline with a fixed scale
      const allZeros = data.datasets[0].data.every(val => val === 0);
      const minValue = allZeros ? 0 : Math.min(...data.datasets[0].data) * 0.95;
      const maxValue = allZeros ? 1 : Math.max(...data.datasets[0].data) * 1.05;

      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        scales: {
          x: { display: false },
          y: { 
            display: false,
            min: minValue,
            max: maxValue
          }
        },
        elements: {
          point: { radius: 0 },
          line: { borderWidth: 1.5 }
        }
      };
    };

    const options = sparklineData ? getSparklineOptions(sparklineData) : null;

    return (
      <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Typography variant="h4" sx={{ my: 2 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{description}</Typography>
        {sparklineData && options && (
          <Box sx={{ mt: 'auto' }}>
            <Box sx={{ 
              height: 30,
              width: '100%',
              mb: 1
            }}>
              <Line data={sparklineData} options={options} />
            </Box>
            <Typography 
              variant="body2" 
              color={Number(trendPercentage) >= 0 ? 'success.main' : 'error.main'}
              sx={{ 
                fontWeight: 'medium',
                fontSize: '0.875rem',
                textAlign: 'right'
              }}
            >
              {Number(trendPercentage) >= 0 ? '+' : ''}{trendPercentage}% Since Last Month
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* KPI Cards */}
        <Grid item xs={12} md={3}>
          <KPICard
            title="Total Projects"
            value={dashboardData.totalProjects.toString()}
            description="Active projects in the system"
            sparklineData={lineChartData}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Policy Compliance"
            value="78%"
            description="Average compliance score"
            sparklineData={complianceData}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Active Policies"
            value={dashboardData.activePoliciesCount.toString()}
            description="Policies being enforced"
            sparklineData={policiesData}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Contributors"
            value={dashboardData.totalContributors.toString()}
            description="Total unique contributors"
            sparklineData={contributorsData}
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Policy Compliance Trends</Typography>
            <Box sx={{ height: 300 }}>
              <Line data={trendChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Badge Completion</Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={barChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Activity</Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
              '& > div': {
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1
              }
            }}>
              {[
                { type: 'Project Added', details: 'Frontend Service' },
                { type: 'Policy Updated', details: 'Security Scan Policy' },
                { type: 'Compliance Alert', details: 'Backend API Service' }
              ].map((activity, index) => (
                <Box key={index}>
                  <Typography variant="body2" color="text.secondary">
                    {activity.type}
                  </Typography>
                  <Typography>{activity.details}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AnalyticsTab;