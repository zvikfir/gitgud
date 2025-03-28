import { useState, useEffect } from 'react';

// Cache object outside of component to persist between renders
const cache = {
  user: null,
  lastContribution: null,
  nextTask: null,
};

export const useUser = () => {
  const [userData, setUserData] = useState({
    user: cache.user,
    lastContribution: cache.lastContribution,
    nextTask: cache.nextTask,
    error: null,
    isLoading: !cache.user
  });

  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      // Skip if we already have cached data
      if (cache.user) return;

      try {
        const [userResponse, contributionResponse, taskResponse] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/users/last-contribution'),
          fetch('/api/users/next-task'),
        ]);

        if (!mounted) return;

        const [rawUser, lastContribution, nextTask] = await Promise.all([
          userResponse.json(),
          contributionResponse.json(),
          taskResponse.json(),
        ]);

        const user = {
          id: rawUser.id,
          username: rawUser.username,
          displayName: rawUser.displayName,
          email: rawUser.emails[0]?.value,
          avatarUrl: rawUser.avatarUrl,
          profileUrl: rawUser.profileUrl,
          userType: rawUser.userType,
          lastActivity: rawUser._json.last_activity_on
        };

        // Update cache
        cache.user = user;
        cache.lastContribution = lastContribution;
        cache.nextTask = nextTask;

        if (mounted) {
          setUserData({ user, lastContribution, nextTask, error: null, isLoading: false });
        }
      } catch (error) {
        if (mounted) {
          setUserData(prev => ({ ...prev, error: error.message, isLoading: false }));
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, []); 

  return userData;
};