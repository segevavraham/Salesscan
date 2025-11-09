import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Save, RestartAlt, CloudUpload, Check } from '@mui/icons-material';
import { SuccessBadge } from '../common/SuccessAnimation';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    // General
    siteName: 'Sales Coach AI',
    siteDescription: 'AI-powered sales coaching platform',
    timezone: 'UTC',
    language: 'en',

    // Features
    enableTranscription: true,
    enableAICoaching: true,
    enableAnalytics: true,
    enableTeams: true,

    // Email
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    emailFrom: 'noreply@salescoach.ai',

    // Storage
    storageType: 's3',
    maxFileSize: 100,
    retentionDays: 90,

    // Security
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,

    // AI
    defaultModel: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setShowSuccess(true);

    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          ⚙️ System Settings
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {showSuccess && <SuccessBadge message="All changes saved!" />}
          <Button variant="outlined" startIcon={<RestartAlt />} disabled={isLoading}>
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : showSuccess ? <Check /> : <Save />}
            onClick={handleSave}
            disabled={isLoading}
            sx={{
              background: showSuccess
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              minWidth: 200,
              transition: 'all 0.3s ease',
            }}
          >
            {isLoading ? 'Saving...' : showSuccess ? 'Saved!' : 'Save All Changes'}
          </Button>
        </Box>
      </Box>

      {/* Alert */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        Changes to these settings may affect system behavior. Please review carefully before saving.
      </Alert>

      {/* General Settings */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            🌐 General Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Name"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  value={settings.timezone}
                  label="Timezone"
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">Eastern Time</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                  <MenuItem value="Europe/London">London</MenuItem>
                  <MenuItem value="Asia/Jerusalem">Israel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Site Description"
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            🎯 Features
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableTranscription}
                    onChange={(e) => handleChange('enableTranscription', e.target.checked)}
                  />
                }
                label="Enable Real-time Transcription"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableAICoaching}
                    onChange={(e) => handleChange('enableAICoaching', e.target.checked)}
                  />
                }
                label="Enable AI Coaching"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableAnalytics}
                    onChange={(e) => handleChange('enableAnalytics', e.target.checked)}
                  />
                }
                label="Enable Analytics"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableTeams}
                    onChange={(e) => handleChange('enableTeams', e.target.checked)}
                  />
                }
                label="Enable Team Features"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            📧 Email Configuration
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Host"
                value={settings.smtpHost}
                onChange={(e) => handleChange('smtpHost', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                value={settings.smtpPort}
                onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SMTP Username"
                value={settings.smtpUser}
                onChange={(e) => handleChange('smtpUser', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Email"
                value={settings.emailFrom}
                onChange={(e) => handleChange('emailFrom', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Storage Settings */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            💾 Storage Configuration
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Storage Type</InputLabel>
                <Select
                  value={settings.storageType}
                  label="Storage Type"
                  onChange={(e) => handleChange('storageType', e.target.value)}
                >
                  <MenuItem value="local">Local Storage</MenuItem>
                  <MenuItem value="s3">Amazon S3</MenuItem>
                  <MenuItem value="azure">Azure Blob</MenuItem>
                  <MenuItem value="gcs">Google Cloud Storage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max File Size (MB)"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Retention Days"
                type="number"
                value={settings.retentionDays}
                onChange={(e) => handleChange('retentionDays', parseInt(e.target.value))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            🔒 Security
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.requireEmailVerification}
                    onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                  />
                }
                label="Require Email Verification"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableTwoFactor}
                    onChange={(e) => handleChange('enableTwoFactor', e.target.checked)}
                  />
                }
                label="Enable Two-Factor Authentication"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Login Attempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            🤖 AI Configuration
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Default Model</InputLabel>
                <Select
                  value={settings.defaultModel}
                  label="Default Model"
                  onChange={(e) => handleChange('defaultModel', e.target.value)}
                >
                  <MenuItem value="gpt-4">GPT-4</MenuItem>
                  <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
                  <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Tokens"
                type="number"
                value={settings.maxTokens}
                onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Temperature"
                type="number"
                inputProps={{ step: 0.1, min: 0, max: 1 }}
                value={settings.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
