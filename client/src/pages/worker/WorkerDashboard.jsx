import React, { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import axiosInstance from '@/api/axiosInstance';
import { Link } from 'react-router-dom';
import SOSButton from '@/components/common/SOSButton';
import { Briefcase, Star, DollarSign, CheckCircle, ShieldCheck, AlertCircle, TrendingUp, Users, Calendar, Clock, Activity, Zap, Target } from 'lucide-react';

const WorkerDashboard = () => {
  const { user, checkAuthStatus } = useAuth();
  const { t } = useLanguage();
  const kycStatus = user?.kycStatus || 'not_submitted';
  const needsKyc = kycStatus === 'not_submitted' || kycStatus === 'rejected';

  const workerProfile = user?.workerProfile || null;
  const isProfileComplete = !!workerProfile?.isProfileComplete;
  const canGoOnline = isProfileComplete || kycStatus === 'pending_review' || kycStatus === 'verified';
  const isOnlineInitial = !!workerProfile?.isOnline;
  const [isOnline, setIsOnline] = useState(isOnlineInitial);
  const [isUpdatingOnline, setIsUpdatingOnline] = useState(false);

  // Keep derived values stable for render
  const onlineLabel = useMemo(() => {
    if (!canGoOnline) {
      return kycStatus === 'not_submitted' || kycStatus === 'rejected'
        ? 'Complete KYC to go online'
        : 'Waiting for KYC review';
    }
    return isOnline ? 'Online (visible to employers)' : 'Offline (hidden from employers)';
  }, [canGoOnline, isOnline, kycStatus]);

  const handleToggleOnline = async () => {
    if (!canGoOnline) return;
    const next = !isOnline;
    setIsOnline(next);
    setIsUpdatingOnline(true);
    try {
      await axiosInstance.put('/workers/my-profile', { isOnline: next });
      
      // If going online, update location with GPS
      if (next) {
        await updateWorkerLocation();
      }
      
      // Refresh auth state so other components see updated workerProfile flags
      await checkAuthStatus();
    } catch (e) {
      // Revert UI on failure
      setIsOnline(!next);
    } finally {
      setIsUpdatingOnline(false);
    }
  };

  const updateWorkerLocation = async () => {
    try {
      // Try to get GPS location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await axiosInstance.put('/api/v1/map/update-location', {
                lat: latitude,
                lng: longitude
              });
              console.log('Worker location updated successfully');
            } catch (error) {
              console.error('Failed to update location:', error);
              // Don't fail the online toggle if location update fails
            }
          },
          (error) => {
            console.log('GPS permission denied or unavailable, using stored location');
            // Fallback to stored address coordinates (already handled by backend)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      }
    } catch (error) {
      console.error('Location tracking error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* KYC Alert */}
      {needsKyc && (
        <div className="glass-panel p-6 border border-warning-200 bg-warning-50/80 animate-slide-up">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h4 className="font-bold text-warning-900">Complete Your KYC Verification</h4>
                <p className="text-warning-700 mt-1">
                  You must securely submit your Aadhaar and Bank Payout details before accepting jobs.
                </p>
              </div>
            </div>
            <Link to="/worker/kyc" className="btn-accent shadow-glow-accent whitespace-nowrap">
              Complete KYC Now
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-secondary-900">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Worker'}!
          </h1>
          <p className="text-lg text-secondary-600">
            Here's your professional dashboard overview
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-secondary-900">
              Status
            </p>
            <p className={`text-xs ${isProfileComplete ? 'text-success-600' : 'text-warning-600'}`}>
              {onlineLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleOnline}
            disabled={!canGoOnline || isUpdatingOnline}
            className={`relative inline-flex h-12 w-20 items-center rounded-full transition-all duration-300 ${
              isOnline && canGoOnline ? 'bg-success-500 shadow-glow' : 'bg-secondary-300'
            } ${!canGoOnline ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-pressed={isOnline}
            aria-label="Toggle online status"
            title={!canGoOnline ? (kycStatus === 'not_submitted' || kycStatus === 'rejected' ? 'Complete your KYC to go online' : 'Waiting for KYC review') : 'Toggle online'}
          >
            <span
              className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform ${
                isOnline && isProfileComplete ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
          <SOSButton />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Completed Jobs', 
            value: '12', 
            change: '+3 this week',
            icon: CheckCircle, 
            color: 'from-success-500 to-success-600',
            bgColor: 'success-50'
          },
          { 
            label: 'Average Rating', 
            value: '4.8', 
            change: '+0.2 this month',
            icon: Star, 
            color: 'from-accent-500 to-accent-600',
            bgColor: 'accent-50'
          },
          { 
            label: 'Total Earnings', 
            value: '₹24,500', 
            change: '+₹4,200 this week',
            icon: DollarSign, 
            color: 'from-primary-500 to-primary-600',
            bgColor: 'primary-50'
          },
          { 
            label: 'Verification', 
            value: user?.verificationStatus || 'Verified', 
            change: 'All documents approved',
            icon: ShieldCheck,
            color: 'from-success-500 to-success-600',
            bgColor: 'success-50'
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card-glass p-6 group hover:scale-105 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.change.startsWith('+') ? 'text-success-600' : 'text-secondary-500'
                }`}>
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-secondary-900 mb-1">{stat.value}</p>
                <p className="text-sm text-secondary-600">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-secondary-900">Earnings Overview</h3>
            <select className="text-sm bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="space-y-4">
            <div className="flex items-end justify-between h-32 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const height = [40, 65, 45, 80, 55, 90, 70][index];
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-lg transition-all duration-300 hover:from-primary-600 hover:to-primary-400"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-secondary-500">{day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <span className="text-sm text-secondary-600">Total this week</span>
              <span className="text-lg font-bold text-primary-600">₹4,200</span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-secondary-900">Recent Activity</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { icon: CheckCircle, color: 'success', title: 'Job Completed', desc: 'Cleaning service for Priya S.', time: '2 hours ago', amount: '₹800' },
              { icon: Star, color: 'accent', title: 'New Review', desc: '5-star rating from Rahul M.', time: '5 hours ago' },
              { icon: Calendar, color: 'primary', title: 'Booking Confirmed', desc: 'Cooking job tomorrow', time: '1 day ago', amount: '₹1,200' },
              { icon: Users, color: 'secondary', title: 'Profile Viewed', desc: '3 employers viewed your profile', time: '2 days ago' },
            ].map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors">
                  <div className={`w-8 h-8 bg-${activity.color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-900 text-sm">{activity.title}</p>
                    <p className="text-xs text-secondary-600 truncate">{activity.desc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-secondary-400">{activity.time}</span>
                      {activity.amount && (
                        <span className="text-xs font-semibold text-success-600">{activity.amount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-secondary-900 mb-6">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Response Rate', value: '94%', target: '90%', icon: Zap, color: 'success' },
            { label: 'On-Time Arrival', value: '98%', target: '95%', icon: Clock, color: 'success' },
            { label: 'Job Success Rate', value: '96%', target: '90%', icon: Target, color: 'success' },
          ].map((metric) => {
            const Icon = metric.icon;
            const percentage = parseInt(metric.value);
            return (
              <div key={metric.label} className="text-center space-y-3">
                <div className="relative w-20 h-20 mx-auto">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-secondary-100"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - percentage / 100)}`}
                      className="text-success-500 transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-success-600" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary-900">{metric.value}</p>
                  <p className="text-sm text-secondary-600">{metric.label}</p>
                  <p className="text-xs text-success-600">Target: {metric.target}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-glass p-6">
        <h3 className="text-xl font-bold text-secondary-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Briefcase, label: 'My Bookings', href: '/worker/my-bookings', color: 'primary' },
            { icon: Users, label: 'Edit Profile', href: '/worker/profile-setup', color: 'secondary' },
            { icon: ShieldCheck, label: 'KYC Status', href: '/worker/kyc', color: 'accent' },
            { icon: Activity, label: 'Analytics', href: '#', color: 'success' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.href}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/60 hover:bg-white/80 border border-white/20 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 bg-${action.color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${action.color}-600`} />
                </div>
                <span className="text-sm font-medium text-secondary-700">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;

