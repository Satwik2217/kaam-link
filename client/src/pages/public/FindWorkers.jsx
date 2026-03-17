import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import WorkerCard from '@/components/worker/WorkerCard';
import CommandPalette from '@/components/common/CommandPalette';
import { SkeletonWorkerCard, EmptyStateWorkers } from '@/components/common/SkeletonLoader';
import { Search, Filter, Users, Star, MapPin, Clock, TrendingUp, Home, Car, Utensils, Wrench, Sparkles, Heart, Baby, Zap, Shield, TreePine, Palette, ThermometerSun, UserCheck, Package } from 'lucide-react';

const FindWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const categories = useMemo(
    () => [
      { key: 'plumber', label: 'Plumbing', icon: Wrench, color: 'from-blue-500 to-cyan-500', description: 'Pipe repairs, installations, maintenance' },
      { key: 'electrician', label: 'Electrical', icon: Zap, color: 'from-yellow-500 to-orange-500', description: 'Wiring, repairs, appliance installation' },
      { key: 'maid', label: 'Cleaning / Maid', icon: Home, color: 'from-green-500 to-emerald-500', description: 'Home cleaning, deep cleaning, organizing' },
      { key: 'cook', label: 'Cooking', icon: Utensils, color: 'from-orange-500 to-red-500', description: 'Daily cooking, meal preparation, catering' },
      { key: 'driver', label: 'Driver', icon: Car, color: 'from-purple-500 to-pink-500', description: 'Personal driving, delivery, transportation' },
      { key: 'carpenter', label: 'Carpentry', icon: TreePine, color: 'from-amber-500 to-yellow-500', description: 'Furniture, woodwork, repairs' },
      { key: 'painter', label: 'Painting', icon: Palette, color: 'from-pink-500 to-rose-500', description: 'House painting, wall decoration' },
      { key: 'ac_technician', label: 'AC Technician', icon: ThermometerSun, color: 'from-cyan-500 to-blue-500', description: 'AC installation, repair, maintenance' },
      { key: 'gardener', label: 'Gardening', icon: TreePine, color: 'from-green-500 to-teal-500', description: 'Lawn care, landscaping, plants' },
      { key: 'security_guard', label: 'Security', icon: Shield, color: 'from-indigo-500 to-purple-500', description: 'Security services, surveillance' },
      { key: 'babysitter', label: 'Babysitter', icon: Baby, color: 'from-pink-500 to-rose-500', description: 'Childcare, babysitting services' },
      { key: 'elder_care', label: 'Elder Care', icon: Heart, color: 'from-red-500 to-pink-500', description: 'Senior care, assistance, companionship' },
      { key: 'delivery', label: 'Delivery', icon: Package, color: 'from-blue-500 to-indigo-500', description: 'Package delivery, logistics' },
      { key: 'other', label: 'Other', icon: UserCheck, color: 'from-gray-500 to-slate-500', description: 'Other specialized services' },
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

  const handleCategoryClick = (skill) => {
    setSelectedSkill(skill);
    const filtered = allWorkers.filter(w => 
      w.skills?.includes(skill) || w.primarySkill === skill
    );
    setWorkers(filtered);
  };

  const handleClearSelection = () => {
    setSelectedSkill('');
    setWorkers([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">
          Find Workers Near You
        </h1>
        <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
          Browse our community of verified local professionals. Select a service to see available workers.
        </p>
        
        {/* Quick Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="w-full btn-ghost border border-secondary-200 hover:border-primary-300 text-left px-6 py-4 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-secondary-400" />
              <span className="text-secondary-600 group-hover:text-secondary-800">
                Quick search for workers or skills...
              </span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 text-xs bg-secondary-100 border border-secondary-200 rounded">⌘</kbd>
              <kbd className="px-2 py-1 text-xs bg-secondary-100 border border-secondary-200 rounded">K</kbd>
            </div>
          </button>
        </div>
      </div>

      {/* Categories Grid - Show when no category is selected */}
      {!selectedSkill && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-secondary-900">Choose a Service</h2>
            <div className="text-sm text-secondary-600">
              {allWorkers.length} workers available
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const workerCount = allWorkers.filter(w => 
                w.skills?.includes(category.key) || w.primarySkill === category.key
              ).length;
              
              return (
                <button
                  key={category.key}
                  onClick={() => handleCategoryClick(category.key)}
                  className="card-glass p-6 text-left group hover:scale-105 transition-all duration-300 border border-white/20"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-secondary-900 mb-2">{category.label}</h3>
                  <p className="text-sm text-secondary-600 mb-3 line-clamp-2">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                      {workerCount} workers
                    </span>
                    <span className="text-xs text-secondary-400 group-hover:text-primary-600 transition-colors">
                      View workers →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Category Results */}
      {selectedSkill && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClearSelection}
                className="btn-ghost flex items-center gap-2"
              >
                ← Back to all services
              </button>
              <div className="h-6 w-px bg-secondary-300" />
              <div>
                <h2 className="text-2xl font-bold text-secondary-900">
                  {categories.find(c => c.key === selectedSkill)?.label || selectedSkill}
                </h2>
                <p className="text-secondary-600">
                  {workers.length} workers found
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="btn-ghost text-sm"
              >
                <option value="rating">Sort by Rating</option>
                <option value="experience">Sort by Experience</option>
                <option value="recent">Sort by Recent</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <SkeletonWorkerCard key={i} />
              ))}
            </div>
          ) : workers.length === 0 ? (
            <EmptyStateWorkers />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {workers.map((w) => (
                <WorkerCard key={w._id} worker={w} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sign Up CTA */}
      <div className="card-glass p-8 text-center border border-primary-100">
        <h3 className="text-xl font-bold text-secondary-900 mb-4">
          Ready to hire workers?
        </h3>
        <p className="text-secondary-600 mb-6">
          Create an employer account to post jobs, manage bookings, and communicate with workers directly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="btn-primary shadow-glow">
            Join as Employer
          </Link>
          <Link to="/login" className="btn-ghost">
            Sign In
          </Link>
        </div>
      </div>

      {/* Command Palette */}
      {isCommandOpen && (
        <CommandPalette
          isOpen={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
          categories={categories}
          workers={allWorkers}
          onSelectCategory={handleCategoryClick}
        />
      )}
    </div>
  );
};

export default FindWorkers;
