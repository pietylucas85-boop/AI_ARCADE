import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { Job, Technician, JobStatus, PriorityLevel } from '../types';
import { MOCK_FIBER_CABLES, MOCK_FIBER_NODES } from '../constants'; // Assuming these are in constants

interface MapProps {
    jobs: Job[];
    techs: Technician[];
    onJobClick: (jobId: string) => void;
    selectedJobId?: string | null;
    selectedTechId?: string | null;
}

const createCustomIcon = (color: string, isTech: boolean = false, initials?: string) => {
    return L.divIcon({
        className: 'custom-icon',
        html: `
      <div style="
        background-color: ${color};
        width: ${isTech ? '36px' : '28px'};
        height: ${isTech ? '36px' : '28px'};
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
        color: white;
        font-weight: bold;
        font-size: ${isTech ? '14px' : '12px'};
      ">
        ${initials || ''}
      </div>`,
        iconSize: isTech ? [36, 36] : [28, 28],
        iconAnchor: isTech ? [18, 18] : [14, 14],
    });
};

const getJobColor = (status: JobStatus, priority: PriorityLevel) => {
    if (status === JobStatus.COMPLETED) return '#4CAF50'; // Green
    if (status === JobStatus.IN_PROGRESS || status === JobStatus.EN_ROUTE) return '#FF9800'; // Orange
    if (status === JobStatus.DISPATCHED) return '#2196F3'; // Blue
    if (status === JobStatus.UNASSIGNED) {
        if (priority === PriorityLevel.HIGH) return '#F44336'; // Red
        if (priority === PriorityLevel.MEDIUM) return '#FFEB3B'; // Yellow
        return '#9E9E9E'; // Grey
    }
    return '#9E9E9E'; // Default Grey
};

const getTechInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
        return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
};

const MapUpdater: React.FC<{ center: L.LatLngExpression | null }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 18);
        }
    }, [center, map]);
    return null;
};

const MapVisualization: React.FC<MapProps> = ({ jobs, techs, onJobClick, selectedJobId, selectedTechId }) => {
    const defaultCenter: L.LatLngExpression = [34.0522, -118.2437]; // Los Angeles

    let focusCenter: L.LatLngExpression | null = null;
    if (selectedJobId) {
        const job = jobs.find(j => j.id === selectedJobId);
        if (job) focusCenter = [job.location.lat, job.location.lng];
    } else if (selectedTechId) {
        const tech = techs.find(t => t.id === selectedTechId);
        if (tech) focusCenter = [tech.location.lat, tech.location.lng];
    }

    return (
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} id="map-visualization">
            <MapUpdater center={focusCenter} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Fiber Cables */}
            {MOCK_FIBER_CABLES.map((cable, index) => (
                <Polyline key={`cable-${index}`} positions={cable as L.LatLngExpression[]} color="blue" weight={2} opacity={0.5} />
            ))}
            {/* Fiber Nodes */}
            {MOCK_FIBER_NODES.map(node => (
                <CircleMarker key={node.id} center={node as L.LatLngExpression} radius={5} color="blue" fillColor="white" fillOpacity={1}>
                    <Popup>{node.id}</Popup>
                </CircleMarker>
            ))}
            {/* Jobs */}
            {jobs.map(job => (
                <Marker
                    key={job.id}
                    position={[job.location.lat, job.location.lng]}
                    icon={createCustomIcon(getJobColor(job.status, job.priority))}
                    eventHandlers={{ click: () => onJobClick(job.id) }}
                >
                    <Popup>
                        <b>{job.customerName}</b><br />
                        {job.address}<br />
                        Status: {job.status}<br />
                        Priority: {job.priority}<br />
                        Tech: {job.assignedTech ? techs.find(t => t.id === job.assignedTech)?.name : 'Unassigned'}
                    </Popup>
                </Marker>
            ))}
            {/* Techs */}
            {techs.map(tech => (
                <Marker
                    key={tech.id}
                    position={[tech.location.lat, tech.location.lng]}
                    icon={createCustomIcon(tech.status === JobStatus.UNASSIGNED ? '#009688' : '#673AB7', true, getTechInitials(tech.name))}
                >
                    <Popup>
                        <b>{tech.name}</b><br />
                        Status: {tech.status}<br />
                        Current Job: {tech.currentJob || 'None'}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapVisualization;
