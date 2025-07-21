import React from 'react';
import { Grid, Container, Typography,Box } from '@mui/material';
import AlertCard from './AlertCard';

const CurrentAlerts = ({ alerts }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 1, mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
        Current Alerts
      </Typography>

        <Box sx={{ px: 0, mx: 0 }}>
            <Grid container spacing={2} sx={{ margin: 0, width: '100%' }}>
                {alerts.map((alert) => (
                <Grid item xs={12} sm={6} md={4} key={alert.id}>
                    <AlertCard alert={alert} />
                </Grid>
                ))}
            </Grid>
        </Box>

    </Container>
  );
};

export default CurrentAlerts;
