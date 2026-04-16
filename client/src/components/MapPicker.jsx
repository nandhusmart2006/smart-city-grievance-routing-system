import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to fly map to a position
function FlyToLocation({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 15, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
}

// Fix default marker icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Tamil Nadu geographic bounds
const TN_BOUNDS = [[8.0, 76.0], [13.6, 80.5]];
const TN_CENTER = [11.1271, 78.6569]; // Geographic center of Tamil Nadu
const DEFAULT_ZOOM = 8;

// Custom blue pin icon matching the reference screenshot
const blueIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Component to handle map clicks for pin placement
function MapClickHandler({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            // Only allow pins within Tamil Nadu bounds
            if (lat >= 8.0 && lat <= 13.6 && lng >= 76.0 && lng <= 80.5) {
                onLocationSelect({ lat, lng });
            }
        },
    });
    return null;
}

// Draggable marker component
function DraggableMarker({ position, onDragEnd }) {
    const markerRef = useRef(null);

    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const { lat, lng } = marker.getLatLng();
                if (lat >= 8.0 && lat <= 13.6 && lng >= 76.0 && lng <= 80.5) {
                    onDragEnd({ lat, lng });
                }
            }
        },
    }), [onDragEnd]);

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={blueIcon}
        />
    );
}

export default function MapPicker({ onLocationChange, initialPosition }) {
    const [pinPosition, setPinPosition] = useState(initialPosition || null);
    const [locationName, setLocationName] = useState('');
    const [loading, setLoading] = useState(false);

    // Reverse geocode using Nominatim (free, no API key required)
    const reverseGeocode = useCallback(async (lat, lng) => {
        setLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            const addr = data.address || {};
            
            const locality = addr.village || addr.town || addr.city || addr.suburb || '';
            const district = addr.county || addr.state_district || '';
            const area = addr.city || addr.town || district || '';
            
            setLocationName(data.display_name || '');
            
            // Pass structured location data back to the parent form
            onLocationChange({
                lat,
                lng,
                locationString: `${lat.toFixed(6)},${lng.toFixed(6)}`,
                displayName: data.display_name || '',
                locality: locality,
                area: area,
                district: district,
                pincode: addr.postcode || '',
            });
        } catch (err) {
            console.error('Reverse geocode failed:', err);
            onLocationChange({
                lat,
                lng,
                locationString: `${lat.toFixed(6)},${lng.toFixed(6)}`,
                displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                locality: '',
                area: '',
                district: '',
                pincode: '',
            });
        } finally {
            setLoading(false);
        }
    }, [onLocationChange]);

    const handleLocationSelect = useCallback((pos) => {
        setPinPosition([pos.lat, pos.lng]);
        reverseGeocode(pos.lat, pos.lng);
    }, [reverseGeocode]);

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) return;
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setPinPosition([lat, lng]);
                reverseGeocode(lat, lng);
            },
            (err) => {
                console.error('Geolocation failed:', err);
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="space-y-3">
            {/* Header Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-slate-700">Pin Location on Map (Tamil Nadu)</span>
                </div>
                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        loading 
                            ? 'bg-indigo-100 border-indigo-300 text-indigo-600 animate-pulse' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="3" />
                        <path strokeLinecap="round" d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
                    </svg>
                    {loading ? '📡 Locating...' : '📍 Use My Location'}
                </button>
            </div>

            {/* Map Container */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: '320px' }}>
                <MapContainer
                    center={TN_CENTER}
                    zoom={DEFAULT_ZOOM}
                    scrollWheelZoom={true}
                    maxBounds={TN_BOUNDS}
                    maxBoundsViscosity={1.0}
                    minZoom={7}
                    maxZoom={18}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapClickHandler onLocationSelect={handleLocationSelect} />
                    <FlyToLocation position={pinPosition} />
                    {pinPosition && (
                        <DraggableMarker
                            position={pinPosition}
                            onDragEnd={handleLocationSelect}
                        />
                    )}
                </MapContainer>
            </div>

            {/* Resolved Location Display */}
            {locationName && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="leading-relaxed">{locationName}</span>
                </div>
            )}

            {!pinPosition && (
                <p className="text-xs text-slate-400 italic text-center py-1">
                    Click anywhere on the map to drop a pin, or use "Use My Location"
                </p>
            )}
        </div>
    );
}
