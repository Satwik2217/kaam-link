import React from 'react';
import { Calendar, MapPin, IndianRupee, Clock, CheckCircle, XCircle, AlertTriangle, PlayCircle } from 'lucide-react';

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
    createdAt,
  } = booking;

  // Determine the 'other party' based on current user role
  const otherParty = userRole === 'employer' ? workerId : employerId;
  const isWorker = userRole === 'worker';
  const isEmployer = userRole === 'employer';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending_worker_acceptance;

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
          <button
            onClick={() => onUpdateStatus(_id, 'in_progress')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-1"
          >
            <PlayCircle size={14} /> Start Job
          </button>
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
              onClick={() => onUpdateStatus(_id, 'completed')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-1 shadow-sm"
            >
              <CheckCircle size={14} /> Confirm Complete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
