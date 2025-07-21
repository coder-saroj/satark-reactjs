// components/Public/AlertCard.js
import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const ALERT_STYLES = {
  heatwave: {
    icon: '🌡️',
    label: 'Heatwave',
    color: '#f8bbd0',
  },
  rainfall: {
    icon: '🌧️',
    label: 'Rainfall',
    color: '#bbdefb',
  },
  coldwave: {
    icon: '❄️',
    label: 'Coldwave',
    color: '#b2ebf2',
  },
};

const SeverityBadge = ({ label, value, color }) => (
  <Chip
    label={`${label} ${value}`}
    size="small"
    sx={{
      backgroundColor: color,
      color: '#000',
      mr: 1,
      mb: 1,
      fontSize: 12,
      fontFamily: 'inherit',
    }}
  />
);

const AlertCard = ({ alert }) => {
  const { type, blocks, municipalities, link } = alert;
  const style = ALERT_STYLES[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ width: '100%' }}
    >
      <Card
        elevation={3}
        sx={{
          borderRadius: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#fff',
          color: '#000',
          fontFamily: 'inherit',
          transition: 'transform 0.3s, box-shadow 0.3s',
          boxShadow: 1,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, fontFamily: 'inherit' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 500, fontFamily: 'inherit' }}>
            <span style={{ fontSize: 22, marginRight: 8 }}>{style.icon}</span>
            {style.label}
          </Typography>

          <Box mt={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, fontFamily: 'inherit' }}>Blocks</Typography>
            <Box display="flex" flexWrap="wrap">
              <SeverityBadge label="Severe:" value={blocks.severe} color="#ffcdd2" />
              {type === 'rainfall' && <SeverityBadge label="Moderate:" value={blocks.moderate} color="#ffe0b2" />}
              <SeverityBadge label="Low:" value={blocks.low} color="#fff9c4" />
              <SeverityBadge label={`${style.label}:`} value={blocks[type]} color={style.color} />
              <SeverityBadge label="None:" value={blocks.none} color="#e0e0e0" />
            </Box>
          </Box>

          <Box mt={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, fontFamily: 'inherit' }}>Municipalities</Typography>
            <Box display="flex" flexWrap="wrap">
              <SeverityBadge label="Severe:" value={municipalities.severe} color="#ffcdd2" />
              {type === 'rainfall' && <SeverityBadge label="Moderate:" value={municipalities.moderate} color="#ffe0b2" />}
              <SeverityBadge label="Low:" value={municipalities.low} color="#fff9c4" />
              <SeverityBadge label={`${style.label}:`} value={municipalities[type]} color={style.color} />
              <SeverityBadge label="None:" value={municipalities.none} color="#e0e0e0" />
            </Box>
          </Box>
        </CardContent>

        <Box textAlign="center" mb={2}>
          <Button
            variant="outlined"
            href={link}
            target="_blank"
            sx={{
              textTransform: 'none',
              borderColor: '#bdbdbd',
              color: '#424242',
              fontFamily: 'inherit',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                borderColor: style.color,
              },
            }}
          >
            More Info ↗
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

export default AlertCard;
