import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import WorkerCard from '@/components/worker/WorkerCard';

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
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full md:w-12 md:h-12 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {workers.map((w) => (
            <WorkerCard key={w._id} worker={w} />
          ))}
          {workers.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No workers found yet. Check back soon!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FindWorkers;
