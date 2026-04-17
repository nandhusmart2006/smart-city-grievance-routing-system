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

// Custom SVG pin icons for Critical (red) and Nominal (blue)
function createPinIcon(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
        <defs>
            <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.4"/>
            </filter>
        </defs>
        <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" 
              fill="${color}" filter="url(#shadow)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
        <circle cx="14" cy="14" r="6" fill="rgba(255,255,255,0.9)"/>
    </svg>`;
    
    return L.divIcon({
        html: svg,
        className: 'custom-pin-icon',
        iconSize: [28, 40],
        iconAnchor: [14, 40],
        popupAnchor: [0, -40],
    });
}

const criticalIcon = createPinIcon('#ef4444');
const nominalIcon = createPinIcon('#6366f1');

export default function LiveMap({ complaints }) {
    // Tamil Nadu geographic center
    const center = [11.1271, 78.6569];
    const tnBounds = [[8.0, 76.0], [13.6, 80.5]];

    return (
        <div className="w-full h-full min-h-[400px]">
            <MapContainer 
                center={center} 
                zoom={7} 
                scrollWheelZoom={true} 
                maxBounds={tnBounds}
                maxBoundsViscosity={1.0}
                minZoom={7}
                maxZoom={18}
                style={{ height: '100%', width: '100%', background: '#020617' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {complaints.filter(c => c.location).map((complaint) => {
                    const [lat, lng] = complaint.location.split(',').map(Number);
                    const isHighPriority = complaint.priority_score >= 8 || complaint.sla_risk;
                    
                    if (isNaN(lat) || isNaN(lng)) return null;

                    return (
                        <Marker
                            key={complaint.ticket_id}
                            position={[lat, lng]}
                            icon={isHighPriority ? criticalIcon : nominalIcon}
                        >
                            <Popup>
                                <div className="bg-slate-950 text-slate-100 p-4 rounded-2xl border border-white/10 shadow-2xl min-w-[200px]">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Incident Pulse</p>
                                            <p className="text-xl font-black italic tracking-tighter text-white">{complaint.ticket_id}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${isHighPriority ? 'bg-rose-500/20 text-rose-500 border border-rose-500/20' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'}`}>
                                            {isHighPriority ? 'Critical' : 'Nominal'}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                                            "{(complaint.normalized_text || complaint.text || '').substring(0, 60)}..."
                                        </p>
                                        
                                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500 border-t border-white/5 pt-3">
                                            <div className="flex flex-col">
                                                <span className="text-[7px] text-slate-600">Department</span>
                                                <span className="text-indigo-400">{complaint.department}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[7px] text-slate-600">Area</span>
                                                <span className="text-white">{complaint.area || 'N/A'}</span>
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
