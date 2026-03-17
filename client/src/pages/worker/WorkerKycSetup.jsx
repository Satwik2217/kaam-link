import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axiosInstance';
import { CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';

const WorkerKycSetup = () => {
  const { user, login } = useAuth(); // Assuming login updates context
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [kycData, setKycData] = useState(null);
  const [error, setError] = useState('');
  
  // Form State
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const res = await api.get('/workers/my-kyc');
        setKycData(res.data.kyc);
      } catch (err) {
        console.error('Failed to fetch KYC config:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchKycStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        aadhaarNumber,
        bankAccount: {
          holderName,
          accountNumber,
          ifsc,
          upiId: upiId || undefined,
        }
      };
      
      const res = await api.put('/workers/my-kyc', payload);
      
      // Update local context manually or refetch auth/me if context provides a refresh method
      // For now, reload to sync auth state or use a refresh trigger
      window.location.reload(); 
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit KYC details. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const kycStatus = kycData?.kycStatus || user?.kycStatus || 'not_submitted';

  if (kycStatus === 'pending_review') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card text-center p-8 space-y-4">
          <Clock className="mx-auto text-accent w-16 h-16" />
          <h2 className="text-2xl font-bold text-gray-900">KYC Under Review</h2>
          <p className="text-gray-600">
            You have successfully submitted your Aadhaar and bank details. Our team is verifying them. 
            This usually takes 24-48 hours.
          </p>
          <button onClick={() => navigate('/worker/dashboard')} className="btn-secondary mt-6">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (kycStatus === 'verified') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card text-center p-8 space-y-4">
          <CheckCircle className="mx-auto text-success w-16 h-16" />
          <h2 className="text-2xl font-bold text-gray-900">KYC Verified</h2>
          <p className="text-gray-600">
            Your identity and payout details have been successfully verified. 
            Your Aadhaar ending in <strong>{kycData?.last4Aadhaar}</strong> is securely stored.
          </p>
          <button onClick={() => navigate('/worker/dashboard')} className="btn-primary mt-6">
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="card p-6 md:p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="text-primary w-8 h-8" />
          <h1 className="text-2xl font-bold text-gray-900">Complete Your KYC</h1>
        </div>
        
        <p className="text-gray-600 mb-8">
          To ensure platform safety and facilitate secure payouts, we require your Aadhaar and Bank details.
          These details are kept strictly confidential and will never be shared publicly.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {kycStatus === 'rejected' && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg mb-6 flex items-start flex-col text-sm">
             <div className="flex items-center gap-2 mb-2">
                 <AlertCircle className="w-4 h-4 text-red-600" />
                 <span className="font-semibold text-red-700">Previous KYC Submission Rejected</span>
             </div>
             <p>Reason: {kycData?.kycRejectionReason || 'Details did not match our records. Please submit again carefully.'}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity Section */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              1. Identity Verification
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="12-digit Aadhaar Number"
                  className="input-field"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  maxLength={12}
                />
              </div>
            </div>
          </div>

          {/* Bank Section */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              2. Bank Details (For Payouts)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="As per bank records"
                  className="input-field"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Bank Account Number"
                  className="input-field"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., SBIN0001234"
                  className="input-field uppercase"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="yourname@bank"
                  className="input-field"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full md:w-auto min-w-[200px]"
            >
              {loading ? 'Submitting...' : 'Submit Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerKycSetup;
