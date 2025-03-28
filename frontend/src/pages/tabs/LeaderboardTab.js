import React from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar, Stack, Container } from '@mui/material';
import BadgePlaceholder from '../../components/BadgePlaceholder';

const mockLeaderboard = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "/avatars/sarah.jpg",
    role: "Security Engineer",
    score: 2840,
    badges: [
      { id: 1, achieved: true },
      { id: 2, achieved: true },
      { id: 3, achieved: true },
      { id: 4, achieved: false },
    ]
  },
  {
    id: 2,
    name: "Mike Johnson",
    avatar: "/avatars/mike.jpg",
    role: "DevOps Lead",
    score: 2720,
    badges: [
      { id: 1, achieved: true },
      { id: 2, achieved: true },
      { id: 3, achieved: false },
      { id: 4, achieved: false },
    ]
  },
  {
    id: 3,
    name: "Emma Wilson",
    avatar: "/avatars/emma.jpg",
    role: "Platform Engineer",
    score: 2650,
    badges: [
      { id: 1, achieved: true },
      { id: 2, achieved: true },
      { id: 3, achieved: true },
      { id: 4, achieved: true },
    ]
  }
];

const LeaderboardTab = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Top Contributors
          </Typography>
          
          <List sx={{ width: '100%' }}>
            {mockLeaderboard.map((user, index) => (
              <ListItem 
                key={user.id}
                sx={{
                  mb: 2,
                  p: 3,
                  bgcolor: index === 0 ? 'primary.50' : 'transparent',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <ListItemAvatar sx={{ mr: 2 }}>
                  <Avatar
                    src={user.avatar}
                    sx={{ 
                      width: 56, 
                      height: 56,
                      border: index === 0 ? 2 : 0,
                      borderColor: 'primary.main'
                    }}
                  />
                </ListItemAvatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ mr: 1 }}>
                      {index === 0 && '👑'} {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      • {user.role}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {user.badges.map((badge, idx) => (
                      <BadgePlaceholder key={badge.id} achieved={badge.achieved} />
                    ))}
                  </Stack>
                </Box>
                <Box sx={{ ml: 2, textAlign: 'right' }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 500 }}>
                    {user.score}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    points
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default LeaderboardTab;