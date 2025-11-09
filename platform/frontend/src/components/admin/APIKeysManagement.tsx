import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  IconButton,
  InputAdornment,
  Chip,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ContentCopy,
  CheckCircle,
  Refresh,
  Delete,
  Add,
  Security,
  Check,
} from '@mui/icons-material';

interface APIKey {
  id: string;
  name: string;
  key: string;
  service: 'openai' | 'assemblyai' | 'elevenlabs';
  status: 'active' | 'inactive';
  lastUsed: string;
  requestsToday: number;
}

const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'OpenAI API',
    key: 'sk-proj-1234567890abcdef',
    service: 'openai',
    status: 'active',
    lastUsed: '5 minutes ago',
    requestsToday: 1247,
  },
  {
    id: '2',
    name: 'AssemblyAI API',
    key: 'aai-1234567890abcdef',
    service: 'assemblyai',
    status: 'active',
    lastUsed: '2 hours ago',
    requestsToday: 345,
  },
  {
    id: '3',
    name: 'Eleven Labs API',
    key: 'el-1234567890abcdef',
    service: 'elevenlabs',
    status: 'active',
    lastUsed: '1 hour ago',
    requestsToday: 678,
  },
];

export default function APIKeysManagement() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);

  const toggleVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const handleCopy = async (key: string, keyId: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegenerateKey = async (keyId: string) => {
    setRegeneratingKey(keyId);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a new mock key
    setApiKeys((prev) =>
      prev.map((k) =>
        k.id === keyId
          ? { ...k, key: `${k.key.split('-')[0]}-${Math.random().toString(36).substring(7)}` }
          : k
      )
    );

    setRegeneratingKey(null);
  };

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4);
  };

  const getServiceColor = (service: APIKey['service']) => {
    const colors = {
      openai: '#10a37f',
      assemblyai: '#3b82f6',
      elevenlabs: '#8b5cf6',
    };
    return colors[service];
  };

  const getServiceIcon = (service: APIKey['service']) => {
    const icons = {
      openai: '🤖',
      assemblyai: '🎤',
      elevenlabs: '🔊',
    };
    return icons[service];
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          🔑 API Keys Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          Add API Key
        </Button>
      </Box>

      {/* Security Alert */}
      <Alert severity="info" icon={<Security />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Security Notice:</strong> API keys are encrypted and stored securely. Never share
          your keys publicly.
        </Typography>
      </Alert>

      {/* API Keys Grid */}
      <Grid container spacing={3}>
        {apiKeys.map((apiKey) => (
          <Grid item xs={12} key={apiKey.id}>
            <Card
              elevation={2}
              sx={{
                border: `2px solid ${apiKey.status === 'active' ? getServiceColor(apiKey.service) : '#ccc'}`,
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Status Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -12,
                  right: 24,
                  background: apiKey.status === 'active' ? '#00d2d3' : '#95a5a6',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <CheckCircle sx={{ fontSize: 14 }} />
                {apiKey.status.toUpperCase()}
              </Box>

              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  {/* Service Info */}
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${getServiceColor(apiKey.service)}22 0%, ${getServiceColor(apiKey.service)}44 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 32,
                        }}
                      >
                        {getServiceIcon(apiKey.service)}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {apiKey.name}
                        </Typography>
                        <Chip
                          label={apiKey.service.toUpperCase()}
                          size="small"
                          sx={{
                            background: getServiceColor(apiKey.service),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>

                  {/* API Key */}
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="API Key"
                      value={visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title={visibleKeys.has(apiKey.id) ? 'Hide' : 'Show'}>
                              <IconButton
                                onClick={() => toggleVisibility(apiKey.id)}
                                edge="end"
                              >
                                {visibleKeys.has(apiKey.id) ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={copiedKey === apiKey.id ? 'Copied!' : 'Copy'}>
                              <IconButton
                                onClick={() => handleCopy(apiKey.key, apiKey.id)}
                                edge="end"
                                color={copiedKey === apiKey.id ? 'success' : 'default'}
                              >
                                {copiedKey === apiKey.id ? <CheckCircle /> : <ContentCopy />}
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontFamily: 'monospace',
                          fontSize: 14,
                        },
                      }}
                    />
                  </Grid>

                  {/* Stats */}
                  <Grid item xs={12} md={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Requests Today
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: getServiceColor(apiKey.service) }}>
                        {apiKey.requestsToday.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last used: {apiKey.lastUsed}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Actions */}
                  <Grid item xs={12} md={2}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title={regeneratingKey === apiKey.id ? 'Regenerating...' : 'Regenerate Key'}>
                        <IconButton
                          color="primary"
                          onClick={() => handleRegenerateKey(apiKey.id)}
                          disabled={regeneratingKey === apiKey.id}
                        >
                          {regeneratingKey === apiKey.id ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Refresh />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* API Configuration */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        ⚙️ API Configuration
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Rate Limiting
              </Typography>
              <TextField
                fullWidth
                label="Requests per minute"
                type="number"
                defaultValue={100}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Requests per hour"
                type="number"
                defaultValue={5000}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Advanced Settings
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable API key rotation"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Log all API requests"
              />
              <FormControlLabel control={<Switch />} label="Require API key for all endpoints" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="large" sx={{ px: 4 }}>
          Save Configuration
        </Button>
      </Box>
    </Box>
  );
}
