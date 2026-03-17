import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import WorkerCard from '@/components/worker/WorkerCard';
import CommandPalette from '@/components/common/CommandPalette';
import MapDiscovery from '@/components/common/MapDiscovery';
import { Search, Filter, Users, Star, MapPin, Clock, TrendingUp, Map as MapIcon, List } from 'lucide-react';

const SearchWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  // Feature: Map functionality
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const categories = useMemo(
    () => [
      { key: 'plumber', label: 'Plumbing' },
      { key: 'electrician', label: 'Electrical' },
      { key: 'maid', label: 'Cleaning / Maid' },
      { key: 'cook', label: 'Cooking' },
      { key: 'driver', label: 'Driver' },
      { key: 'carpenter', label: 'Carpentry' },
      { key: 'painter', label: 'Painting' },
      { key: 'ac_technician', label: 'AC Technician' },
      { key: 'gardener', label: 'Gardening' },
      { key: 'security_guard', label: 'Security' },
      { key: 'babysitter', label: 'Babysitter' },
      { key: 'elder_care', label: 'Elder Care' },
      { key: 'delivery', label: 'Delivery' },
      { key: 'other', label: 'Other' },
    ],
    []
  );

  useEffect(() => {
    const fetchAllWorkers = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (userLocation) {
          params.lat = userLocation.lat;
          params.lng = userLocation.lng;
        }

        const { data } = await axiosInstance.get('/workers', { params });
        if (data.success) {
          setAllWorkers(data.workers || []);
          if (selectedSkill) {
            const filtered = data.workers.filter(w => 
              w.skills?.includes(selectedSkill) || w.primarySkill === selectedSkill
            );
            setWorkers(filtered);
          }
        }
      } catch (error) {
        console.error('Error fetching workers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllWorkers();
  }, [selectedSkill, userLocation]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
        setViewMode('map');
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location. Please check your browser permissions.");
        setIsLocating(false);
      }
    );
  };

  const filteredAndSortedWorkers = useMemo(() => {
    let filtered = workers;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w => 
        w.name?.toLowerCase().includes(query) ||
        w.skills?.some(skill => skill.toLowerCase().includes(query)) ||
        w.location?.toLowerCase().includes(query) ||
        w.userId?.fullName?.toLowerCase().includes(query)
      );
    }
    
    // If we have userLocation, the backend already sorted by distance using $geoNear
    // In that case, we might want to prioritize 'distance' over 'rating' unless user specifically picked 'rating'
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0);
        case 'distance':
          if (userLocation && a.distance !== undefined && b.distance !== undefined) {
             return a.distance - b.distance;
          }
          return 0; // Fallback
        case 'experience':
          return (b.experienceYears || 0) - (a.experienceYears || 0);
        case 'recent':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });
  }, [workers, searchQuery, sortBy, userLocation]);

  return (
    <>
      <CommandPalette 
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        workers={allWorkers}
        categories={categories}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-secondary-900 mb-2">
                Find Workers
              </h1>
              <p className="text-lg text-secondary-600">
                Connect with verified professionals in your area
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGetLocation}
                disabled={isLocating}
                className="btn-outline flex items-center gap-2 border-primary-500 text-primary-600 hover:bg-primary-50"
              >
                <MapPin className="w-4 h-4" />
                {isLocating ? 'Locating...' : (userLocation ? 'Location Set' : 'Use My Location')}
              </button>
              <button
                onClick={() => setIsCommandOpen(true)}
                className="btn-primary flex items-center gap-2 shadow-glow"
              >
                <Search className="w-4 h-4" />
                Quick Search
              </button>
              {selectedSkill && (
                <button
                  type="button"
                  className="btn-outline text-destructive hover:bg-destructive-50 hover:text-destructive border-destructive"
                  onClick={() => {
                    setSelectedSkill('');
                    setWorkers([]);
                    setSearchQuery('');
                  }}
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          {/* Search Bar & View Toggles */}
          <div className="relative">
            <div className="card-glass p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, skill, or location..."
                    className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full lg:w-48 px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  {userLocation && <option value="distance">Nearest First</option>}
                  <option value="rating">Top Rated</option>
                  <option value="experience">Most Experience</option>
                  <option value="recent">Recently Added</option>
                </select>

                {/* View Toggles */}
                {selectedSkill && (
                  <div className="flex bg-secondary-100 p-1 rounded-xl w-full lg:w-auto">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-secondary-500 hover:text-secondary-700'
                      }`}
                    >
                      <List className="w-4 h-4" /> List
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        viewMode === 'map' ? 'bg-white shadow-sm text-primary-600' : 'text-secondary-500 hover:text-secondary-700'
                      }`}
                    >
                      <MapIcon className="w-4 h-4" /> Map
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {!selectedSkill ? (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-secondary-900">Choose a Category</h2>
              <p className="text-secondary-600">Select the type of worker you need</p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((c) => {
                const count = allWorkers.filter(w => 
                  w.skills?.includes(c.key) || w.primarySkill === c.key
                ).length;
                
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                        setSelectedSkill(c.key);
                        // Default to closest sorting if location enabled
                        if(userLocation) setSortBy('distance');
                    }}
                    className="card-glass p-6 text-left group hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Filter className="w-6 h-6" />
                      </div>
                      {count > 0 && (
                        <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                          {count} available
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-secondary-900 mb-1">{c.label}</h3>
                    <p className="text-sm text-secondary-600">Click to view workers</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full" />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-secondary-900">
                  {categories.find(c => c.key === selectedSkill)?.label || 'Workers'}
                </h2>
                <span className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredAndSortedWorkers.length} found
                </span>
                {userLocation && (
                    <span className="bg-success-100 text-success-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Location Enabled
                    </span>
                )}
              </div>
              
              {filteredAndSortedWorkers.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-secondary-600">
                  <Star className="w-4 h-4 text-accent-500" />
                  <span>Avg. Rating: {(filteredAndSortedWorkers.reduce((acc, w) => acc + (w.stats?.averageRating || 4.5), 0) / filteredAndSortedWorkers.length).toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Map View or List View */}
            {viewMode === 'map' && selectedSkill ? (
              <MapDiscovery 
                selectedSkill={selectedSkill}
                onWorkerSelect={(worker) => {
                  // Handle worker selection - could open modal or navigate to profile
                  console.log('Selected worker:', worker);
                }}
              />
            ) : (
              <div>
                {/* Empty State */}
                {filteredAndSortedWorkers.length === 0 && (
                  <div className="card-glass p-12 text-center">
                    <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-secondary-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                      {searchQuery ? 'No workers match your search' : 'No workers currently online'}
                    </h3>
                    <p className="text-secondary-600 mb-4">
                      {searchQuery ? 'Try adjusting your search terms' : 'Try another category or check again later'}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="btn-outline"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                )}

                {/* Worker Grid */}
                {filteredAndSortedWorkers.length > 0 && (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredAndSortedWorkers.map((worker) => (
                      <WorkerCard key={worker._id} worker={worker} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchWorkers;


