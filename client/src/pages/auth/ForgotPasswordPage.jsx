import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-primary" />
        </div>
        
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">
          Password Reset Coming Soon
        </h1>
        
        <p className="text-gray-600 mb-8">
          The password reset functionality is currently under development. If you are unable to access your account, please contact support for assistance.
        </p>
        
        <Link 
          to="/login"
          className="btn-primary inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
