import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom SVG pin icons for Sentinel Style
function createPinIcon(color, isCritical) {
    const pulseStyle = isCritical ? `
        <style>
            @keyframes pulse-pin {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.4); opacity: 0.2; }
                100% { transform: scale(1); opacity: 1; }
            }
            .pulse-circle {
                animation: pulse-pin 2s infinite ease-in-out;
                transform-origin: center;
            }
        </style>
    ` : '';

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
            ${pulseStyle}
            <defs>
                <filter id="shadow" x="-30%" y="-10%" width="160%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.6"/>
                </filter>
            </defs>
            ${isCritical ? `<circle cx="16" cy="16" r="16" fill="${color}" fill-opacity="0.1" class="pulse-circle"/>` : ''}
            <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 26 16 26s16-14 16-26C32 7.164 24.836 0 16 0z" 
                  fill="${color}" filter="url(#shadow)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <circle cx="16" cy="16" r="6" fill="rgba(255,255,255,1)"/>
        </svg>`;
    
    return L.divIcon({
        html: svg,
        className: 'custom-pin-icon',
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
    });
}

const criticalIcon = createPinIcon('#f43f5e', true); // Rose 500
const nominalIcon = createPinIcon('#38bdf8', false); // Sky 400

export default function LiveMap({ complaints }) {
    const center = [11.1271, 78.6569];
    const tnBounds = [[8.0, 76.0], [13.6, 80.5]];

    return (
        <div className="w-full h-full min-h-[400px] relative overflow-hidden">
            <style>
                {`
                    .leaflet-container {
                        background: #020617 !important;
                    }
                    .leaflet-popup-content-wrapper {
                        background: transparent !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                    }
                    .leaflet-popup-tip {
                        display: none !important;
                    }
                    .leaflet-tile-pane {
                        filter: brightness(0.6) saturate(1.2) contrast(1.1) grayscale(0.2);
                    }
                `}
            </style>
            
            <MapContainer 
                center={center} 
                zoom={7} 
                scrollWheelZoom={true} 
                maxBounds={tnBounds}
                maxBoundsViscosity={1.0}
                minZoom={7}
                maxZoom={18}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {complaints.filter(c => c.location).map((complaint) => {
                    const coords = complaint.location.split(',').map(Number);
                    if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) return null;
                    
                    const isHighPriority = complaint.priority_score >= 8 || complaint.sla_risk;
                    
                    return (
                        <Marker
                            key={complaint.ticket_id}
                            position={coords}
                            icon={isHighPriority ? criticalIcon : nominalIcon}
                        >
                            <Popup minWidth={260}>
                                <div className="glass-card !bg-slate-950/90 !backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">Incident Node</p>
                                            <p className="text-xl font-black italic tracking-tighter text-white uppercase">{complaint.ticket_id}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest font-mono border ${
                                            isHighPriority 
                                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                                            : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                        }`}>
                                            {isHighPriority ? 'RED_ALERT' : 'NOMINAL'}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                                                "{(complaint.normalized_text || complaint.text || '').substring(0, 80)}..."
                                            </p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-[9px] font-black uppercase tracking-widest font-mono border-t border-white/5 pt-4">
                                            <div>
                                                <span className="text-slate-600 block mb-1">Sector Branch</span>
                                                <span className="text-sky-400">{complaint.department}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600 block mb-1">MNC_Area</span>
                                                <span className="text-white truncate block">{complaint.area || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
