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
  const { user, checkAuthStatus } = useAuth(); // Use checkAuthStatus to sync state
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
    const fetchProfile = async () => {
      try {
        // Fetch current worker profile details to pre-fill form
        const { data } = await axiosInstance.get('/workers/my-profile');
        if (data.success && data.worker) {
          const w = data.worker;
          setFormData({
            primarySkill: w.primarySkill || 'maid',
            experienceYears: w.experienceYears || 0,
            wageRateAmount: w.wageRate?.amount || 500,
            wageRateUnit: w.wageRate?.unit || 'per_day',
            serviceRadius: w.serviceRadius || 10,
            languages: w.languages?.join(', ') || 'Hindi, English',
            bio: w.bio || '',
            isAvailable: w.availability?.isAvailable ?? true,
            availableTimeStart: w.availability?.availableTimeStart || '08:00',
            availableTimeEnd: w.availability?.availableTimeEnd || '20:00',
          });
        }
      } catch (error) {
        console.error("No existing profile found, starting fresh.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
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
      serviceRadius: Number(formData.serviceRadius),
      isProfileComplete: true // CRITICAL: Tell backend the onboarding is done
    };
    
    try {
      const { data } = await axiosInstance.put('/workers/my-profile', payload);
      if (data.success) {
        // Update the AuthContext so the app knows the profile is now complete
        await checkAuthStatus(); 
        
        setMessage({ type: 'success', text: 'Professional profile completed! Redirecting...' });
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
  
  if (isFetching) return <div className="p-10 text-center animate-pulse">Fetching your details...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
          Step 2: Professional Profile
        </h1>
        <p className="text-gray-600">
          Almost there! Tell us about your skills so employers can find you.
        </p>
      </div>
      
      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-8 bg-white shadow-xl rounded-2xl border border-gray-100">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-border pb-2">Professional Details</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Skill / Role</label>
              <select name="primarySkill" value={formData.primarySkill} onChange={handleChange} className="input-field capitalize" required>
                {SKILLS.map(skill => (
                  <option key={skill} value={skill}>{skill.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input type="number" name="experienceYears" min="0" value={formData.experienceYears} onChange={handleChange} className="input-field" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Professional Summary</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="input-field" placeholder="Example: I have 5 years of experience in home cooking..." />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-border pb-2">Pricing & Availability</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Wage (₹)</label>
                <input type="number" name="wageRateAmount" value={formData.wageRateAmount} onChange={handleChange} className="input-field" required />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select name="wageRateUnit" value={formData.wageRateUnit} onChange={handleChange} className="input-field">
                  <option value="per_hour">Per Hour</option>
                  <option value="per_day">Per Day</option>
                  <option value="per_month">Per Month</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius (km)</label>
              <input type="number" name="serviceRadius" value={formData.serviceRadius} onChange={handleChange} className="input-field" required />
            </div>
          </div>
        </section>
        
        <div className="pt-4 flex justify-between items-center">
          <p className="text-xs text-gray-400">Step 2 of 2: Profile Completion</p>
          <button type="submit" disabled={isLoading} className="btn-primary min-w-[180px] shadow-glow">
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkerProfileSetup;