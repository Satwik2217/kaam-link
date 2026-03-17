import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, IndianRupee, Clock, ShieldCheck, Star, CheckCircle, Sparkles, Home, Car, Utensils, Wrench, Heart, Baby } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { useAuth } from '@/hooks/useAuth';

const BookWorkerModal = ({ worker, onClose, onSuccess, userLocation }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    scheduledStartDate: '',
    scheduledEndDate: '',
    address: user?.address || '',
    city: '',
    jobType: 'one_time',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  // Simple total amount calculation based on dates or fixed amount
  useEffect(() => {
    if (formData.scheduledStartDate && formData.scheduledEndDate) {
      const start = new Date(formData.scheduledStartDate);
      const end = new Date(formData.scheduledEndDate);
      // If same day, assume 1 unit. Otherwise difference in days.
      let units = 1;
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        units = worker.wageRate.unit === 'per_day' ? diffDays : 1;
      }
      setTotalAmount(worker.wageRate.amount * units);
    } else {
      setTotalAmount(worker.wageRate.amount);
    }
  }, [formData.scheduledStartDate, formData.scheduledEndDate, worker.wageRate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        workerProfileId: worker._id,
        jobTitle: formData.jobTitle,
        jobDescription: formData.jobDescription,
        skillRequired: worker.primarySkill,
        scheduledStartDate: formData.scheduledStartDate,
        scheduledEndDate: formData.scheduledEndDate,
        jobLocation: {
          address: formData.address,
          city: formData.city || 'Not specified',
          ...(userLocation && {
            coordinates: {
              type: 'Point',
              coordinates: [userLocation.lng, userLocation.lat]
            }
          })
        },
        agreedWage: worker.wageRate,
        totalAmount,
        jobType: formData.jobType,
      };

      const { data } = await axiosInstance.post('/bookings', payload);
      if (data.success) {
        onSuccess(data.booking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send booking request.');
    } finally {
      setIsLoading(false);
    }
  };

  const serviceIcons = {
    maid: { icon: Home, color: 'from-blue-500 to-cyan-500' },
    cook: { icon: Utensils, color: 'from-orange-500 to-red-500' },
    driver: { icon: Car, color: 'from-green-500 to-emerald-500' },
    plumber: { icon: Wrench, color: 'from-purple-500 to-pink-500' },
    electrician: { icon: Sparkles, color: 'from-yellow-500 to-orange-500' },
    elder_care: { icon: Heart, color: 'from-indigo-500 to-purple-500' },
    babysitter: { icon: Baby, color: 'from-pink-500 to-rose-500' },
  };

  const serviceInfo = serviceIcons[worker.primarySkill] || { icon: Home, color: 'from-gray-500 to-slate-500' };
  const ServiceIcon = serviceInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-2xl shadow-glass-hover overflow-hidden flex flex-col max-h-[90vh] animate-slide-up border border-white/20">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${serviceInfo.color} opacity-10`} />
          <div className="relative p-6 border-b border-white/20">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${serviceInfo.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  <ServiceIcon className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-secondary-900">
                    Book {worker.userId?.fullName || 'Worker'}
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-secondary-600">
                      <Star className="w-4 h-4 text-accent-500 fill-current" />
                      <span>{worker.rating || '4.8'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-secondary-600">
                      <ShieldCheck className="w-4 h-4 text-success-500" />
                      <span>Verified</span>
                    </div>
                    <div className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                      {worker.primarySkill?.replace('_', ' ') || 'Professional'}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-secondary-400 hover:text-secondary-600 rounded-xl hover:bg-white/50 transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="p-6">
          <div className="card-glass p-6 border border-primary-100">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-primary-600" />
                  <span className="text-lg font-semibold text-secondary-900">Base Rate</span>
                </div>
                <p className="text-sm text-secondary-600">
                  ₹{worker.wageRate.amount} / {worker.wageRate.unit.replace('per_', '')}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-secondary-600">Estimated Total</p>
                <p className="text-3xl font-bold text-primary">₹{totalAmount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl flex items-start gap-3">
              <X className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
              <p className="text-error-700 text-sm">{error}</p>
            </div>
          )}

          <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Job Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                Job Details
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    maxLength="200"
                    className="input-field"
                    placeholder="E.g., Deep clean 2BHK apartment"
                    required
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Job Description</label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleChange}
                    rows="3"
                    className="input-field"
                    placeholder="Provide details about the job, specific requirements, expectations..."
                  />
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                Schedule
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Start Date</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                    <input
                      type="date"
                      name="scheduledStartDate"
                      value={formData.scheduledStartDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">End Date</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                    <input
                      type="date"
                      name="scheduledEndDate"
                      value={formData.scheduledEndDate}
                      onChange={handleChange}
                      min={formData.scheduledStartDate || new Date().toISOString().split('T')[0]}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Job Type</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { value: 'one_time', label: 'One Time', icon: Clock },
                    { value: 'recurring_daily', label: 'Daily', icon: Calendar },
                    { value: 'recurring_weekly', label: 'Weekly', icon: Calendar },
                    { value: 'contractual', label: 'Contract', icon: CheckCircle },
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <label
                        key={type.value}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.jobType === type.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-secondary-200 bg-white hover:border-secondary-300 text-secondary-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="jobType"
                          value={type.value}
                          checked={formData.jobType === type.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{type.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" />
                Location
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Service Address</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3 text-secondary-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="2"
                      className="input-field pl-10"
                      placeholder="Full address where the service is needed"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="e.g. Mumbai"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Landmark (Optional)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Near famous landmark"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 bg-secondary-50/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="booking-form"
              disabled={isLoading}
              className="btn-primary flex-1 shadow-glow"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending Request...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Send Booking Request
                </div>
              )}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-secondary-500">
              By sending this request, you agree to pay the worker directly upon satisfactory completion of the job.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookWorkerModal;
