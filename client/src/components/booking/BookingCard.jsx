import React, { useState } from 'react';
import { Calendar, MapPin, IndianRupee, Clock, CheckCircle, XCircle, AlertTriangle, PlayCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import axiosInstance from '@/api/axiosInstance';

const STATUS_CONFIG = {
  pending_worker_acceptance: { label: 'Pending Acceptance', color: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  pending_completion_review: { label: 'Pending Review', color: 'bg-orange-100 text-orange-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  cancelled_by_employer: { label: 'Cancelled (Employer)', color: 'bg-red-100 text-red-800' },
  cancelled_by_worker: { label: 'Cancelled (Worker)', color: 'bg-red-100 text-red-800' },
  disputed: { label: 'Disputed', color: 'bg-red-100 text-red-800' },
};

const BookingCard = ({ booking, userRole, onUpdateStatus, onTriggerSos }) => {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' or 'digital'
  const [isCompleting, setIsCompleting] = useState(false);

  const {
    _id,
    jobTitle,
    jobDescription,
    skillRequired,
    scheduledStartDate,
    scheduledEndDate,
    jobLocation,
    totalAmount,
    status,
    employerId,
    workerId,
    startOTP, // Will only exist for employer when 'accepted'
    createdAt,
  } = booking;

  // Determine the 'other party' based on current user role
  const otherParty = userRole === 'employer' ? workerId : employerId;
  const isWorker = userRole === 'worker';
  const isEmployer = userRole === 'employer';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending_worker_acceptance;

  const handleStartWithOtp = async () => {
    if (otpValue.length !== 4) return alert("OTP must be 4 digits");
    setIsVerifyingOtp(true);
    try {
      const { data } = await axiosInstance.post(`/bookings/${_id}/start-otp`, { otp: otpValue });
      if (data.success) {
        // Optimistically update the parent state (simulate what onUpdateStatus does, or trigger a refetch)
        // Since we don't have a specific `onJobStarted` prop, we'll re-use `onUpdateStatus` but it expects
        // to call the patch endpoint. Since we already updated it on the server, we might need a workaround.
        // Easiest is to just call a reload or emit an event. Let's assume `onUpdateStatus` expects just id and status
        // and handles its own API call, which is redundant now. Best to just call window.location.reload() for simplicity constraints
        // or update it via a custom event. Let\'s try to just call fake onUpdateStatus to trigger parent state update.
        alert("Job started safely!");
        window.location.reload(); // Ensures fresh state since parent doesn't have a direct "started" handler
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleConfirmCompletion = async () => {
    setIsCompleting(true);
    // Real app might have a separate payment endpoint, but requirements say `onUpdateStatus(_id, 'completed')`
    await onUpdateStatus(_id, 'completed');
    setShowPaymentModal(false);
    setIsCompleting(false);
  };

  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow flex flex-col h-full border-l-4" style={{borderLeftColor: status === 'completed' ? '#10b981' : status === 'in_progress' ? '#8b5cf6' : '#f59e0b'}}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusConfig.color} mb-2 inline-block`}>
            {statusConfig.label}
          </span>
          <h3 className="font-bold text-gray-900 text-lg">{jobTitle}</h3>
          <p className="text-sm text-gray-500 capitalize">{skillRequired.replace('_', ' ')}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">₹{totalAmount}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4 flex-1">
        {jobDescription && <p className="mb-3 line-clamp-2">{jobDescription}</p>}
        
        {/* OTP Display for Employer */}
        {isEmployer && status === 'accepted' && startOTP && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-blue-800 font-medium text-sm">Job Start OTP:</span>
            <span className="font-mono text-xl font-bold tracking-widest text-blue-900">{startOTP}</span>
          </div>
        )}

        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <span>
              {new Date(scheduledStartDate).toLocaleDateString()}
              {scheduledStartDate !== scheduledEndDate && ` - ${new Date(scheduledEndDate).toLocaleDateString()}`}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-gray-400 mt-0.5" />
            <span className="line-clamp-1">{jobLocation?.address}, {jobLocation?.city}</span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              {otherParty?.fullName?.charAt(0) || '?'}
            </div>
            <span className="font-medium text-gray-900 text-sm">
              {isEmployer ? 'Worker: ' : 'Employer: '} {otherParty?.fullName || 'Unknown'}
            </span>
            <span className="text-xs text-gray-500 ml-auto border pl-2 pr-2 py-0.5 rounded-md">
              {otherParty?.phone || 'No phone'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-border mt-4 flex flex-wrap gap-2 justify-end">
        
        {/* SOS Button for active jobs */}
        {(status === 'in_progress' || status === 'accepted') && (
          <button
            onClick={() => onTriggerSos(_id)}
            className="px-3 py-1.5 text-xs font-bold text-white bg-destructive hover:bg-red-700 rounded-lg flex items-center gap-1 shadow-sm mr-auto"
          >
            <AlertTriangle size={14} /> SOS
          </button>
        )}

        {/* Worker Actions */}
        {isWorker && status === 'pending_worker_acceptance' && (
          <>
            <button
              onClick={() => onUpdateStatus(_id, 'rejected')}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1"
            >
              <XCircle size={14} /> Reject
            </button>
            <button
              onClick={() => onUpdateStatus(_id, 'accepted')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-600 rounded-lg flex items-center gap-1"
            >
              <CheckCircle size={14} /> Accept
            </button>
          </>
        )}
        
        {isWorker && status === 'accepted' && (
          <>
            {showOtpInput ? (
              <div className="flex items-center gap-2 w-full mt-2">
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="OTP" 
                  className="input flex-1 text-center font-mono tracking-widest text-lg py-1"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                />
                <button
                  onClick={handleStartWithOtp}
                  disabled={isVerifyingOtp || otpValue.length !== 4}
                  className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
                >
                  Verify
                </button>
                <button
                  onClick={() => setShowOtpInput(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowOtpInput(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-1"
              >
                <PlayCircle size={14} /> Start Job
              </button>
            )}
          </>
        )}
        
        {isWorker && status === 'in_progress' && (
          <button
            onClick={() => onUpdateStatus(_id, 'pending_completion_review')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-1"
          >
            <CheckCircle size={14} /> Mark Done
          </button>
        )}

        {/* Employer Actions */}
        {isEmployer && status === 'pending_worker_acceptance' && (
          <button
            onClick={() => onUpdateStatus(_id, 'cancelled_by_employer')}
            className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
          >
            <XCircle size={14} /> Cancel Request
          </button>
        )}
        
        {isEmployer && (status === 'pending_completion_review' || status === 'in_progress') && (
          <>
            <button
              onClick={() => onUpdateStatus(_id, 'disputed')}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1"
            >
              <AlertTriangle size={14} /> Dispute
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-1 shadow-sm"
            >
              <CheckCircle size={14} /> Confirm Complete
            </button>
          </>
        )}
      </div>

      {/* Employer Payment Modal (Inline Overlay) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Complete Job & Pay</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 text-center">
              <div className="font-bold text-3xl text-gray-900 mb-1">₹{totalAmount}</div>
              <p className="text-gray-500 text-sm mb-6">Total Amount Due to {otherParty?.fullName}</p>
              
              <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                <button 
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${paymentMode === 'cash' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                  onClick={() => setPaymentMode('cash')}
                >
                  Cash Route
                </button>
                <button 
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${paymentMode === 'digital' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                  onClick={() => setPaymentMode('digital')}
                >
                  Digital (UPI)
                </button>
              </div>

              {paymentMode === 'cash' ? (
                <div className="py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <IndianRupee className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-700 font-medium">Hand over cash to the worker.</p>
                  <p className="text-xs text-gray-500 mt-1">Confirm only after handing over ₹{totalAmount}</p>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                  <QRCodeSVG 
                    value={`upi://pay?pa=worker@vpa&pn=${encodeURIComponent(otherParty?.fullName || 'Worker')}&am=${totalAmount}&cu=INR`} 
                    size={160} 
                  />
                  <p className="text-xs text-gray-500 mt-4">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                disabled={isCompleting}
                onClick={handleConfirmCompletion}
                className="w-full btn-primary py-3"
              >
                {isCompleting ? 'Processing...' : paymentMode === 'cash' ? 'Confirm Cash Given' : 'Payment Done & Complete Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
