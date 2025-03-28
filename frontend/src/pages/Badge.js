import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Box, Grid, Paper } from "@mui/material";
import PageHeader from "../components/PageHeader";
import BadgeKPI from "../components/BadgeKPI";
import BadgeTable from "../components/BadgeTable";

import CircularProgress from "@mui/material/CircularProgress";

const Badge = () => {
  const { id } = useParams(); // Get the project ID from the URL
  const [badge, setBadge] = useState(null);
  const [panels, setPanels] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const badgeResponse = await fetch(`/api/badges/${id}`);
        if (!badgeResponse.ok) {
          throw new Error("Failed to fetch project policies");
        }
        let badgeData = await badgeResponse.json();
        badgeData = badgeData.result;
        setBadge(badgeData);
        setLoading(false);

        let statsCompletion = badgeData.stats.completion;

        // Function to accumulate counts over 30 days
        const getAccumulatedHistory = (last30Days) => {
          //create an array of last 30 days, each with a date and a count {date: "2021-10-01", count: 0}
          const accumulatedHistory = Array.from({ length: 30 }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - index);
            const dateString = date.toISOString().split("T")[0];
            const count = last30Days[dateString] || 0;
            return { date: dateString, count };
          }).reverse();

          let cumulativeCount = 0;
          //for each of the generated date get the count from the last30Days object which looks the same, add it to the cumalative count and update the array
          accumulatedHistory.forEach((day) => {
            let date = day.date;
            let count =
              last30Days.filter((day) => day.date === date)[0]?.count || 0;
            cumulativeCount += count;
            day.count = cumulativeCount;
          });

          return accumulatedHistory;
        };

        // Example usage
        const statsCompletion30Days = getAccumulatedHistory(
          statsCompletion.last_30_days
        );

        const panels = [
          {
            content: (
              <div>
                <BadgeKPI
                  title="Completion"
                  description="The percentage of policy checks passed out of the total."
                  percentage={Math.round(
                    (statsCompletion.totals.totalPassed /
                      statsCompletion.totals.totalProjectPolicies) *
                      100
                  )}
                  summary={`${statsCompletion.totals.totalPassed} policy checks out of ${statsCompletion.totals.totalProjectPolicies} have passed.`}
                  history={statsCompletion30Days}
                />
              </div>
            ),
          },
          // {
          //   content: (
          //     <div>
          //       <BadgeKPI
          //         title="Effectiveness"
          //         description="Out of all onboarded projects, how many are actually participating in this badge program."
          //         percentage={Math.round(
          //           (badgeData.stats.effective.total_eligible_projects /
          //             badgeData.stats.effective.total_projects) *
          //             100
          //         )}
          //         summary={`${badgeData.stats.effective.total_eligible_projects} projects are participating out of ${badgeData.stats.effective.total_projects}.`}
          //         history={badgeData.stats.effective.over_time}
          //       />
          //     </div>
          //   ),
          // },
          // {
          //   content: (
          //     <div>
          //       <BadgeKPI
          //         title="Adoption"
          //         description="How many developers participated in a project relating to this badge program."
          //         percentage={Math.round(
          //           (badgeData.stats.coverage.fulfilled_sum /
          //             badgeData.stats.coverage.total_sum) *
          //             100
          //         )}
          //         summary={`${badgeData.stats.coverage.fulfilled_sum} contributors out of a total of ${badgeData.stats.coverage.total_sum} participated.`}
          //         history={badgeData.stats.coverage.over_time}
          //       />
          //     </div>
          //   ),
          // },
        ];
        setPanels(panels);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchBadge();
  }, [id]);
  return (
    <Container maxWidth="xl">
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="body1" color="error">
          {error.message}
        </Typography>
      ) : (
        <>
          <Grid container>
            <Grid item xs={12} md={12} key="overview">
              <Paper sx={{ p: 2, mt: 4 }}>
                <Grid container>
                  <Grid item xs={12} md={4} key={badge.name}>
                    <Box>
                      <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: "2.45rem",
                          fontWeight: 700,
                          textAlign: "left",
                          //marginTop: 4,
                        }}
                      >
                        {badge.name}
                      </Typography>

                      <Typography
                        variant="body1"
                        component="p"
                        gutterBottom
                        sx={{
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: "1.15rem",
                          textAlign: "left",
                          marginBottom: 4,
                          paddingRight: 20,
                          color: "text.secondary",
                        }}
                      >
                        {badge.description}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4} key="metrics">
                    <Box>
                      <Grid container>
                        <Grid item xs={6}>
                          <Typography variant="h5" component="h2" gutterBottom>
                            Badges Earned
                          </Typography>

                          <Typography variant="h5" component="h2" gutterBottom>
                            {badge.stats.earned.totals.totalEarned} /{" "}
                            {badge.stats.earned.totals.totalProjects}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="h5" component="h2" gutterBottom>
                            Policy Checks Completed
                          </Typography>

                          <Typography variant="h5" component="h2" gutterBottom>
                            {badge.stats.completion.totals.totalPassed} /{" "}
                            {badge.stats.completion.totals.totalProjectPolicies}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4} key="last_30_days">
                    <Box>last 30 days</Box>
                  </Grid>
                </Grid>
              </Paper>{" "}
            </Grid>
            <Grid item xs={12} md={12} key="breakdown">
              <Paper sx={{ p: 2, mt: 4 }}>
                <Grid container>
                  <Grid item xs={12} md={3} key="breakdown">
                    By Stack
                  </Grid>
                  <Grid item xs={12} md={3} key="breakdown">
                    By Owner
                  </Grid>
                  <Grid item xs={12} md={3} key="breakdown">
                    By Lifecycle
                  </Grid>
                  <Grid item xs={12} md={3} key="breakdown">
                    Top Contributors
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={12} key="projects">
              <Paper sx={{ p: 2, mt: 4 }}>
                <Box>Project list</Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Badge;
