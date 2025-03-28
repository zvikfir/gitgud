
import React from 'react';
import { Box, Paper, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { BestPracticesKPI, ComplianceKPI, ResilienceKPI } from './KPIShapes';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'transform 0.2s',
    '&:hover': {
        transform: 'translateY(-2px)',
    }
}));

const KPICard = ({ policy }) => {
    const getStatusColor = (status, result) => {
        if (!status) return 'text.secondary';
        if (status === 2) return 'error.main';
        return result === 1 ? 'success.main' : 'error.main';
    };

    const getKPIShape = (badgeName, size = 24) => {
        const props = { size, sx: { position: 'absolute', right: 16, top: 16 } };
        switch (badgeName) {
            case 'Best Practices':
                return <BestPracticesKPI {...props} />;
            case 'Compliance':
                return <ComplianceKPI {...props} />;
            case 'Resilience':
                return <ResilienceKPI {...props} />;
            default:
                return null;
        }
    };

    return (
        <StyledPaper sx={{ borderRadius: 1,
            boxShadow: 3,
            backgroundColor: 'white',}}>
            {getKPIShape(policy.badge.name)}
            <Box sx={{
                mb: 2
            }}>
                <MuiLink
                    component={Link}
                    to={`/policies/${policy.id}`}
                    sx={{ textDecoration: 'none' }}
                >
                    <Typography variant="h6" component="h3" gutterBottom>
                        {policy.name}
                    </Typography>
                </MuiLink>
            </Box>

            <Box sx={{
                mt: 'auto'
            }}>
                <Typography
                    variant="body2"
                    color={getStatusColor(
                        policy.last_execution?.status,
                        policy.last_execution?.result
                    )}
                    fontWeight="500"
                >
                    {!policy.last_execution ? "Pending" :
                        policy.last_execution.status === 2 ? "Error" :
                            policy.last_execution.result === 1 ? "Passed" : "Failed"}
                </Typography>

                {policy.last_execution && (
                    <MuiLink
                        component={Link}
                        to={`/events/${policy.last_execution.id}`}
                        sx={{ textDecoration: 'none' }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            Last updated: {new Date(policy.last_execution.updatedAt).toLocaleDateString()}
                        </Typography>
                    </MuiLink>
                )}
            </Box>
        </StyledPaper>
    );
};

export default KPICard;