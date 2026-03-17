import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Users, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {t('dashboard.employerHello').replace('{name}', user?.fullName?.split(' ')[0] || '')}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {t('dashboard.employerSub')}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('dashboard.activeBookings'), value: '0', icon: Clock },
          { label: t('dashboard.completedJobs'), value: '0', icon: CheckCircle2 },
          { label: t('dashboard.workersHired'), value: '0', icon: Users },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <stat.icon size={20} className="text-primary" />
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
        <Link
          to="/employer/search"
          className="card p-5 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
        >
          <Search size={24} className="text-primary" />
          <span className="text-sm font-semibold text-primary">Find Workers</span>
        </Link>
      </div>

      <div className="card p-8 text-center">
        <Users size={40} className="text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-gray-700">No bookings yet</h3>
        <p className="text-sm text-gray-500 mt-1">
          Search for skilled workers in your area to get started.
        </p>
        <Link to="/employer/search" className="btn-primary inline-block mt-4 text-sm">
          Search Workers
        </Link>
      </div>
    </div>
  );
};

export default EmployerDashboard;

