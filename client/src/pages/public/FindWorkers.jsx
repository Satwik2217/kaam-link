import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import WorkerCard from '@/components/worker/WorkerCard';
import { SkeletonWorkerCard, EmptyStateWorkers } from '@/components/common/SkeletonLoader';

const FindWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get('/workers');
        if (data.success) setWorkers(data.workers);
      } catch (error) {
        console.error('Error fetching workers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
            Find Workers Near You
          </h1>
          <p className="text-gray-600">
            Browse our community of verified local professionals.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/signup" className="btn-primary py-2 px-4 shadow-sm">
            Join as Employer
          </Link>
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
  );
};

export default FindWorkers;
