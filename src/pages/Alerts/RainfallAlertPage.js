import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { MapContainer, TileLayer, GeoJSON, Pane, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const alertColors = {
    NA: '#9df00fff',      // No Alert (0-22 mm)
    moderate: '#EEDB00', // Moderate (22-43 mm)
    heavy: '#FFA500',    // Heavy (43-88 mm)
    extreme: '#B22222',  // Extreme (88+ mm)
};

// Mock alert data for districts (use new levels)
const districtAlerts = {
    Khorda: 'moderate',
    Bhubaneswar: 'NA',
    Cuttack: 'heavy',
    Puri: 'moderate',
    Balasore: 'extreme',
};

// Mock alert data for blocks (use new levels)
const blockAlerts = {
    'angul': 'moderate',
    'puri': 'NA',
    'ganjam': 'heavy',
    'mayurbhanj': 'moderate',
    'sambalpur': 'extreme',
    'bhadrak': 'moderate',
    'jajpur': 'moderate',
    'jharsuguda': 'moderate',
    'kalahandi': 'moderate',
    'kandhamal': 'moderate',
    'koraput': 'moderate',
    'malkangiri': 'moderate',
    'balianta': 'moderate',
    // Add more normalized block names as needed
};

// Mock 10-day forecast data
const getForecast = (name) => Array.from({ length: 10 }, (_, i) => ({ date: `${21 + i}-Jul`, value: Math.round(Math.random() * 50) }));

// Mock data for previous month district rainfall
const prevMonthDistrictRainfall = [
    { district: 'Khorda', rainfall: 320 },
    { district: 'Cuttack', rainfall: 280 },
    { district: 'Puri', rainfall: 210 },
    { district: 'Balasore', rainfall: 400 },
    { district: 'Mayurbhanj', rainfall: 350 },
    { district: 'Ganjam', rainfall: 180 },
    { district: 'Sambalpur', rainfall: 260 },
];

// Mock data for state rainfall (current year)
const stateRainfall = [
    { year: '2022', rainfall: 1200 },
    { year: '2023', rainfall: 1350 },
    { year: '2024', rainfall: 1100 },
];

// Mock data for block rainfall (previous month) for selected district
const getBlockRainfall = (district) => [
    { block: 'Block A', rainfall: 120 },
    { block: 'Block B', rainfall: 90 },
    { block: 'Block C', rainfall: 150 },
    { block: 'Block D', rainfall: 80 },
];

// Helper to fit map to block geojson
const FitToBlockGeojson = ({ geojson }) => {
    const map = useMap();
    useEffect(() => {
        if (!geojson) return;
        const layer = L.geoJSON(geojson);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [geojson, map]);
    return null;
};

const RainfallAlertPage = () => {
    const [geojson, setGeojson] = useState(null);
    const [blockGeojson, setBlockGeojson] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState('Khordha');
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [blockColors, setBlockColors] = useState({});

    useEffect(() => {
        fetch('/geojson/odisha_districts.geojson')
            .then(res => res.json())
            .then(data => {
                setGeojson(data);
                // Set default district id for Khordha using 'id' property
                const khordhaFeature = data.features.find(f => normalize(f.properties.district_name) === 'khordha');
                if (khordhaFeature) setSelectedDistrictId(khordhaFeature.properties.id);
            });
    }, []);

    // Update selectedDistrictId whenever selectedDistrict or geojson changes
    useEffect(() => {
        if (!geojson || !selectedDistrict) return;
        const feature = geojson.features.find(
            f => normalize(f.properties.district_name) === normalize(selectedDistrict)
        );
        if (feature) setSelectedDistrictId(feature.properties.id);
    }, [geojson, selectedDistrict]);

    // Debug: log selected district and id
    console.log('selectedDistrict:', selectedDistrict, 'selectedDistrictId:', selectedDistrictId);

    // Load block shape file for selected district id
    useEffect(() => {
        if (!selectedDistrictId) return;
        const districtFile = `/geojson/Odisha_block/Odisha_block_id${selectedDistrictId}.geojson`;
        let isCurrent = true;
        console.log('Trying to load:', districtFile, 'for district id:', selectedDistrictId);
        fetch(districtFile)
            .then(res => {
                console.log('Fetch status:', res.status);
                return res.json();
            })
            .then(data => {
                if (!isCurrent) return;
                console.log('Loaded block geojson:', data);
                if (!data || !data.features || data.features.length === 0) {
                    console.log('Block geojson is empty or invalid');
                } else {
                    console.log('First block feature:', data.features[0]);
                }
                setBlockGeojson(data);
                // Assign random color codes for blocks
                const colors = {};
                data.features.forEach(f => {
                    const blockName = normalize(f.properties.block_name);
                    colors[blockName] = getRandomColor();
                });
                setBlockColors(colors);
            })
            .catch((e) => {
                if (isCurrent) setBlockGeojson(null);
                console.log('Failed to load block geojson:', e);
            });
        return () => { isCurrent = false; };
    }, [selectedDistrictId]);

    // Helper to get a random color
    function getRandomColor() {
        const colors = ['#9bef0bff', '#EEDB00', '#FFA500', '#B22222'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Style function for districts
    const styleDistrict = feature => {
        const name = feature.properties.district_name;
        const alert = districtAlerts[name] || 'NA';
        return {
            fillColor: alertColors[alert],
            color: '#333',         // Darker border for contrast
            weight: 1,
            fillOpacity: 1,
            opacity: 1,
        };        
    };

    // When a district is clicked, update selectedDistrict, selectedDistrictId, and reset selectedBlock
    const onEachDistrict = (feature, layer) => {
        const name = feature.properties.district_name;
        const id = feature.properties.id;
        layer.on({
            click: () => {
                setSelectedBlock(null);  // clear block
                // fetch the geojson for the selected district first
                const districtFile = `/geojson/Odisha_block/Odisha_block_id${id}.geojson`;
                console.log('Loading block data for:', name, 'from', districtFile);
                fetch(districtFile)
                    .then(res => res.json())
                    .then(data => {
                        setBlockGeojson(data);
                        const colors = {};
                        data.features.forEach(f => {
                            const blockName = normalize(f.properties.block_name);
                            colors[blockName] = getRandomColor();
                        });
                        setBlockColors(colors);
                        
                        // only update district state *after* geojson is loaded
                        setSelectedDistrict(name);
                        setSelectedDistrictId(id);
                    })
                    .catch(e => {
                        console.error('Failed to load block geojson:', e);
                        setBlockGeojson(null);
                        setSelectedDistrict(name);
                        setSelectedDistrictId(id);
                    });
            }
        });
        layer.bindTooltip(name, { sticky: true });
    };    

    // Style for blocks: color blocks of selected district, others gray
    const normalize = (name) => name ? name.trim().toLowerCase() : '';
    const styleBlock = feature => {
        const blockName = normalize(feature.properties.block_name);
        const color = blockColors[blockName] || '#c8e6c9';
        return {
            fillColor: color,
            weight: 1,
            opacity: 1,
            color: blockName === selectedBlock ? '#222' : '#888',
            fillOpacity: 1,
            dashArray: blockName === selectedBlock ? '4' : undefined,
        };
    };

    // When a block is clicked, update selectedBlock
    const onEachBlock = (feature, layer) => {
        const blockName = feature.properties.block_name;
        layer.bindTooltip(blockName, { sticky: true });
        layer.on({
            click: () => setSelectedBlock(blockName)
        });
    };
    const FitToBlockGeojson = ({ geojson }) => {
        const map = useMap();
    
        useEffect(() => {
            if (!geojson) return;
    
            const layer = L.geoJSON(geojson);
            const bounds = layer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [20, 20] });
            }
        }, [geojson, map]);
    
        return null;
    };
    
    return (
        <div style={{ padding: 24 }}>
            <h2>Rainfall Alert</h2>
            {/* Top row: District and Block maps side by side */}
            <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
                {/* District map */}
                <div style={{ minWidth: 350, maxWidth: 600, width: '50%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 16, position: 'relative' }}>
                    <h4 style={{ textAlign: 'center' }}>District Map</h4>
                    <MapContainer center={[20.18925, 84.4500]} zoom={7} style={{ height: 500, width: '100%' }} scrollWheelZoom={false}>
                        <TileLayer
                            url="https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                            subdomains={['a', 'b', 'c', 'd']}
                            maxZoom={19}
                        />
                        {/* Districts pane (drawn beneath blocks) */}
                        <Pane name="districts" style={{ zIndex: 400 }}>
                            {geojson && (
                            <GeoJSON
                                key={selectedDistrict}
                                data={geojson}
                                style={styleDistrict}
                                onEachFeature={onEachDistrict}
                                pane="districts"
                            />
                            )}
                        </Pane>
                    </MapContainer>
                    {/* Dot-style legend overlay on map (bottom right) */}
                    <div style={{
                        position: 'absolute',
                        right: 18,
                        bottom: 18,
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: 8,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        padding: '8px 12px',
                        fontSize: 13,
                        color: '#222',
                        zIndex: 1000,
                        display: 'flex',
                        gap: 16,
                        alignItems: 'center',
                        flexWrap: 'wrap' // for small screen responsiveness
                    }}>
                        {Object.entries(alertColors).map(([level, color]) => (
                            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    background: color,
                                    border: '1px solid #aaa',
                                }}></span>
                                <span style={{ whiteSpace: 'nowrap' }}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)} {/* Capitalize */}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
                {/* Block map */}
                <div style={{ minWidth: 350, maxWidth: 600, width: '50%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 16, position: 'relative' }}>
                    <h4 style={{ textAlign: 'center' }}>Block Map ({selectedDistrict})</h4>
                    <MapContainer center={[20.18925, 84.4500]} zoom={7} style={{ height: 500, width: '100%', background: '#fff', borderRadius: 8 }} scrollWheelZoom={false}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    <FitToBlockGeojson geojson={blockGeojson} />
                        <Pane name="blocks" style={{ zIndex: 500 }}>
                            {blockGeojson && (
                            <GeoJSON
                                key={selectedDistrictId || Math.random()} // force re-render when district changes
                                data={blockGeojson}
                                style={styleBlock}
                                onEachFeature={onEachBlock}
                            />
                            )}
                        </Pane>
                    </MapContainer>
                    {/* Dot-style legend overlay on map (bottom right) */}
                    <div style={{
                        position: 'absolute',
                        right: 18,
                        bottom: 18,
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: 8,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        padding: '8px 12px',
                        fontSize: 13,
                        color: '#222',
                        zIndex: 1000,
                        display: 'flex',
                        gap: 16,
                        alignItems: 'center',
                        flexWrap: 'wrap' // for small screen responsiveness
                    }}>
                        {Object.entries(alertColors).map(([level, color]) => (
                            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    background: color,
                                    border: '1px solid #aaa',
                                }}></span>
                                <span style={{ whiteSpace: 'nowrap' }}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)} {/* Capitalize */}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            {/* Bottom row: District and Block charts */}
            <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
                {/* District chart */}
                <div style={{ flex: 1, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 16, minWidth: 320 }}>
                    <h4>District Rainfall Forecast ({selectedDistrict})</h4>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={{
                            chart: { type: 'line', height: 220 },
                            title: { text: '' },
                            xAxis: { categories: getForecast(selectedDistrict).map(d => d.date) },
                            yAxis: { title: { text: 'Rainfall (mm)' } },
                            series: [{ name: 'Rainfall', data: getForecast(selectedDistrict).map(d => d.value), color: '#3498db' }],
                            credits: { enabled: false },
                            legend: { enabled: false },
                            tooltip: { valueSuffix: ' mm' },
                        }}
                    />
                </div>
                {/* Block chart */}
                <div style={{ flex: 1, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 16, minWidth: 320 }}>
                    <h4>Block Rainfall Forecast ({selectedBlock || 'Select a block'})</h4>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={{
                            chart: { type: 'line', height: 220 },
                            title: { text: '' },
                            xAxis: { categories: getForecast(selectedBlock || 'Block A').map(d => d.date) },
                            yAxis: { title: { text: 'Rainfall (mm)' } },
                            series: [{ name: 'Rainfall', data: getForecast(selectedBlock || 'Block A').map(d => d.value), color: '#16a085' }],
                            credits: { enabled: false },
                            legend: { enabled: false },
                            tooltip: { valueSuffix: ' mm' },
                        }}
                    />
                </div>
            </div>
            {/* District Rainfall (Previous Month), State Rainfall, Block Rainfall charts in a row */}
            <div style={{ display: 'flex', gap: 32, marginTop: 40, justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
                {/* District Rainfall (Previous Month) bar chart */}
                <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, minWidth: 260, flex: '1 1 0', width: '100%' }}>
                    <h4 style={{ textAlign: 'center' }}>District Rainfall (Previous Month)</h4>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={{
                            chart: { type: 'column', height: 220 },
                            title: { text: '' },
                            xAxis: { categories: prevMonthDistrictRainfall.map(d => d.district) },
                            yAxis: { title: { text: 'Rainfall (mm)' } },
                            series: [{ name: 'Rainfall', data: prevMonthDistrictRainfall.map(d => d.rainfall), color: '#3498db' }],
                            credits: { enabled: false },
                            legend: { enabled: false },
                            tooltip: { valueSuffix: ' mm' },
                        }}
                    />
                    {/* Data table for district rainfall */}
                    <table style={{ width: '100%', marginTop: 8, fontSize: 13, borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f8f8' }}>
                                <th style={{ padding: 4, border: '1px solid #eee' }}>District</th>
                                <th style={{ padding: 4, border: '1px solid #eee' }}>Rainfall (mm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prevMonthDistrictRainfall.map(row => (
                                <tr key={row.district}>
                                    <td style={{ padding: 4, border: '1px solid #eee' }}>{row.district}</td>
                                    <td style={{ padding: 4, border: '1px solid #eee' }}>{row.rainfall}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* State Rainfall (Current Year) bar chart */}
                <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, minWidth: 220, flex: '1 1 0', width: '100%' }}>
                    <h4 style={{ textAlign: 'center' }}>State Rainfall (Current Year)</h4>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={{
                            chart: { type: 'column', height: 220 },
                            title: { text: '' },
                            xAxis: { categories: stateRainfall.map(d => d.year) },
                            yAxis: { title: { text: 'Rainfall (mm)' } },
                            series: [{ name: 'Rainfall', data: stateRainfall.map(d => d.rainfall), color: '#1abc9c' }],
                            credits: { enabled: false },
                            legend: { enabled: false },
                            tooltip: { valueSuffix: ' mm' },
                        }}
                    />
                    {/* Data table for state rainfall */}
                    <table style={{ width: '100%', marginTop: 8, fontSize: 13, borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f8f8' }}>
                                <th style={{ padding: 4, border: '1px solid #eee' }}>Year</th>
                                <th style={{ padding: 4, border: '1px solid #eee' }}>Rainfall (mm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stateRainfall.map(row => (
                                <tr key={row.year}>
                                    <td style={{ padding: 4, border: '1px solid #eee' }}>{row.year}</td>
                                    <td style={{ padding: 4, border: '1px solid #eee' }}>{row.rainfall}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Block Rainfall (Previous Month) bar chart */}
                <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, minWidth: 260, flex: '1 1 0', width: '100%' }}>
                    <h4 style={{ textAlign: 'center' }}>Block Rainfall (Previous Month) - {selectedDistrict}</h4>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={{
                            chart: { type: 'column', height: 220 },
                            title: { text: '' },
                            xAxis: { categories: getBlockRainfall(selectedDistrict).map(d => d.block) },
                            yAxis: { title: { text: 'Rainfall (mm)' } },
                            series: [{ name: 'Rainfall', data: getBlockRainfall(selectedDistrict).map(d => d.rainfall), color: '#e67e22' }],
                            credits: { enabled: false },
                            legend: { enabled: false },
                            tooltip: { valueSuffix: ' mm' },
                        }}
                    />
                    {/* Data table for block rainfall */}
                    <table style={{ width: '100%', marginTop: 8, fontSize: 13, borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f8f8' }}>
                                <th style={{ padding: 4, border: '1px solid #eee' }}>Block</th>
                                <th style={{ padding: 4, border: '1px solid #eee' }}>Rainfall (mm)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getBlockRainfall(selectedDistrict).map(row => (
                                <tr key={row.block}>
                                    <td style={{ padding: 4, border: '1px solid #eee' }}>{row.block}</td>
                                    <td style={{ padding: 4, border: '1px solid #eee' }}>{row.rainfall}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default RainfallAlertPage; 