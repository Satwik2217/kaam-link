import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../hooks/useAuth';
import { MapPin, Briefcase, Clock, Map, CheckCircle2, XCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import axiosInstance from '@/api/axiosInstance';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

const EmployerIcon = L.divIcon({
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
  className: 'employer-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const RealTimeJobNotification = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const [incomingJob, setIncomingJob] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !user || user.role !== 'worker') return;

    const handleNewBooking = (data) => {
      console.log('Incoming job request:', data);
      setIsAccepted(false);
      setIncomingJob(data);
      // Play sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch(e) {}
    };

    socket.on('new_booking_request', handleNewBooking);

    return () => {
      socket.off('new_booking_request', handleNewBooking);
    };
  }, [socket, user]);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await axiosInstance.patch(`/bookings/${incomingJob.bookingId}/status`, {
        status: 'accepted'
      });
      setIsAccepted(true);
      setTimeout(() => {
        setIncomingJob(null);
        navigate('/worker/my-bookings');
      }, 3000);
    } catch (error) {
      console.error('Error accepting job:', error);
      alert('Failed to accept the job. It may have been cancelled or already taken.');
      setIncomingJob(null);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    try {
      await axiosInstance.patch(`/bookings/${incomingJob.bookingId}/status`, {
        status: 'rejected'
      });
    } catch (error) {
      console.error('Error rejecting job:', error);
    }
    setIncomingJob(null);
  };

  if (!incomingJob) return null;

  const lat = incomingJob.jobLocation?.coordinates?.coordinates?.[1] || 0;
  const lng = incomingJob.jobLocation?.coordinates?.coordinates?.[0] || 0;
  const addressStr = incomingJob.jobLocation?.address || 'Unknown Address';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden transform animate-slide-up relative">
        {/* Glow Effects */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
        
        {isAccepted ? (
          <div className="p-12 text-center animate-fade-in">
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Job Accepted!</h2>
            <p className="text-gray-600">The employer has been notified. Redirecting to your bookings...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-100/50 bg-primary-900 text-white relative overflow-hidden">
               <div className="absolute inset-0 opacity-20">
                 <div className="absolute -top-24 -right-24 w-48 h-48 bg-white rounded-full blur-3xl"/>
               </div>
               <div className="relative z-10 flex items-center justify-between">
                 <div>
                   <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wider uppercase mb-2">
                     New Job Alert
                   </span>
                   <h2 className="text-2xl font-bold mb-1">{incomingJob.jobTitle}</h2>
                   <p className="text-primary-100 flex items-center gap-2">
                     <MapPin className="w-4 h-4" /> 
                     {incomingJob.employerName} is calling you
                   </p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm text-primary-200">Total Payout</p>
                   <p className="text-3xl font-bold text-accent-400">₹{incomingJob.totalAmount}</p>
                 </div>
               </div>
            </div>

            {/* Map Section */}
            <div className="h-48 w-full relative bg-gray-100">
              {lat && lng ? (
                <MapContainer center={[lat, lng]} zoom={15} zoomControl={false} dragging={false} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Circle center={[lat, lng]} radius={200} pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.1, weight: 2 }} />
                  <Marker position={[lat, lng]} icon={EmployerIcon} />
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                   <Map className="w-8 h-8 mb-2 mx-auto" />
                   <p>Map Unavailable</p>
                </div>
              )}
               {/* Fade overlay for bottom of map */}
               <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-white to-transparent z-[1000]"/>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
               <div className="space-y-3">
                 <div className="flex items-start gap-3">
                   <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                   <div>
                     <p className="text-sm font-medium text-gray-900">Location</p>
                     <p className="text-sm text-gray-600">{addressStr}</p>
                   </div>
                 </div>
                 {incomingJob.jobDescription && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Task Details</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{incomingJob.jobDescription}</p>
                      </div>
                    </div>
                 )}
               </div>

               {/* Action Buttons */}
               <div className="grid grid-cols-2 gap-4 pt-4 mt-6 border-t border-gray-100">
                 <button
                   onClick={handleReject}
                   disabled={isAccepting}
                   className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                 >
                   <XCircle className="w-5 h-5" />
                   Decline
                 </button>
                 <button
                   onClick={handleAccept}
                   disabled={isAccepting}
                   className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50 active:scale-95"
                 >
                   {isAccepting ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                     <>
                       <CheckCircle2 className="w-5 h-5" />
                       Accept Job
                     </>
                   )}
                 </button>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RealTimeJobNotification;
