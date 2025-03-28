import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: 'white',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
}));

const StyledContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
}));

const StatBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
}));

const KPIStats = ({ kpis = [] }) => {
    // Calculate overall score
    const overallPassed = kpis.reduce((acc, badge) => acc + badge.passedPolicyCount, 0);
    const overallTotal = kpis.reduce((acc, badge) => acc + badge.policyCount, 0);
    const overallScore = overallPassed / overallTotal;
    const overallTrend = overallPassed / overallTotal;

    const getBadgeStyles = (badgeName) => {
        switch (badgeName) {
            case 'Best Practices':
                return {
                    backgroundColor: '#A8E6CF',
                    color: '#4A4A4A'
                };
            case 'Compliance':
                return {
                    backgroundColor: '#FFD54F',
                    color: '#4A4A4A'
                };
            case 'Resilience':
                return {
                    backgroundColor: '#00796B',
                    color: '#FFFFFF'
                };
            default:
                return {
                    backgroundColor: 'grey.50',
                    color: '#4A4A4A'
                };
        }
    };

    const stats = (kpis || []).reduce((acc, badge) => {
        // ...existing reduce logic...
    }, {
        bestPractices: { total: 0, passed: 0 },
        compliance: { total: 0, passed: 0 },
        resilience: { total: 0, passed: 0 }
    });

    return (
        <Grid container spacing={0}>
            {/* Overall Summary */}
            <Grid item xs={12} sm={6} md={3}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        p: 3,
                        borderRadius: 0,
                        backgroundColor: '#E8EDF4',
                        color: '#4A4A4A',
                        borderRight: '1px solid rgba(0, 0, 0, 0.12)'
                    }}
                >
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, fontSize: '1.25rem' }}>
                        Overall Score
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 600 }}>
                            {Math.round(overallScore)}%
                        </Typography>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                            {overallTrend > 0 ? '+' : ''}{Math.round(overallTrend)}%
                        </Typography>
                    </Box>
                </Box>
            </Grid>

            {/* Individual Badge Scores */}
            {kpis.map((badge, index) => {
                const styles = getBadgeStyles(badge.badgeName);
                return (
                    <Grid item xs={12} sm={6} md={3} key={badge.badgeName}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                height: '100%',
                                p: 3,
                                borderRadius: 0,
                                backgroundColor: styles.backgroundColor,
                                color: styles.color,
                                borderRight: index < kpis.length - 1 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none'
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{ mb: 2, fontWeight: 700, color: 'inherit', fontSize: '1.25rem' }}
                            >
                                {badge.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography variant="h3" component="div" sx={{ fontWeight: 600, color: 'inherit' }}>
                                    {badge.policyCount}%
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        color: badge.policyCount > 0 ? 
                                            (styles.color === '#FFFFFF' ? '#A8E6CF' : 'success.main') : 
                                            (styles.color === '#FFFFFF' ? '#FFD54F' : 'error.main')
                                    }}
                                >
                                    {badge.policyCount > 0 ? '+' : ''}{badge.policyCount}%
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default KPIStats;