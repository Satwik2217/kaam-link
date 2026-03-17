import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, Star, MapPin, Filter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommandPalette = ({ isOpen, onClose, workers = [], categories = [] }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filters = [
    { id: 'all', label: 'All Categories', icon: Search },
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'recent', label: 'Recently Added', icon: Clock },
    { id: 'top-rated', label: 'Top Rated', icon: Star },
  ];

  const filteredWorkers = useCallback(() => {
    let filtered = workers;

    // Apply category filter
    if (activeFilter !== 'all') {
      switch (activeFilter) {
        case 'popular':
          filtered = filtered.filter(w => w.rating >= 4.5);
          break;
        case 'recent':
          filtered = filtered.slice(0, 10);
          break;
        case 'top-rated':
          filtered = filtered.filter(w => w.rating >= 4.8);
          break;
      }
    }

    // Apply search query
    if (query) {
      const searchQuery = query.toLowerCase();
      filtered = filtered.filter(w => 
        w.name?.toLowerCase().includes(searchQuery) ||
        w.skills?.some(skill => skill.toLowerCase().includes(searchQuery)) ||
        w.location?.toLowerCase().includes(searchQuery)
      );
    }

    return filtered.slice(0, 8);
  }, [workers, activeFilter, query]);

  const filteredCategories = useCallback(() => {
    if (!query) return categories.slice(0, 6);
    
    const searchQuery = query.toLowerCase();
    return categories.filter(cat => 
      cat.label?.toLowerCase().includes(searchQuery) ||
      cat.key?.toLowerCase().includes(searchQuery)
    ).slice(0, 4);
  }, [categories, query]);

  const allResults = [
    ...filteredCategories().map(cat => ({ type: 'category', data: cat })),
    ...filteredWorkers().map(worker => ({ type: 'worker', data: worker }))
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % allResults.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev === 0 ? allResults.length - 1 : prev - 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (allResults[selectedIndex]) {
            handleSelect(allResults[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allResults]);

  const handleSelect = (result) => {
    if (result.type === 'category') {
      navigate(`/employer/search?skill=${result.data.key}`);
    } else if (result.type === 'worker') {
      navigate(`/worker/${result.data._id}`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div className="relative w-full max-w-2xl glass-panel rounded-2xl shadow-glass-hover border border-white/30 animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/20">
          <Search className="w-5 h-5 text-secondary-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workers, skills, or categories..."
            className="flex-1 bg-transparent text-secondary-900 placeholder-secondary-400 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-secondary-100 transition-colors"
          >
            <X className="w-4 h-4 text-secondary-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-4 border-b border-white/10 overflow-x-auto">
          {filters.map(filter => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === filter.id
                    ? 'bg-primary text-white shadow-glow'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {allResults.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-secondary-400" />
              </div>
              <p className="text-secondary-600 font-medium">No results found</p>
              <p className="text-secondary-400 text-sm mt-1">Try searching for different keywords</p>
            </div>
          ) : (
            <div className="py-2">
              {allResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.data._id || result.data.key}`}
                  onClick={() => handleSelect(result)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
                    index === selectedIndex 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'hover:bg-secondary-50 text-secondary-700'
                  }`}
                >
                  {result.type === 'category' ? (
                    <>
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                        <Filter className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{result.data.label}</p>
                        <p className="text-sm opacity-70">Browse {result.data.key} workers</p>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-secondary-600">
                          {result.data.name?.charAt(0) || 'W'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{result.data.name}</p>
                        <div className="flex items-center gap-2 text-sm opacity-70">
                          <MapPin className="w-3 h-3" />
                          {result.data.location || 'Location not specified'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-3 h-3 fill-current" />
                          {result.data.rating || '4.5'}
                        </div>
                        <p className="text-xs opacity-70">{result.data.experience || '2+ years'}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 text-xs text-secondary-400">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div>
            {allResults.length} result{allResults.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
