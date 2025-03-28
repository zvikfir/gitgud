import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Box, TextField, Switch, FormControlLabel, Button, Grid, Paper, IconButton, Tooltip, Typography, Autocomplete, Tabs, Tab, MenuItem, InputAdornment } from '@mui/material';

import * as monaco from 'monaco-editor';
import Editor, { loader } from '@monaco-editor/react';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useNavigate, Link } from 'react-router-dom';
import { Breadcrumbs } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CircularProgress from '@mui/material/CircularProgress';
import UndoIcon from '@mui/icons-material/Undo';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const EVENT_OPTIONS = [
  'push',
  'merge_request',
  'tag_push',
  'issue',
  'deployment'
];

const STATUS_OPTIONS = [
  { value: 0, label: 'Never executed before' },
  { value: 1, label: 'Passed' },
  { value: 2, label: 'Error' }
];

const CRITERIA_FIELDS = {
  events: { 
    type: 'array', 
    description: 'Event names that trigger this policy',
    options: EVENT_OPTIONS
  },
  ref: { 
    type: 'regex', 
    description: 'Git reference pattern (e.g., ^refs/heads/main$)' 
  },
  lifecycle: { 
    type: 'regex', 
    description: 'Project lifecycle pattern (e.g., ^(production|staging)$)' 
  },
  topics: { 
    type: 'regex', 
    description: 'Project topics pattern (e.g., frontend|backend)' 
  },
  exclude: { 
    type: 'regex', 
    description: 'Exclude pattern for topics' 
  },
  path: { 
    type: 'regex', 
    description: 'Project path pattern (e.g., ^apps/)' 
  },
  runtime: { 
    type: 'regex', 
    description: 'Runtime pattern (e.g., node|python)' 
  },
  language: { 
    type: 'regex', 
    description: 'Programming language pattern (e.g., javascript|typescript)' 
  },
  status: { 
    type: 'array', 
    description: 'Previous execution status',
    options: STATUS_OPTIONS
  }
};

const validateRegex = (value) => {
  try {
    if (!value) return true;
    new RegExp(value);
    return true;
  } catch {
    return false;
  }
};

// TypeScript definitions for context
const CONTEXT_DEFINITION = `
interface Context {
  logger: {
    info(msg: string): void;
    error(msg: string): void;
  };
  stats: {
    increment(key: string): void;
  };
  gitlab: {
    get(path: string): Promise<any>;
    head(path: string): Promise<any>;
  };
  utils: {
    // Add utility methods
  };
}
`;

// Configure Monaco Editor to use local resources
loader.config({ params: monaco });

