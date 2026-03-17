import React from 'react';

export const SkeletonCard = () => (
  <div className="card-glass p-6 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-secondary-200 rounded-full" />
      <div className="flex-1 space-y-3">
        <div className="skeleton-line w-3/4 h-4" />
        <div className="skeleton-line w-1/2 h-3" />
        <div className="skeleton-line w-full h-3" />
      </div>
    </div>
  </div>
);

export const SkeletonWorkerCard = () => (
  <div className="card-glass p-6 animate-pulse">
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-secondary-200 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-line w-1/2 h-4" />
          <div className="skeleton-line w-1/3 h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton-line w-full h-3" />
        <div className="skeleton-line w-3/4 h-3" />
      </div>
      <div className="flex items-center justify-between">
        <div className="skeleton-line w-1/4 h-3" />
        <div className="skeleton-line w-1/3 h-3" />
      </div>
    </div>
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="card-glass p-6 animate-pulse">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-secondary-200 rounded-xl" />
          <div className="skeleton-line w-1/2 h-6" />
          <div className="skeleton-line w-3/4 h-4" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonChart = () => (
  <div className="card-glass p-6 animate-pulse">
    <div className="space-y-4">
      <div className="skeleton-line w-1/3 h-6" />
      <div className="flex items-end justify-between h-32 gap-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-1 skeleton h-full rounded-t-lg" />
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonActivity = () => (
  <div className="card-glass p-6 animate-pulse">
    <div className="space-y-4">
      <div className="skeleton-line w-1/3 h-6" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg">
            <div className="w-8 h-8 bg-secondary-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-line w-1/2 h-3" />
              <div className="skeleton-line w-3/4 h-3" />
              <div className="skeleton-line w-1/4 h-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction,
  illustration = 'default' 
}) => {
  const illustrations = {
    default: (
      <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon className="w-12 h-12 text-secondary-400" />
      </div>
    ),
    search: (
      <div className="w-32 h-32 bg-gradient-to-br from-secondary-100 to-secondary-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <Icon className="w-16 h-16 text-secondary-300" />
      </div>
    ),
    success: (
      <div className="w-24 h-24 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon className="w-12 h-12 text-success-500" />
      </div>
    )
  };

  return (
    <div className="text-center py-12 px-6">
      {illustrations[illustration] || illustrations.default}
      <h3 className="text-xl font-semibold text-secondary-900 mb-3">{title}</h3>
      <p className="text-secondary-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn-primary shadow-glow"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const EmptyStateWorkers = () => (
  <EmptyState
    icon={() => (
      <svg className="w-12 h-12 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )}
    title="No Workers Found"
    description="We couldn't find any workers matching your criteria. Try adjusting your filters or search terms."
    actionText="Clear Filters"
    onAction={() => window.location.reload()}
    illustration="search"
  />
);

export const EmptyStateBookings = () => (
  <EmptyState
    icon={() => (
      <svg className="w-12 h-12 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )}
    title="No Bookings Yet"
    description="You don't have any bookings yet. Complete your profile and start accepting jobs to see them here."
    actionText="Complete Profile"
    onAction={() => window.location.href = '/worker/profile-setup'}
    illustration="default"
  />
);

export const EmptyStateSearch = ({ query }) => (
  <EmptyState
    icon={() => (
      <svg className="w-12 h-12 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )}
    title={`No results for "${query}"`}
    description="Try searching with different keywords or browse all categories."
    illustration="search"
  />
);

export default {
  SkeletonCard,
  SkeletonWorkerCard,
  SkeletonStats,
  SkeletonChart,
  SkeletonActivity,
  EmptyState,
  EmptyStateWorkers,
  EmptyStateBookings,
  EmptyStateSearch
};
