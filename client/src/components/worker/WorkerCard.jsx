import React from 'react';
import { Star, MapPin, BadgeCheck } from 'lucide-react';

const WorkerCard = ({ worker }) => {
  const { userId, primarySkill, wageRate, stats } = worker || {};
  const name = userId?.fullName || 'Worker';
  const location = userId?.address?.city || 'Unknown city';
  const rating = stats?.averageRating ?? '—';
  const jobs = stats?.totalJobsCompleted ?? 0;

  return (
    <div className="card p-4 flex flex-col gap-3 hover:shadow-card-hover transition-shadow">
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
      <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
        <p className="text-sm font-semibold text-gray-900">
          ₹{wageRate?.amount || '—'}{' '}
          <span className="text-xs text-muted-foreground">
            / {wageRate?.unit?.replace('per_', '') || 'day'}
          </span>
        </p>
        <button
          type="button"
          className="text-xs font-semibold text-primary hover:text-primary-600"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default WorkerCard;