const PolicyForm = ({ policy, onSubmit, mode = 'edit' }) => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [markdownTab, setMarkdownTab] = useState(0);
  const [formData, setFormData] = useState({
    name: policy?.name || '',
    description: policy?.description || '',
    longDescription: policy?.longDescription || '',
    scriptJs: policy?.scriptJs || 'async function handle(context, project, payload) {\n  // Your code here\n}',
    enabled: policy?.enabled ?? true,
    draft: policy?.draft ?? true,
    tags: policy?.tags || [],
    kpi: policy?.kpi?.id || '', // Changed to use ID instead of name
    criteria: policy?.criteria || {

    }
  });
  const [kpis, setKpis] = useState([]);
  const [helpTextTab, setHelpTextTab] = useState(0);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [previousHelpText, setPreviousHelpText] = useState('');
  const [showSuggestionActions, setShowSuggestionActions] = useState(false);
  const [isDetailsSuggesting, setIsDetailsSuggesting] = useState(false);
  const [previousDetails, setPreviousDetails] = useState(null);
  const [showDetailsActions, setShowDetailsActions] = useState(false);
  const [compliance, setCompliance] = useState(policy?.compliance || []);
  const [isCriteriaSuggesting, setIsCriteriaSuggesting] = useState(false);
  const [previousCriteria, setPreviousCriteria] = useState(null);
  const [showCriteriaActions, setShowCriteriaActions] = useState(false);
  const [isScriptSuggesting, setIsScriptSuggesting] = useState(false);
  const [previousScript, setPreviousScript] = useState(null);
  const [showScriptActions, setShowScriptActions] = useState(false);
  const [isLlmAvailable, setIsLlmAvailable] = useState(false);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const response = await fetch('/api/kpis');
        const data = await response.json();
        setKpis(data.results || []);
      } catch (error) {
        console.error('Failed to fetch KPIs:', error);
      }
    };
    fetchKpis();
  }, []);

  useEffect(() => {
    const checkLlmAvailability = async () => {
      try {
        const response = await fetch('/api/llm/status');
        const data = await response.json();
        setIsLlmAvailable(data.available);
      } catch (error) {
        console.error('Failed to check LLM availability:', error);
        setIsLlmAvailable(false);
      }
    };
    checkLlmAvailability();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleCriteriaChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [field]: value
      }
    }));
  };

  const handleGenerate = async () => {
    setIsSuggesting(true);
    setPreviousHelpText(formData.longDescription);
    
    try {
      const response = await fetch('/api/llm/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: '1001',
          payload: {
            name: formData.name,
            description: formData.description
          }
        })
      });
      
      const data = await response.json();
      if (data.response) {
        setFormData(prev => ({
          ...prev,
          longDescription: data.response
        }));
        setShowSuggestionActions(true);
      }
    } catch (error) {
      console.error('Failed to generate description:', error);
      // On error, revert to previous text
      setFormData(prev => ({
        ...prev,
        longDescription: previousHelpText
      }));
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAcceptSuggestion = () => {
    setPreviousHelpText('');
    setShowSuggestionActions(false);
  };

  const handleUndoSuggestion = () => {
    setFormData(prev => ({
      ...prev,
      longDescription: previousHelpText
    }));
    setPreviousHelpText('');
    setShowSuggestionActions(false);
  };

  const handleSuggestCriteria = async () => {
    setIsCriteriaSuggesting(true);
    setPreviousCriteria(formData.criteria);
    
    try {
      const response = await fetch('/api/llm/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: '1003',
          payload: {
            name: formData.name,
            description: formData.description,
            scriptJs: formData.scriptJs
          }
        })
      });
      
      const data = await response.json();
      if (data.response) {
        const suggestions = JSON.parse(data.response);
        
        // Convert regex strings to RegExp objects, removing leading/trailing slashes
        const processedCriteria = {
          events: suggestions.events || [],
          ref: suggestions.ref ? new RegExp(suggestions.ref.replace(/^\/|\/$/g, '')) : '',
          lifecycle: suggestions.lifecycle ? new RegExp(suggestions.lifecycle.replace(/^\/|\/$/g, '')) : '',
          topics: suggestions.topics ? new RegExp(suggestions.topics.replace(/^\/|\/$/g, '')) : '',
          exclude: suggestions.exclude ? new RegExp(suggestions.exclude.replace(/^\/|\/$/g, '')) : '',
          path: suggestions.path ? new RegExp(suggestions.path.replace(/^\/|\/$/g, '')) : '',
          runtime: suggestions.runtime ? new RegExp(suggestions.runtime.replace(/^\/|\/$/g, '')) : '',
          language: suggestions.language ? new RegExp(suggestions.language.replace(/^\/|\/$/g, '')) : '',
          status: suggestions.status || []
        };

        setFormData(prev => ({
          ...prev,
          criteria: processedCriteria
        }));
        setShowCriteriaActions(true);
      }
    } catch (error) {
      console.error('Failed to generate criteria:', error);
      if (previousCriteria) {
        setFormData(prev => ({
          ...prev,
          criteria: previousCriteria
        }));
      }
    } finally {
      setIsCriteriaSuggesting(false);
    }
  };

  const handleAcceptCriteria = () => {
    setPreviousCriteria(null);
    setShowCriteriaActions(false);
  };

  const handleUndoCriteria = () => {
    if (previousCriteria) {
      setFormData(prev => ({
        ...prev,
        criteria: previousCriteria
      }));
    }
    setPreviousCriteria(null);
    setShowCriteriaActions(false);
  };

  const handleSuggestScript = async () => {
    setIsScriptSuggesting(true);
    setPreviousScript(formData.scriptJs);
    
    try {
      const response = await fetch('/api/llm/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: '1004',
          payload: {
            name: formData.name,
            description: formData.description,
            criteria: formData.criteria
          }
        })
      });
      
      const data = await response.json();
      if (data.response) {
        // Format the response by removing quotes and unescaping newlines
        const formattedScript = data.response
          .replace(/^"|"$/g, '') // Remove surrounding quotes
          .replace(/\\n/g, '\n') // Replace escaped newlines with actual newlines
          .replace(/\\"/g, '"'); // Replace escaped quotes with actual quotes

        setFormData(prev => ({
          ...prev,
          scriptJs: formattedScript
        }));
        setShowScriptActions(true);
      }
    } catch (error) {
      console.error('Failed to generate script:', error);
      if (previousScript) {
        setFormData(prev => ({
          ...prev,
          scriptJs: previousScript
        }));
      }
    } finally {
      setIsScriptSuggesting(false);
    }
  };

  const handleAcceptScript = () => {
    setPreviousScript(null);
    setShowScriptActions(false);
  };

  const handleUndoScript = () => {
    if (previousScript) {
      setFormData(prev => ({
        ...prev,
        scriptJs: previousScript
      }));
    }
    setPreviousScript(null);
    setShowScriptActions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    navigate('/policies');
  };

  const handleAddCompliance = () => {
    setCompliance([...compliance, { standard: '', control: '', description: '' }]);
  };

  const handleRemoveCompliance = (index) => {
    setCompliance(compliance.filter((_, i) => i !== index));
  };

  const handleComplianceChange = (index, field, value) => {
    setCompliance(compliance.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSuggestDetails = async () => {
    setIsDetailsSuggesting(true);
    setPreviousDetails({
      kpi: formData.kpi,
      tags: formData.tags,
      compliance: compliance
    });
    
    try {
      const response = await fetch('/api/llm/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: '1002',
          payload: {
            name: formData.name,
            description: formData.description,
            longDescription: formData.longDescription,
            scriptJs: formData.scriptJs,
            kpis: kpis.map(k => ({
              id: k.id,
              name: k.name,
              description: k.description
            }))
          }
        })
      });
      
      const data = await response.json();
      if (data.response) {
        const suggestions = JSON.parse(data.response);

        // Ensure we have a valid KPI ID
        const kpiId = Number(suggestions.kpi);
        const validKpi = kpis.find(k => k.id === kpiId);
        
        if (!validKpi) {
          console.warn('Invalid KPI suggestion, using first available KPI');
          suggestions.kpi = kpis[0]?.id || '';
        }

        // Normalize compliance standards
        const normalizedCompliance = (suggestions.compliance || []).map(c => ({
          ...c,
          standard: c.standard === 'ISO27001' ? 'ISO27001' : 
                    c.standard === 'SOC2' ? 'SOC2' : ''
        })).filter(c => c.standard); // Only keep valid standards

        setFormData(prev => ({
          ...prev,
          kpi: suggestions.kpi,
          tags: suggestions.tags || []
        }));
        setCompliance(normalizedCompliance);
        setShowDetailsActions(true);
      }
    } catch (error) {
      console.error('Failed to generate details:', error);
      if (previousDetails) {
        setFormData(prev => ({
          ...prev,
          kpi: previousDetails.kpi,
          tags: previousDetails.tags
        }));
        setCompliance(previousDetails.compliance);
      }
    } finally {
      setIsDetailsSuggesting(false);
    }
  };

  const handleAcceptDetails = () => {
    setPreviousDetails(null);
    setShowDetailsActions(false);
  };

  const handleUndoDetails = () => {
    if (previousDetails) {
      setFormData(prev => ({
        ...prev,
        kpi: previousDetails.kpi,
        tags: previousDetails.tags
      }));
      setCompliance(previousDetails.compliance);
    }
    setPreviousDetails(null);
    setShowDetailsActions(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: 1,
        boxShadow: 3,
        mb: 4,
      }}>
        <Box sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50'
        }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link
              to="/policies"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              Policies
            </Link>
            <Typography color="text.primary" fontWeight={500}>
              {mode === 'edit' ? formData.name : 'New Policy'}
            </Typography>
          </Breadcrumbs>
        </Box>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
        }}>
          <Typography variant="h4" component="h1">
            <span style={{ fontWeight: 600 }}>{mode === 'edit' ? 'Edit Policy:' : 'New Policy'}</span>
            {formData.name && <span style={{ marginLeft: '8px', color: 'gray.500' }}>{formData.name}</span>}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/policies')}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              type="submit"
            >
              {mode === 'edit' ? 'Update Policy' : 'Create Policy'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Paper sx={{ boxShadow: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50'
            }}>
              <Typography variant="h6">Basic Information</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    sx={{ mt: 3 }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Policy Details */}
        <Grid item xs={12}>
          <Paper sx={{ boxShadow: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">Policy Details</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {showDetailsActions ? (
                  <>
                    <Button
                      startIcon={<CheckIcon />}
                      onClick={handleAcceptDetails}
                      size="small"
                      color="success"
                    >
                      Accept
                    </Button>
                    <Button
                      startIcon={<UndoIcon />}
                      onClick={handleUndoDetails}
                      size="small"
                    >
                      Undo
                    </Button>
                  </>
                ) : isLlmAvailable ? (
                  <Button
                    startIcon={isDetailsSuggesting ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
                    onClick={handleSuggestDetails}
                    disabled={isDetailsSuggesting || !formData.name || !formData.description}
                    size="small"
                  >
                    Suggest
                  </Button>
                ) : null}
              </Box>
            </Box>
            <Box sx={{ p: 3, position: 'relative' }}>
              {isDetailsSuggesting && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CircularProgress />
                </Box>
              )}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="KPI"
                    value={formData.kpi}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      kpi: e.target.value
                    }))}
                    required
                    disabled={isDetailsSuggesting}
                  >
                    {kpis.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name} - {option.description}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={formData.tags}
                    onChange={(_, newValue) => setFormData(prev => ({ ...prev, tags: newValue }))}
                    renderInput={(params) => (
                      <TextField {...params} label="Tags" />
                    )}
                    disabled={isDetailsSuggesting}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    mb: 2
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      Compliance Requirements
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddCompliance}
                      size="small"
                    >
                      Add Requirement
                    </Button>
                  </Box>
                  {compliance.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <TextField
                        select
                        label="Standard"
                        value={item.standard}
                        onChange={(e) => handleComplianceChange(index, 'standard', e.target.value)}
                        sx={{ minWidth: 200 }}
                        disabled={isDetailsSuggesting}
                      >
                        <MenuItem value="ISO27001">ISO 27001</MenuItem>
                        <MenuItem value="SOC2">SOC 2</MenuItem>
                      </TextField>
                      <TextField
                        fullWidth
                        label="Control"
                        placeholder="e.g., A.9.4.1 or CC6.1"
                        value={item.control}
                        onChange={(e) => handleComplianceChange(index, 'control', e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Description"
                        placeholder="e.g., Information access restriction"
                        value={item.description}
                        onChange={(e) => handleComplianceChange(index, 'description', e.target.value)}
                      />
                      <IconButton 
                        onClick={() => handleRemoveCompliance(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Long Description */}
        <Grid item xs={12}>
          <Paper sx={{ boxShadow: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">Help Text</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {showSuggestionActions ? (
                  <>
                    <Button
                      startIcon={<CheckIcon />}
                      onClick={handleAcceptSuggestion}
                      size="small"
                      color="success"
                    >
                      Accept
                    </Button>
                    <Button
                      startIcon={<UndoIcon />}
                      onClick={handleUndoSuggestion}
                      size="small"
                    >
                      Undo
                    </Button>
                  </>
                ) : isLlmAvailable ? (
                  <Button
                    startIcon={isSuggesting ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
                    onClick={handleGenerate}
                    disabled={isSuggesting || !formData.name || !formData.description}
                    size="small"
                  >
                    Suggest
                  </Button>
                ) : null}
              </Box>
            </Box>
            <Box sx={{ p: 3 }}>
              <Tabs
                value={helpTextTab}
                onChange={(_, newValue) => setHelpTextTab(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="Edit" />
                <Tab label="Preview" />
              </Tabs>
              <Box sx={{ minHeight: '300px', position: 'relative' }}>
                {isSuggesting && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CircularProgress />
                  </Box>
                )}
                {helpTextTab === 0 ? (
                  <MDEditor
                    value={formData.longDescription}
                    onChange={(value) => setFormData(prev => ({ ...prev, longDescription: value || '' }))}
                    height={300}
                    preview="edit"
                    readOnly={isSuggesting}
                  />
                ) : (
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    height: '300px',
                    overflow: 'auto'
                  }}>
                    <MDEditor.Markdown source={formData.longDescription} />
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Criteria */}
        <Grid item xs={12}>
          <Paper sx={{ boxShadow: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">Criteria</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {showCriteriaActions ? (
                  <>
                    <Button
                      startIcon={<CheckIcon />}
                      onClick={handleAcceptCriteria}
                      size="small"
                      color="success"
                    >
                      Accept
                    </Button>
                    <Button
                      startIcon={<UndoIcon />}
                      onClick={handleUndoCriteria}
                      size="small"
                    >
                      Undo
                    </Button>
                  </>
                ) : isLlmAvailable ? (
                  <Button
                    startIcon={isCriteriaSuggesting ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
                    onClick={handleSuggestCriteria}
                    disabled={isCriteriaSuggesting || !formData.name || !formData.description}
                    size="small"
                  >
                    Suggest
                  </Button>
                ) : null}
              </Box>
            </Box>
            <Box sx={{ p: 3, position: 'relative' }}>
              {isCriteriaSuggesting && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CircularProgress />
                </Box>
              )}
              <Grid container spacing={2}>
                {Object.entries(CRITERIA_FIELDS).map(([field, config]) => (
                  <Grid item xs={12} md={6} key={field}>
                    {config.type === 'array' ? (
                      <Autocomplete
                        multiple
                        options={config.options || []}
                        value={formData.criteria[field] || []}
                        onChange={(_, newValue) => {
                          // For status field, ensure values are numbers
                          const processedValue = field === 'status' 
                            ? newValue.map(v => typeof v === 'object' ? v.value : v)
                            : newValue;
                          handleCriteriaChange(field, processedValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={field.charAt(0).toUpperCase() + field.slice(1)}
                            helperText={config.description}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            {typeof option === 'object' ? option.label : option}
                          </li>
                        )}
                        getOptionLabel={(option) => {
                          if (typeof option === 'object') return option.label;
                          if (field === 'status') {
                            const statusOption = STATUS_OPTIONS.find(opt => opt.value === option);
                            return statusOption ? statusOption.label : option.toString();
                          }
                          return option;
                        }}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData.criteria[field] || ''}
                        onChange={(e) => handleCriteriaChange(field, e.target.value)}
                        helperText={
                          !validateRegex(formData.criteria[field])
                            ? 'Invalid regex pattern'
                            : config.description
                        }
                        error={!validateRegex(formData.criteria[field])}
                        InputProps={{
                          startAdornment: config.type === 'regex' && (
                            <InputAdornment position="start">/</InputAdornment>
                          ),
                          endAdornment: config.type === 'regex' && (
                            <InputAdornment position="end">/</InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Script Editor */}
        <Grid item xs={12}>
          <Paper sx={{ boxShadow: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'grey.50',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">Policy Script</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {showScriptActions ? (
                  <>
                    <Button
                      startIcon={<CheckIcon />}
                      onClick={handleAcceptScript}
                      size="small"
                      color="success"
                    >
                      Accept
                    </Button>
                    <Button
                      startIcon={<UndoIcon />}
                      onClick={handleUndoScript}
                      size="small"
                    >
                      Undo
                    </Button>
                  </>
                ) : isLlmAvailable ? (
                  <Button
                    startIcon={isScriptSuggesting ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
                    onClick={handleSuggestScript}
                    disabled={isScriptSuggesting || !formData.name || !formData.description}
                    size="small"
                  >
                    Suggest
                  </Button>
                ) : null}
              </Box>
            </Box>
            <Box sx={{ p: 3, position: 'relative' }}>
              {isScriptSuggesting && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CircularProgress />
                </Box>
              )}
              <Editor
                height="400px"
                defaultLanguage="javascript"
                value={formData.scriptJs}
                onChange={(value) => setFormData(prev => ({ ...prev, scriptJs: value }))}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  extraLibs: [CONTEXT_DEFINITION]
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </form>
  );
};

export default PolicyForm;

