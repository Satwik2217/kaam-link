import React from 'react';
import { CalendarDays, MapPin, User } from 'lucide-react';

const BookingCard = ({ booking }) => {
  const worker = booking?.workerProfileId;
  const workerUser = booking?.workerId;
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          {booking?.jobTitle || 'Job Booking'}
        </h3>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
          {booking?.status?.replaceAll('_', ' ') || 'pending'}
        </span>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5">
          <User size={13} />
          <span>{workerUser?.fullName || 'Worker'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays size={13} />
          <span>
            {booking?.scheduledStartDate
              ? new Date(booking.scheduledStartDate).toLocaleDateString()
              : 'Start'}{' '}
            -{' '}
            {booking?.scheduledEndDate
              ? new Date(booking.scheduledEndDate).toLocaleDateString()
              : 'End'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={13} />
          <span>{booking?.jobLocation?.city || 'City'}</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border mt-2 text-xs">
        <p className="font-semibold text-gray-900">
          ₹{booking?.totalAmount || '—'}
        </p>
        <p className="text-muted-foreground capitalize">
          {worker?.primarySkill?.replace('_', ' ') || 'Skill'}
        </p>
      </div>
    </div>
  );
};

export default BookingCard;

