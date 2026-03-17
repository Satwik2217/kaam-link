import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import SOSButton from '@/components/common/SOSButton';
import { Briefcase, Star, DollarSign, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const kycStatus = user?.kycStatus || 'not_submitted';
  const needsKyc = kycStatus === 'not_submitted' || kycStatus === 'rejected';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {needsKyc && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Complete Your KYC Verification</h4>
              <p className="text-sm mt-0.5 opacity-90">
                You must securely submit your Aadhaar and Bank Payout details before accepting jobs.
              </p>
            </div>
          </div>
          <a href="/worker/kyc" className="btn-primary whitespace-nowrap !bg-amber-600 hover:!bg-amber-700">
            Complete KYC Now
          </a>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Namaste, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's an overview of your work activity.
          </p>
        </div>
        <SOSButton />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Jobs Completed', value: '0', icon: CheckCircle, color: 'text-success' },
          { label: 'Avg. Rating', value: '—', icon: Star, color: 'text-accent' },
          { label: 'Total Earned', value: '₹0', icon: DollarSign, color: 'text-primary' },
          {
            label: 'Verification',
            value: user?.verificationStatus || 'Unverified',
            icon: ShieldCheck,
            color: 'text-secondary',
          },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <stat.icon size={20} className={stat.color} />
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-8 text-center">
        <Briefcase size={40} className="text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-gray-700">No bookings yet</h3>
        <p className="text-sm text-gray-500 mt-1">
          Complete your profile to start receiving job requests.
        </p>
        <a href="/worker/profile-setup" className="btn-primary inline-block mt-4 text-sm">
          Complete Profile
        </a>
      </div>
    </div>
  );
};

export default WorkerDashboard;

