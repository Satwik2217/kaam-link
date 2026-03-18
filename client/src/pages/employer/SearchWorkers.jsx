import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import WorkerCard from '@/components/worker/WorkerCard';
import CommandPalette from '@/components/common/CommandPalette';
// MapDiscovery removed
import { Search, Filter, Users, Star, MapPin, CheckCircle2, X } from 'lucide-react';

const SearchWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  
  // Feature: Booking with Address
  const [selectedWorkerToBook, setSelectedWorkerToBook] = useState(null);
  const [serviceAddress, setServiceAddress] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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
        // Map parameters removed. We fetch all verified/online workers.
        const { data } = await axiosInstance.get('/workers');
        if (data.success) {
          setAllWorkers(data.workers || []);
          if (selectedSkill) {
            const filtered = data.workers.filter(w => 
              w.skills?.includes(selectedSkill) || w.primarySkill === selectedSkill
            );
            setWorkers(filtered);
          } else {
            setWorkers(data.workers || []);
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
        w.userId?.fullName?.toLowerCase().includes(query) ||
        w.primarySkill?.toLowerCase().includes(query) ||
        w.userId?.address?.city?.toLowerCase().includes(query)
      );
    }
    
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0);
        case 'experience':
          return (b.experienceYears || 0) - (a.experienceYears || 0);
        default:
          return 0;
      }
    });
  }, [workers, searchQuery, sortBy]);

  const handleBookNow = async (e) => {
    e.preventDefault();
    if (!serviceAddress.trim()) return alert("Please enter a service address");
    
    setIsBooking(true);
    try {
      const payload = {
        workerId: selectedWorkerToBook.userId._id, // Targeting the User ID
        serviceAddress: serviceAddress,
        skill: selectedWorkerToBook.primarySkill
      };

      const { data } = await axiosInstance.post('/bookings', payload);
      if (data.success) {
        setBookingSuccess(true);
        setSelectedWorkerToBook(null);
        setServiceAddress('');
        setTimeout(() => setBookingSuccess(false), 3000);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send booking request");
    } finally {
      setIsBooking(false);
    }
  };

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
                Available Professionals
              </h1>
              <p className="text-lg text-secondary-600">
                Direct hiring. No map browsing, just fast results.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
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
                  className="btn-outline text-destructive hover:bg-destructive-50 border-destructive"
                  onClick={() => {
                    setSelectedSkill('');
                    setSearchQuery('');
                  }}
                >
                  Clear Category
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="card-glass p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, skill, or city..."
                  className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full lg:w-48 px-4 py-3 bg-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="rating">Top Rated</option>
                <option value="experience">Most Experience</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Selection or List */}
        {!selectedSkill && !searchQuery ? (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-secondary-900 text-center">What do you need help with?</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedSkill(c.key)}
                  className="card-glass p-6 text-center group hover:scale-105 transition-all"
                >
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-secondary-900">{c.label}</h3>
                </button>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-secondary-900">
                {selectedSkill ? categories.find(c => c.key === selectedSkill)?.label : 'Search Results'}
              </h2>
              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                {filteredAndSortedWorkers.length} Workers Available
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAndSortedWorkers.map((worker) => (
                <WorkerCard 
                  key={worker._id} 
                  worker={worker} 
                  onBookClick={() => setSelectedWorkerToBook(worker)} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ADDRESS INPUT MODAL --- */}
      {selectedWorkerToBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Book Professional</h2>
              <button onClick={() => setSelectedWorkerToBook(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-2xl mb-6">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedWorkerToBook.userId?.fullName?.charAt(0)}
                </div>
                <div>
                    <p className="font-bold text-gray-900">{selectedWorkerToBook.userId?.fullName}</p>
                    <p className="text-sm text-primary-600 capitalize">{selectedWorkerToBook.primarySkill}</p>
                </div>
            </div>

            <form onSubmit={handleBookNow} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Delivery Address
                </label>
                <textarea 
                  required
                  rows="4"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                  placeholder="Enter the full address where you need the service..."
                  value={serviceAddress}
                  onChange={(e) => setServiceAddress(e.target.value)}
                />
              </div>
              
              <button 
                type="submit"
                disabled={isBooking}
                className="w-full btn-primary py-4 rounded-2xl font-bold shadow-glow flex items-center justify-center gap-2"
              >
                {isBooking ? 'Sending Request...' : 'Confirm & Send Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {bookingSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up">
           <div className="bg-success-500/20 p-2 rounded-full">
             <CheckCircle2 className="w-5 h-5 text-success-500" />
           </div>
           <div>
             <p className="font-bold text-sm">Booking Request Sent!</p>
           </div>
        </div>
      )}
    </>
  );
};

export default SearchWorkers;