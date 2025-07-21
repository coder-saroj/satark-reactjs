import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './HazardCharts.css';
import { Link } from 'react-router-dom';

// Mock data for demonstration
const rainfallData = [120, 80, 90, 100, 70, 60, 110];
const heatwaveData = [38, 40, 41, 39, 42, 43, 40];
const coldwaveData = [12, 10, 9, 11, 8, 7, 10];
const humidityData = [85, 80, 78, 90, 88, 82, 79];
const categories = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
});

const alertCards = [
  {
    type: 'Rainfall',
    value: '0 mm',
    level: 'No Alert',
    color: '#3498db',
    icon: 'fas fa-cloud-showers-heavy',
    description: 'No rainfall alert in any block or municipality.'
  },
  {
    type: 'Heatwave',
    value: '0 blocks, 0 municipalities',
    level: 'No Alert',
    color: '#e67e22',
    icon: 'fas fa-temperature-high',
    description: 'No heatwave alert in Odisha.'
  },
  {
    type: 'Coldwave',
    value: '0 blocks, 0 municipalities',
    level: 'No Alert',
    color: '#2980b9',
    icon: 'fas fa-snowflake',
    description: 'No coldwave alert in Odisha.'
  },
  {
    type: 'Humidity',
    value: '76%',
    level: 'Normal',
    color: '#16a085',
    icon: 'fas fa-tint',
    description: 'Humidity levels are within normal range (Bhubaneswar).'
  },
  {
    type: 'Cyclone',
    value: 'No active cyclone',
    level: 'Normal',
    color: '#6c3483',
    icon: 'fas fa-wind',
    description: 'No cyclonic storm is currently active in the Bay of Bengal or Arabian Sea.'
  },
  {
    type: 'Flood',
    value: 'No active flood',
    level: 'Normal',
    color: '#2980b9',
    icon: 'fas fa-water',
    description: 'No flood alert for any station or reservoir.'
  },
  {
    type: 'Earthquake',
    value: 'No significant earthquake',
    level: 'Normal',
    color: '#8e44ad',
    icon: 'fas fa-house-crack',
    description: 'No significant earthquake reported in the region.'
  }
];

const chartConfigs = [
  {
    title: 'Rainfall Forecast (mm)',
    color: '#3498db',
    data: rainfallData,
    yAxisTitle: 'Rainfall (mm)',
    type: 'column',
  },
  {
    title: 'Heatwave Forecast (°C)',
    color: '#e67e22',
    data: heatwaveData,
    yAxisTitle: 'Temperature (°C)',
    type: 'line',
  },
  {
    title: 'Coldwave Forecast (°C)',
    color: '#2980b9',
    data: coldwaveData,
    yAxisTitle: 'Temperature (°C)',
    type: 'line',
  }
];

const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson';

