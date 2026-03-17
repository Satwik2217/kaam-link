import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import WorkerCard from '@/components/worker/WorkerCard';
import CommandPalette from '@/components/common/CommandPalette';
import { Search, Filter, Users, Star, MapPin, Clock, TrendingUp } from 'lucide-react';

const SearchWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');

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
        const { data } = await axiosInstance.get('/workers');
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
  }, [selectedSkill]);

  const filteredAndSortedWorkers = useMemo(() => {
    let filtered = workers;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w => 
        w.name?.toLowerCase().includes(query) ||
        w.skills?.some(skill => skill.toLowerCase().includes(query)) ||
        w.location?.toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'experience':
          return (b.experience || 0) - (a.experience || 0);
        case 'recent':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });
  }, [workers, searchQuery, sortBy]);

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
            <div className="flex gap-3">
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
                  className="btn-outline"
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

          {/* Search Bar */}
          <div className="relative">
            <div className="card-glass p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
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
                  className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="rating">Top Rated</option>
                  <option value="experience">Most Experience</option>
                  <option value="recent">Recently Added</option>
                </select>
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
                    onClick={() => setSelectedSkill(c.key)}
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
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-secondary-900">
                  {categories.find(c => c.key === selectedSkill)?.label || 'Workers'}
                </h2>
                <span className="bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredAndSortedWorkers.length} found
                </span>
              </div>
              
              {filteredAndSortedWorkers.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-secondary-600">
                  <Star className="w-4 h-4 text-accent-500" />
                  <span>Avg. Rating: {filteredAndSortedWorkers.reduce((acc, w) => acc + (w.rating || 4.5), 0) / filteredAndSortedWorkers.length.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Workers Grid */}
            {filteredAndSortedWorkers.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedWorkers.map((w) => (
                  <WorkerCard key={w._id} worker={w} />
                ))}
              </div>
            ) : (
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
          </div>
        )}
      </div>
    </>
  );
};

export default SearchWorkers;

