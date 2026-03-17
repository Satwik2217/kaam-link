import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Search, MapPin, Users, Wifi, WifiOff, Loader2, Target } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Vite/Leaflet broken icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom worker icon
const WorkerIcon = L.divIcon({
  html: `
    <div class="relative">
      <div class="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-75"></div>
      <div class="relative bg-primary-500 rounded-full w-8 h-8 flex items-center justify-center text-white shadow-lg">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  `,
  className: 'worker-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// User location icon
const UserIcon = L.divIcon({
  html: `
    <div class="relative">
      <div class="absolute inset-0 bg-accent-500 rounded-full animate-ping opacity-75"></div>
      <div class="relative bg-accent-500 rounded-full w-10 h-10 flex items-center justify-center text-white shadow-lg">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    </div>
  `,
  className: 'user-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Helper component to automatically recenter map
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 13, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

const MapDiscovery = ({ selectedSkill, onWorkerSelect }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyWorkers, setNearbyWorkers] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanRadius, setScanRadius] = useState(10); // km
  const [mapCenter, setMapCenter] = useState(null);
  const [error, setError] = useState('');
  const scanIntervalRef = useRef(null);

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Start scanning when skill is selected and we have location
  useEffect(() => {
    if (selectedSkill && userLocation && !isScanning) {
      startScanning();
    }
  }, [selectedSkill, userLocation]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setUserLocation(location);
        setMapCenter(location);
        setError('');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to get your location. Please enable location permissions.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const startScanning = async () => {
    if (!userLocation || !selectedSkill) return;

    setIsScanning(true);
    setScanProgress(0);
    setNearbyWorkers([]);
    setError('');

    // Simulate scanning progress
    scanIntervalRef.current = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanIntervalRef.current);
          return 100;
        }
        return prev + 20;
      });
    }, 600);

    try {
      const response = await axiosInstance.get('/map/nearby-workers', {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          skill: selectedSkill,
          radius: scanRadius
        }
      });

      if (response.data.success) {
        setTimeout(() => {
          setNearbyWorkers(response.data.data.workers);
          setIsScanning(false);
          clearInterval(scanIntervalRef.current);
        }, 3000); // 3-second delay for visual effect
      }
    } catch (error) {
      console.error('Error scanning for workers:', error);
      setError('Failed to scan for nearby workers. Please try again.');
      setIsScanning(false);
      clearInterval(scanIntervalRef.current);
    }
  };

  const handleWorkerClick = (worker) => {
    if (onWorkerSelect) {
      onWorkerSelect(worker);
    }
  };

  const handleRetryScan = () => {
    setScanProgress(0);
    startScanning();
  };

  if (!userLocation && !error) {
    return (
      <div className="flex items-center justify-center h-96 bg-secondary-50 rounded-2xl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-secondary-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-error-50 rounded-2xl">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-error-500 mx-auto mb-4" />
          <p className="text-error-700 mb-4">{error}</p>
          <button onClick={getUserLocation} className="btn-primary">
            Retry Location Access
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scanning Overlay */}
      {isScanning && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl">
          <div className="text-center text-white">
            <div className="relative mb-6">
              {/* Radar Pulse Animation */}
              <div className="w-32 h-32 mx-auto relative">
                <div className="absolute inset-0 border-4 border-accent-500 rounded-full animate-ping"></div>
                <div className="absolute inset-2 border-4 border-accent-400 rounded-full animate-ping animation-delay-200"></div>
                <div className="absolute inset-4 border-4 border-accent-300 rounded-full animate-ping animation-delay-400"></div>
                <div className="absolute inset-6 bg-accent-500 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">Scanning for Workers</h3>
            <p className="text-sm opacity-80 mb-4">
              Finding {selectedSkill?.replace('_', ' ')} professionals within {scanRadius}km
            </p>
            
            {/* Progress Bar */}
            <div className="w-64 bg-white/20 rounded-full h-2 mb-2">
              <div 
                className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="text-xs opacity-60">{scanProgress}% Complete</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="h-96 rounded-2xl overflow-hidden border border-secondary-200">
        <MapContainer
          center={[mapCenter?.lat || userLocation.lat, mapCenter?.lng || userLocation.lng]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <RecenterMap lat={mapCenter?.lat || userLocation.lat} lng={mapCenter?.lng || userLocation.lng} />
          
          {/* User Location Marker */}
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={UserIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Your Location</strong>
                <br />
                Searching within {scanRadius}km radius
              </div>
            </Popup>
          </Marker>

          {/* Search Radius Circle */}
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={scanRadius * 1000} // Convert km to meters
            pathOptions={{
              color: '#F97316',
              fillColor: '#F97316',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 10'
            }}
          />

          {/* Worker Markers */}
          {nearbyWorkers.map((worker) => (
            <Marker
              key={worker._id}
              position={[worker.address.coordinates.coordinates[1], worker.address.coordinates.coordinates[0]]}
              icon={WorkerIcon}
              eventHandlers={{
                click: () => handleWorkerClick(worker)
              }}
            >
              <Popup>
                <div className="text-sm p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={worker.profilePicture || `https://ui-avatars.com/api/?name=${worker.fullName}&background=4F46E5&color=fff`}
                      alt={worker.fullName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <strong>{worker.fullName}</strong>
                      <br />
                      <span className="text-xs text-secondary-600">{worker.primarySkill?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <strong>{worker.distance || 'N/A'} km</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <strong>⭐ {worker.workerProfile?.stats?.averageRating || 'N/A'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <strong>₹{worker.workerProfile?.wageRate?.amount || 'N/A'}</strong>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleWorkerClick(worker)}
                    className="btn-primary text-xs w-full mt-2"
                  >
                    View Profile
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Results Summary */}
      {!isScanning && nearbyWorkers.length > 0 && (
        <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-success-600" />
              <div>
                <p className="font-semibold text-success-900">
                  {nearbyWorkers.length} Workers Found
                </p>
                <p className="text-sm text-success-700">
                  Within {scanRadius}km of your location
                </p>
              </div>
            </div>
            <button onClick={handleRetryScan} className="btn-ghost text-sm">
              Scan Again
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {!isScanning && nearbyWorkers.length === 0 && userLocation && (
        <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-xl">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-warning-600" />
            <div>
              <p className="font-semibold text-warning-900">No Workers Found</p>
              <p className="text-sm text-warning-700">
                No {selectedSkill?.replace('_', ' ')} professionals available within {scanRadius}km
              </p>
            </div>
          </div>
          <button onClick={handleRetryScan} className="btn-ghost text-sm mt-3">
            Scan Again
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
};

export default MapDiscovery;
