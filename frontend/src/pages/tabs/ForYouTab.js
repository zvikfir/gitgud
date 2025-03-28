import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import {
  Container, Typography, Box, Paper,
  Chip, Button, Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { COLORS } from '../../constants/colors';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BadgePlaceholder from '../../components/BadgePlaceholder';

const StyledChip = styled(Chip)(({ theme, type }) => ({
  margin: '2px',
  backgroundColor: COLORS[`tag${type}`] || COLORS.tagLanguages,
  color: '#4A4A4A',
  '& .MuiChip-label': {
    fontWeight: 500,
  }
}));

const TaskCard = ({ task }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: 2.5,
      mb: 2,
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': { 
        borderColor: 'primary.main',
        bgcolor: 'grey.50'
      }
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 500 }}>
        {task.title}
      </Typography>
      <Button
        endIcon={<ArrowForwardIcon />}
        component={Link}
        to={task.link}
        sx={{ minWidth: 100 }}
      >
        Start
      </Button>
    </Box>
    <Typography color="text.secondary" sx={{ mb: 2 }}>
      {task.description}
    </Typography>
    <Stack direction="row" spacing={1} alignItems="center">
      <StyledChip 
        type="Languages"
        label={`${task.estimatedTime} mins`}
        size="small"
      />
      <StyledChip 
        type="Stack"
        label={task.project.stack}
        size="small"
      />
      {task.tags.map(tag => (
        <StyledChip
          key={tag}
          type="Owners"
          label={tag}
          size="small"
        />
      ))}
    </Stack>
  </Paper>
);

const ForYouTab = () => {
  const { user } = useUser();
  const mockUser = {
    badges: [
      { id: 1, name: "Policy Creator", achieved: true },
      { id: 2, name: "Security Expert", achieved: true },
      { id: 3, name: "Team Player", achieved: true },
      { id: 4, name: "Policy Master", achieved: false },
      { id: 5, name: "Champion", achieved: false },
    ],
    tasks: [
      {
        title: "Review Kubernetes RBAC Policy",
        description: "The policy needs review for compliance with latest security standards",
        estimatedTime: 30,
        link: "/policies/k8s-rbac",
        project: {
          name: "Cloud Platform",
          stack: "Kubernetes"
        },
        tags: ["Security", "High Priority"]
      },
      {
        title: "Update AWS IAM Controls",
        description: "Enhance IAM policy restrictions for production environment",
        estimatedTime: 45,
        link: "/policies/aws-iam",
        project: {
          name: "Infrastructure",
          stack: "AWS"
        },
        tags: ["Security", "Critical"]
      },
      {
        title: "Document CI/CD Security Gates",
        description: "Add documentation for newly implemented security controls",
        estimatedTime: 20,
        link: "/policies/cicd-security",
        project: {
          name: "DevOps",
          stack: "Jenkins"
        },
        tags: ["Documentation"]
      }
    ]
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            Welcome back, {user?.displayName?.split(' ')[0] || 'User'} 👋
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {user?.userType || 'Developer'} • Keep up the great work!
          </Typography>
          
          {/* <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Your Achievements
            </Typography>
            <Stack direction="row" spacing={1}>
              {mockUser.badges.map((badge, index) => (
                <BadgePlaceholder key={badge.id} achieved={badge.achieved} />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Suggested Tasks
            </Typography>
            {mockUser.tasks.map((task, index) => (
              <TaskCard key={index} task={task} />
            ))}
          </Box> */}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForYouTab;