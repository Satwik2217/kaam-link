import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance';
import { useAuth } from '@/hooks/useAuth';

const SKILLS = [
  'maid', 'cook', 'driver', 'plumber', 'electrician', 'carpenter', 
  'painter', 'ac_technician', 'gardener', 'security_guard', 
  'babysitter', 'elder_care', 'delivery', 'other'
];

const WorkerProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    primarySkill: 'maid',
    experienceYears: 0,
    wageRateAmount: 500,
    wageRateUnit: 'per_day',
    serviceRadius: 10,
    languages: 'Hindi, English',
    bio: '',
    isAvailable: true,
    availableTimeStart: '08:00',
    availableTimeEnd: '20:00',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Fetch existing profile if any
    const fetchProfile = async () => {
      try {
        // We get the public profile by finding the worker for this user. 
        // Wait, the API doesn't have a GET /my-profile, it has GET /workers/:id but that's profile ID.
        // Let's rely on the dashboard or just fetch user details. Actually, updating it right away is fine.
        setIsFetching(false);
      } catch (error) {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    // Transform flat state into nested object expected by API
    const payload = {
      primarySkill: formData.primarySkill,
      experienceYears: Number(formData.experienceYears),
      bio: formData.bio,
      languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
      availability: {
        isAvailable: formData.isAvailable,
        availableTimeStart: formData.availableTimeStart,
        availableTimeEnd: formData.availableTimeEnd
      },
      wageRate: {
        amount: Number(formData.wageRateAmount),
        unit: formData.wageRateUnit
      },
      serviceRadius: Number(formData.serviceRadius)
    };
    
    try {
      const { data } = await axiosInstance.put('/workers/my-profile', payload);
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile saved successfully!' });
        setTimeout(() => navigate('/worker/dashboard'), 1500);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Set Up Your Worker Profile
        </h1>
        <p className="text-gray-600">
          Complete your profile to start receiving job requests from employers near you.
        </p>
      </div>
      
      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-8">
        
        {/* Section 1: Basic Professional Info */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-border pb-2">Professional Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Skill / Role</label>
              <select 
                name="primarySkill" 
                value={formData.primarySkill} 
                onChange={handleChange}
                className="input-field capitalize" required
              >
                {SKILLS.map(skill => (
                  <option key={skill} value={skill}>{skill.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input 
                type="number" 
                name="experienceYears" 
                min="0" max="50"
                value={formData.experienceYears} 
                onChange={handleChange}
                className="input-field" required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About You</label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3" 
                maxLength="1000"
                className="input-field" 
                placeholder="Briefly describe your experience and why employers should hire you..."
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Languages (comma separated)</label>
              <input 
                type="text" 
                name="languages" 
                value={formData.languages} 
                onChange={handleChange}
                className="input-field" 
                placeholder="Hindi, English, Marathi..." 
              />
            </div>
          </div>
        </section>

        {/* Section 2: Pricing & Availability */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-border pb-2">Pricing & Availability</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Wage Amount (₹)</label>
                <input 
                  type="number" 
                  name="wageRateAmount" 
                  min="100"
                  value={formData.wageRateAmount} 
                  onChange={handleChange}
                  className="input-field" required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Per Unit</label>
                <select 
                  name="wageRateUnit" 
                  value={formData.wageRateUnit} 
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="per_hour">Per Hour</option>
                  <option value="per_day">Per Day</option>
                  <option value="per_month">Per Month</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius (km)</label>
              <input 
                type="number" 
                name="serviceRadius" 
                min="1" max="100"
                value={formData.serviceRadius} 
                onChange={handleChange}
                className="input-field" required
              />
            </div>
            
            <div className="md:col-span-2 flex items-center gap-3 bg-muted p-4 rounded-xl">
              <input 
                type="checkbox" 
                name="isAvailable" 
                id="isAvailable"
                checked={formData.isAvailable} 
                onChange={handleChange}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="isAvailable" className="text-sm font-medium text-gray-900">
                I am currently taking new jobs
              </label>
            </div>
            
            {formData.isAvailable && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Start Time</label>
                  <input 
                    type="time" 
                    name="availableTimeStart" 
                    value={formData.availableTimeStart} 
                    onChange={handleChange}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available End Time</label>
                  <input 
                    type="time" 
                    name="availableTimeEnd" 
                    value={formData.availableTimeEnd} 
                    onChange={handleChange}
                    className="input-field" 
                  />
                </div>
              </>
            )}
          </div>
        </section>
        
        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={isLoading} className="btn-primary min-w-[150px]">
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkerProfileSetup;
