import React, { useState, useEffect } from 'react';
import axiosInstance from '@/api/axiosInstance';
import BookingCard from '@/components/booking/BookingCard';
import { Link } from 'react-router-dom';

const EmployerMyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get('/bookings/my-bookings');
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      setError('Failed to load bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    // For employers confirming completion or dispute
    if (newStatus === 'completed' && !window.confirm('Are you sure the job is completed and you want to release payment?')) return;
    
    try {
      const { data } = await axiosInstance.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      if (data.success) {
        setBookings((prev) => 
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleTriggerSos = async (bookingId) => {
    if (!window.confirm('Are you sure you want to trigger SOS? This will alert our safety team immediately.')) return;
    try {
      const { data } = await axiosInstance.post(`/bookings/${bookingId}/sos`);
      if (data.success) {
        alert('SOS Triggered successfully. Help is on the way.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to trigger SOS');
    }
  };

  const activeBookings = bookings.filter(b => ['pending_worker_acceptance', 'accepted', 'in_progress', 'pending_completion_review'].includes(b.status));
  const pastBookings = bookings.filter(b => !['pending_worker_acceptance', 'accepted', 'in_progress', 'pending_completion_review'].includes(b.status));

  if (isLoading) {
    return <div className="p-12 text-center text-gray-500">Loading your bookings...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Track and manage your requested services.</p>
        </div>
        <Link to="/employer/search" className="btn-primary flex-shrink-0">
          Book a Worker
        </Link>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="text-4xl mb-4">🏠</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">It looks like you haven't booked any workers yet. Start searching to find skilled local professionals.</p>
          <Link to="/employer/search" className="btn-primary inline-flex">
            Search Workers
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Active Bookings <span className="text-sm font-normal text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">{activeBookings.length}</span>
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    userRole="employer"
                    onUpdateStatus={handleUpdateStatus}
                    onTriggerSos={handleTriggerSos}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <section className={activeBookings.length > 0 ? "pt-8 border-t border-border" : ""}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Booking History <span className="text-sm font-normal text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">{pastBookings.length}</span>
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-80 hover:opacity-100 transition-opacity">
                {pastBookings.map((booking) => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    userRole="employer"
                    onUpdateStatus={handleUpdateStatus}
                    onTriggerSos={handleTriggerSos}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployerMyBookings;
