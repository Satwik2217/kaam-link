import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, IndianRupee } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { useAuth } from '@/hooks/useAuth';

const BookWorkerModal = ({ worker, onClose, onSuccess }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">
            Book {worker.userId?.fullName || 'Worker'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 capitalize">{worker.primarySkill.replace('_', ' ')}</p>
              <p className="font-semibold text-gray-900">Base Rate: ₹{worker.wageRate.amount} / {worker.wageRate.unit.replace('per_', '')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Estimated Total</p>
              <p className="text-xl font-bold text-primary">₹{totalAmount}</p>
            </div>
          </div>

          <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Provide details about the job..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="scheduledStartDate"
                    value={formData.scheduledStartDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field pl-9"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="scheduledEndDate"
                    value={formData.scheduledEndDate}
                    onChange={handleChange}
                    min={formData.scheduledStartDate || new Date().toISOString().split('T')[0]}
                    className="input-field pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Address</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="input-field pl-9"
                    placeholder="Full address where the service is needed"
                    required
                  />
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
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
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="one_time">One Time</option>
                  <option value="recurring_daily">Recurring Daily</option>
                  <option value="recurring_weekly">Recurring Weekly</option>
                  <option value="contractual">Contractual</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-border bg-gray-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="booking-form"
            disabled={isLoading}
            className="btn-primary flex-1 sm:flex-none"
          >
            {isLoading ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookWorkerModal;
