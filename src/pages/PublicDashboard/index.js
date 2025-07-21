// PublicDashboard.js
import React from 'react';
import CurrentAlerts from '../../components/Public/CurrentAlerts';
import HazardCharts from '../../components/Hazard/HazardCharts';

const alertSample = [
  {
    type: 'heatwave',
    blocks: { severe: 0, moderate: 0, low: 0, none: 314, heatwave: 0 },
    municipalities: { severe: 0, moderate: 0, low: 0, none: 5, heatwave: 0 },
    link: 'https://example.com/heatwave',
  },
  {
    type: 'rainfall',
    blocks: { severe: 0, moderate: 0, low: 0, none: 0, rainfall: 0 },
    municipalities: { severe: 0, moderate: 0, low: 0, none: 0, rainfall: 0 },
    link: 'https://example.com/rainfall',
  },
  {
    type: 'coldwave',
    blocks: { severe: 0, moderate: 0, low: 0, none: 314, coldwave: 0 },
    municipalities: { severe: 0, moderate: 0, low: 0, none: 5, coldwave: 0 },
    link: 'https://example.com/coldwave',
  },
];

const PublicDashboard = () => {
  return (
    <div style={{ margin: 0, padding: 0 }}>
      <CurrentAlerts alerts={alertSample} />
      <HazardCharts />
    </div>
  );
};

export default PublicDashboard;