const HazardCharts = () => {
  const [eqPoints, setEqPoints] = useState([]);
  const [minMag, setMinMag] = useState(4.5);

  useEffect(() => {
    fetch(USGS_URL)
      .then(res => res.json())
      .then(data => {
        setEqPoints(data.features.map(f => ({
          id: f.id,
          mag: f.properties.mag,
          place: f.properties.place,
          time: f.properties.time,
          coords: [f.geometry.coordinates[1], f.geometry.coordinates[0]], // [lat, lng]
        })));
      });
  }, []);

  // Filtered points by minMag
  const filteredEqPoints = eqPoints.filter(eq => eq.mag >= minMag);

  return (
    <div style={{ padding: '18px', background: '#f8f9fa' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Hazard Forecast Dashboard</h2>
      {/* Alert Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginBottom: 32 }}>
        {alertCards.map(card => {
          const isRainfall = card.type === 'Rainfall';
          const CardContent = (
            <>
              {/* Shaded background icon */}
              <i className={`alert-icon-bg ${card.icon}`} style={{
                position: 'absolute',
                right: 10,
                top: 10,
                fontSize: 72,
                color: 'rgba(255,255,255,0.18)',
                zIndex: 0,
                pointerEvents: 'none',
              }}></i>
              {/* Card content */}
              <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{card.type}</div>
                <div style={{ fontSize: 16, margin: '4px 0' }}>{card.value}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{card.level}</div>
                <div style={{ fontSize: 13 }}>{card.description}</div>
              </div>
            </>
          );
          return isRainfall ? (
            <Link to="/alerts/rainfall" key={card.type} style={{ textDecoration: 'none' }}>
              <div className="alert-card" style={{ background: card.color, color: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: 20, minWidth: 220, maxWidth: 260, flex: '1 1 220px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                {CardContent}
              </div>
            </Link>
          ) : (
            <div key={card.type} className="alert-card" style={{ background: card.color, color: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', padding: 20, minWidth: 220, maxWidth: 260, flex: '1 1 220px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
              {CardContent}
            </div>
          );
        })}
      </div>
      {/* Charts at the top */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '32px', justifyContent: 'center', alignItems: 'stretch', marginBottom: 40 }}>
        {chartConfigs.map((cfg, idx) => (
          <div key={cfg.title} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 16, minWidth: 320, maxWidth: 400, width: 350, flex: '1 1 350px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: { type: cfg.type, height: 280 },
                title: { text: cfg.title, style: { fontSize: '1.1rem' } },
                xAxis: { categories },
                yAxis: { title: { text: cfg.yAxisTitle } },
                series: [{
                  name: cfg.title,
                  data: cfg.data,
                  color: cfg.color,
                  fillOpacity: 0.2,
                }],
                credits: { enabled: false },
                legend: { enabled: false },
                tooltip: { valueSuffix: cfg.type === 'column' ? ' mm' : cfg.type === 'area' ? '' : '°C' },
              }}
            />
          </div>
        ))}
      </div>
      {/* Earthquake map section below, 40% width */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }}>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 16, minWidth: 320, maxWidth: 600, width: '40%', height: 370, position: 'relative' }}>
          <h5 style={{ textAlign: 'center', marginBottom: 8 }}>Recent Earthquakes (USGS, M3+)</h5>
          <div style={{ position: 'relative', width: '100%', height: 250 }}>
            {/* Magnitude filter slider overlay */}
            <div style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 1000,
              background: 'rgba(255,255,255,0.85)',
              borderRadius: 8,
              boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
            }}>
              <label htmlFor="mag-slider" style={{ marginRight: 8, fontWeight: 500, fontSize: 13 }}>Min Mag:</label>
              <input
                id="mag-slider"
                type="range"
                min={3}
                max={8}
                step={0.1}
                value={minMag}
                onChange={e => setMinMag(Number(e.target.value))}
                style={{ width: 80 }}
              />
              <span style={{ marginLeft: 8, fontWeight: 600, fontSize: 13 }}>{minMag.toFixed(1)}</span>
            </div>
            {/* Magnitude color legend overlay */}
            <div style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              zIndex: 1000,
              background: 'rgba(255,255,255,0.85)',
              borderRadius: 8,
              boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
              padding: '8px 14px',
              fontSize: 13,
              lineHeight: 1.7,
              minWidth: 120
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: '#27ae60', marginRight: 6, border: '1px solid #aaa' }}></span>
                3.0–3.9
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: '#f1c40f', marginRight: 6, border: '1px solid #aaa' }}></span>
                4.0–4.9
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: '#e67e22', marginRight: 6, border: '1px solid #aaa' }}></span>
                5.0–5.9
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: '#c0392b', marginRight: 6, border: '1px solid #aaa' }}></span>
                6.0–6.9
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: '#8e44ad', marginRight: 6, border: '1px solid #aaa' }}></span>
                7.0+
              </div>
            </div>
            <MapContainer center={[20.9517, 85.0985]} zoom={6} style={{ height: 250, width: '100%' }} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredEqPoints.map(eq => {
                let color = '#27ae60'; // green for 3-3.9
                if (eq.mag >= 4 && eq.mag < 5) color = '#f1c40f'; // yellow
                else if (eq.mag >= 5 && eq.mag < 6) color = '#e67e22'; // orange
                else if (eq.mag >= 6 && eq.mag < 7) color = '#c0392b'; // red
                else if (eq.mag >= 7) color = '#8e44ad'; // purple
                return (
                  <CircleMarker
                    key={eq.id}
                    center={eq.coords}
                    radius={Math.max(4, eq.mag * 2)}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}
                  >
                    <Popup>
                      <div>
                        <strong>Magnitude:</strong> {eq.mag}<br />
                        <strong>Location:</strong> {eq.place}<br />
                        <strong>Date:</strong> {new Date(eq.time).toLocaleString('en-IN')}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HazardCharts; 