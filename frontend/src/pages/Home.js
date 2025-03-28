import React, { useState } from 'react';
import { Box, Container, Typography, Chip, Table, TableHead, TableRow, TableCell, TableBody, Avatar } from '@mui/material';
import { useUser } from '../UserContext';

import { COLORS } from "../constants/colors";

const PolicyStatus = ({ status }) => {


  const getStatusConfig = () => {
    if (!status) {
      return { label: 'PENDING', colors: COLORS.policyStatus.other };
    }

    if (status === 'PASSED') {

      return { label: 'PASSING', colors: COLORS.policyStatus.passing };
    }
    else {
      return { label: 'FAILING', colors: COLORS.policyStatus.failing };
    }
  }

  const config = getStatusConfig();


  return (

    <Chip
      label={config.label}
      sx={{
        backgroundColor: config.colors.bg,
        color: config.colors.color,
        fontWeight: 500,
      }}
    />


  );
};

const Home = () => {
  const { user } = useUser();

  const notifications = [
    { since: "2h ago", message: "Policy Readme exists for project Enigma of stack Turing Stack as passed" },
    { since: "4h ago", message: "Policy Repository Must Have Tests for project Graphene of stack Euler Stack as passed" },
    { since: "8h ago", message: "Policy Code Coverage Must Be Above 80% for project Entropy of stack Shannon Stack as passed" },
    { since: "Yesterday", message: "Policy Dependency Lock File Exists for project Modulus of stack Gauss Stack as passed" },
    { since: "Yesterday", message: "Policy Git Ignore is Configured for project Bombe of stack Turing Stack as passed" },
    { since: "3 days ago", message: "Policy Contributing Guidelines Exist for project Prime of stack Euler Stack as passed" },
    { since: "4 days ago", message: "Policy Docker Compose / Tiltfile Exists for project NoisyChannel of stack Shannon Stack as passed" },
    { since: "5 days ago", message: "Policy Secrets Are Not in Code for project Gaussian of stack Gauss Stack as failed" },
    { since: "6 days ago", message: "Policy Code Uses Approved Dependencies for project Halting of stack Turing Stack as failed" }
  ];

  // New mock data for patches
  const patches = [
    { insignia: '/assets/patches/1.png', title: 'README Ranger', description: 'Awarded to those who ensure every repo includes a clear, comprehensive README.md, improving documentation and onboarding.' },
    { insignia: '/assets/patches/2.png', title: 'Lockfile Sentinel', description: 'Earned by developers who maintain dependable dependency lock files (package-lock.json, yarn.lock, etc.) for consistent builds.' },
    { insignia: '/assets/patches/3.png', title: 'Secrets Slayer', description: 'Bestowed upon those who eliminate hardcoded passwords, API keys, or secrets from code, ensuring a secure repo.' },
    { insignia: '/assets/patches/4.png', title: 'Coverage Commando', description: 'Recognizes developers who surpass the 80% (or any set) code coverage threshold, demonstrating robust testing discipline.' },
    { insignia: '/assets/patches/5.png', title: 'TLS Tactician', description: 'Honors those who enforce TLS encryption for all exposed services, protecting data in transit and upholding security standards.' },
    { insignia: '/assets/patches/6.png', title: 'HA Harbinger', description: 'Awarded to teams ensuring high availability—like configuring multi-replicas or multi-site resiliency—to keep systems battle-ready.' },
    { insignia: '/assets/patches/7.png', title: 'RBAC Recon', description: 'Granted to those who properly implement Kubernetes Role-Based Access Control, restricting permissions and keeping the environment locked down.' },
  ];

  // Define updated tasks
  const tasks = [
    {
      project: "Enigma",
      stack: "Turing Stack",
      title: "Add a README",
      message: "Give future collaborators a friendly welcome! A clear README helps everyone understand Enigma’s purpose and how to contribute—from setup to success."
    },
    {
      project: "Graphene",
      stack: "Euler Stack",
      title: "Include Automated Tests",
      message: "Protect your code from lurking bugs! Adding tests to Graphene ensures early detection of issues, boosts confidence in every commit, and keeps the project rock-solid."
    },
    {
      project: "Entropy",
      stack: "Shannon Stack",
      title: "Aim for 80%+ Code Coverage",
      message: "Strengthen your defenses with thorough testing! High coverage on Entropy means fewer unpleasant surprises, smoother deployments, and happier teammates."
    },
    {
      project: "Modulus",
      stack: "Gauss Stack",
      title: "Add a Dependency Lock File",
      message: "Prevent unexpected version chaos! A lock file ensures Modulus uses the same dependencies across all environments, making your builds stable and predictable."
    },
    {
      project: "Bombe",
      stack: "Turing Stack",
      title: "Configure a .gitignore",
      message: "Keep your repo squeaky clean! A well-tuned .gitignore for Bombe saves time, prevents accidental commits, and stops sensitive or unnecessary files from slipping in."
    }
  ];

  // Helper function to render formatted notification message
  const renderNotification = (message) => {
    const regex = /^Policy (.+?) for project (.+?) of stack (.+?) as (passed|failed)$/i;
    const match = regex.exec(message);
    if (match) {
      const [, policy, project, stack, status] = match;
      return (
        <>
          Policy <strong>{policy}</strong> for project <strong>{project}</strong> of stack <strong>{stack}</strong> as{' '} <PolicyStatus status={status.toUpperCase()}
          />
        </>
      );
    }
    return message;
  };

  // Helper function to compute percentage based on index
  const getPercentage = (index, total) => {
    const base = 89;
    const decrement = base / total;
    return Math.max(0, Math.round(base - index * decrement));
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 3, justifyContent: "space-between" }}>
        <Box  >
          <Box sx={{ display: "flex", mb: 2, mt: 2, p: 2, pb: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1, flexDirection: "column" }}>
            <Typography variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "2.45rem",
                fontWeight: 700,
                textAlign: "left",
                marginTop: 0,
                ml: 1
              }}>
              Welcome back, {user?.displayName?.split(' ')[0] || 'User'} 👋
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, ml: 1 }}>
              Here are a few quick tasks that we think you should pick up next.
            </Typography>
            <Box sx={{p:2}} >
              {tasks.map((task, idx) => (
                <Box key={idx} sx={{ mb: 1, borderBottom: "1px solid", borderColor: "divider", pb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {task.project} ({task.stack}) – {task.title}
                  </Typography>
                  <Typography variant="body2">
                    {task.message}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 2, mt: 2, p: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              While you were away, here are the latest notifications.
            </Typography>
            <Table size="small">
              <TableBody>
                {notifications.map((n, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{n.since}</TableCell>
                    <TableCell>{renderNotification(n.message)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

        </Box>
        <Box sx={{ flexBasis: "40%", display: "flex", flexDirection: "column", mb: 2, mt: 2, p: 2, bgcolor: "background.paper", boxShadow: 3, borderRadius: 1 }}>
          <Typography variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: "2.45rem",
              fontWeight: 700,
              textAlign: "left",
              marginTop: 0,
              ml: 1
            }}>
            Leaderboard
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Earn badges and see how you rank up as you complete tasks and boost your reputation.
          </Typography>
          <Table size="small">
            <TableBody>
              {patches.map((patch, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Avatar src={patch.insignia} sx={{ width: 100, height: 100, borderRadius: '50%', borderColor: 'divider', borderWidth: '1px', opacity: idx < 4 ? 1 : 0.2 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">{patch.title}</Typography>
                    <Typography variant="body2" color="textSecondary">{patch.description}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1">{getPercentage(idx, patches.length)}%</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
