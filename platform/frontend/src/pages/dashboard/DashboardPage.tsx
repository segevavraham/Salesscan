import { Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">This Week</Typography>
              <Typography variant="h3">12</Typography>
              <Typography color="text.secondary">Meetings</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Win Rate</Typography>
              <Typography variant="h3">68%</Typography>
              <Typography color="text.secondary">+5% vs last week</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Avg Score</Typography>
              <Typography variant="h3">8.2/10</Typography>
              <Typography color="text.secondary">Performance</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/meetings/live/new')}
                sx={{ mr: 2 }}
              >
                Start New Meeting
              </Button>
              <Button variant="outlined" onClick={() => navigate('/meetings')}>
                View All Meetings
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
