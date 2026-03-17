import React, { useState } from 'react';
import { Star, MapPin, BadgeCheck, CalendarPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import BookWorkerModal from '@/components/booking/BookWorkerModal';

const WorkerCard = ({ worker }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { userId, primarySkill, wageRate, stats } = worker || {};
  const name = userId?.fullName || 'Worker';
  const location = userId?.address?.city || 'Unknown city';
  const rating = stats?.averageRating ?? '—';
  const jobs = stats?.totalJobsCompleted ?? 0;

  const handleBookingSuccess = () => {
    setIsModalOpen(false);
    alert('Booking request sent successfully!'); // Can be replaced with a toast notification
  };

  return (
    <>
      <div className="card p-4 flex flex-col gap-3 hover:shadow-card-hover transition-shadow relative">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-semibold text-gray-900">{name}</h3>
              {userId?.verificationStatus === 'verified' && (
                <span className="badge-verified">
                  <BadgeCheck size={12} />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              {primarySkill?.replace('_', ' ') || 'Skilled Worker'}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-accent" />
            <span>
              {rating} <span className="text-[11px]">({jobs} jobs)</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{location}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
          <p className="text-sm font-semibold text-gray-900">
            ₹{wageRate?.amount || '—'}{' '}
            <span className="text-xs text-muted-foreground">
              / {wageRate?.unit?.replace('per_', '') || 'day'}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Profile
            </button>
            {user?.role === 'employer' && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <CalendarPlus size={14} /> Book
              </button>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <BookWorkerModal
          worker={worker}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </>
  );
};

export default WorkerCard;

