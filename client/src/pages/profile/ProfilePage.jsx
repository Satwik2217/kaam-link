import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/api/axiosInstance';
import { User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';

const ProfilePage = () => {
  const { user, login, logout } = useAuth(); // Extract logout to handle delete session
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    gender: 'other',
    dateOfBirth: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        address: user.address || '',
        gender: user.gender || 'other',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const { data } = await axiosInstance.put('/users/profile', formData);
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Optionally update auth context if available, otherwise next fetch/login will get it
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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data } = await axiosInstance.delete('/users/profile');
      if (data.success) {
        // Close modal and call logout context to clear client session and redirect
        setIsDeleteModalOpen(false);
        await logout();
        window.location.href = '/'; // Ensure hard redirect to home
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete account',
      });
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column: Overview */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.fullName}</h2>
            <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-sm text-gray-600">
              <Phone size={14} />
              <span>{user?.phone}</span>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-primary" /> Account Status
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Verification</span>
                <span className="font-medium capitalize text-green-600">{user?.verificationStatus || 'Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Member Since</span>
                <span className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column: Edit Form */}
        <div className="md:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Details</h2>
            
            {message.text && (
              <div className={`p-3 rounded-lg mb-6 text-sm ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input-field pl-9" 
                      required 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-9" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="date" 
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="input-field pl-9" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select 
                    name="gender" 
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                  <textarea 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3" 
                    className="input-field pl-9"
                    placeholder="Full address"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={isLoading} className="btn-primary min-w-[120px]">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Danger Zone */}
          <div className="card p-6 mt-6 border-red-100 border-2">
            <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? All of your data, including your profile, bookings, and history will be permanently erased. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium flex items-center justify-center min-w-[100px]"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
