import React, { useState, useEffect } from 'react';
import {
    Box, TextField, IconButton, Typography, Paper, Chip, InputAdornment,
    Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DisableIcon from '@mui/icons-material/BlockOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants/colors';
import { BestPracticesKPI, ComplianceKPI, ResilienceKPI } from './KPIShapes';

const PolicyStatus = ({ status, result, lastLog, executionId }) => {
    const getStatusConfig = () => {
        if (!status) {
            return { label: 'PENDING', colors: COLORS.policyStatus.other };
        }
        
        if (status === 1) {
            if (result === 1) {
                return { label: 'PASSING', colors: COLORS.policyStatus.passing };
            }
            return { label: 'FAILING', colors: COLORS.policyStatus.failing };
        }
        
        return { label: 'ERROR', colors: COLORS.policyStatus.other };
    };

    const config = getStatusConfig();
    const hasError = status === 1 && result === 0 && lastLog;

    return (
        <Box 
            component={executionId ? Link : 'div'}
            to={executionId ? `/events/${executionId}` : undefined}
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                textDecoration: 'none',
                cursor: executionId ? 'pointer' : 'default'
            }}
        >
            <Chip
                label={config.label}
                sx={{
                    backgroundColor: config.colors.bg,
                    color: config.colors.color,
                    fontWeight: 500,
                }}
            />
            {hasError && (
                <Tooltip title={lastLog}>
                    <HelpOutlineIcon color="error" sx={{ fontSize: 20 }} />
                </Tooltip>
            )}
        </Box>
    );
};

const getKPIShape = (badgeName, size = 24) => {
    console.log(`Badge name: ${badgeName}`);
    const props = { size };
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

const PoliciesTable = ({ projectId }) => {
    const [policies, setPolicies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(false);

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const endpoint = projectId
                ? `/api/projects/${projectId}/policies`
                : '/api/policies';
            const response = await fetch(endpoint);
            const data = await response.json();
            setPolicies(data.result || []);
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, [projectId]);

    const filteredPolicies = policies.filter(policy =>
        policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSort = (field) => {
        setSortBy(field);
        setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    };

    const handlePolicyAction = async (action) => {
        if (!selectedPolicy) return;

        if (action === 'disable') {
            setConfirmDialog(true);
        } else if (action === 'check') {
            // Implement manual policy check
            try {
                await fetch(`/api/projects/${projectId}/policies/${selectedPolicy.id}/check`, {
                    method: 'POST'
                });
                await fetchPolicies();
            } catch (error) {
                console.error('Error checking policy:', error);
            }
        }
        setAnchorEl(null);
    };

    const sortedPolicies = [...filteredPolicies].sort((a, b) => {
        const modifier = sortDirection === 'asc' ? 1 : -1;
        console.log('policy', a)
        return a[sortBy].localeCompare(b[sortBy]) * modifier;
    });

    console.log('sortedPolicies', sortedPolicies);

    return (
        <Paper sx={{ 
            backgroundColor: 'white',
            borderRadius: 1,
            boxShadow: 3,
            overflow: 'hidden'
        }}>
            <Box sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'grey.50'
            }}>
                              {/* <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                Policies
              </Typography> */}
                <TextField
                    placeholder="Search policies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ width: '300px' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => handleSort('name')}>
                        <SortIcon />
                    </IconButton>
                    <IconButton onClick={fetchPolicies} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                </Box>
            </Box>

            <Box>
                {sortedPolicies.map((policy, index) => (
                    <Box
                        key={policy.id}
                        sx={{
                            p: 2,
                            display: 'grid',
                            gridTemplateColumns: '60px 3fr 2fr 1fr auto',
                            gap: 3,
                            alignItems: 'center',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s ease-in-out',
                            '&:last-child': {
                                borderBottom: 'none'
                            },
                            '&:hover': {
                                transform: 'scale(1.01)',
                                backgroundColor: 'rgba(0, 0, 0, 0.01)',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
                            }
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            {getKPIShape(policy.kpi.name)}
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <Typography 
                                variant="subtitle1" 
                                component={Link}
                                to={`/policies/${policy.id}`}
                                sx={{ 
                                    fontWeight: 'bold',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    '&:hover': { color: 'primary.main' }
                                }}
                            >
                                {policy.name}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {policy.description}
                            </Typography>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            minWidth: 0,
                        }}>
                            {Object.entries(policy.criteria || {}).map(([type, values]) =>
                                values.map((value, index) => (
                                    <Chip
                                        key={`${type}-${index}`}
                                        label={value}
                                        size="small"
                                        variant="outlined"
                                        sx={{ maxWidth: '100%' }}
                                    />
                                ))
                            )}
                        </Box>

                        <Box sx={{
                            minWidth: 0,
                            justifySelf: 'flex-start' // Changed from 'flex-end' to 'flex-start'
                        }}>
                            <PolicyStatus
                                status={policy.last_execution?.status}
                                result={policy.last_execution?.result}
                                lastLog={policy.last_execution?.message || policy.last_execution?.logs?.[0]?.message}
                                executionId={policy.last_execution?.id}
                            />
                        </Box>
                        
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setSelectedPolicy(policy);
                            }}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                ))}
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={() => handlePolicyAction('check')}>
                    <ListItemIcon>
                        <PlayArrowIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Run Check</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handlePolicyAction('disable')}>
                    <ListItemIcon>
                        <DisableIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Disable Policy</ListItemText>
                </MenuItem>
            </Menu>

            <Dialog
                open={confirmDialog}
                onClose={() => setConfirmDialog(false)}
            >
                <DialogTitle>Disable Policy?</DialogTitle>
                <DialogContent>
                    Are you sure you want to disable this policy?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={() => {
                            // Implement disable logic
                            setConfirmDialog(false);
                        }}
                        color="error"
                    >
                        Disable
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default PoliciesTable;
