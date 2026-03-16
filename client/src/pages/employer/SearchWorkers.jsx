import React, { useEffect, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import WorkerCard from '@/components/worker/WorkerCard';

const SearchWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get('/workers');
        if (data.success) setWorkers(data.workers);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
        Search Workers
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Basic listing of available workers. Enhance with filters in the next milestone.
      </p>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading workers...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((w) => (
            <WorkerCard key={w._id} worker={w} />
          ))}
          {workers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No workers found yet. Once profiles are created, they will appear here.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchWorkers;

