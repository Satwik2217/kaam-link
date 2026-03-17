import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-8">
        Terms of Service
      </h1>
      <div className="prose prose-blue max-w-none text-gray-700">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using KaamLink, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our service.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. User Accounts</h2>
        <p className="mb-4">
          You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Platform Services</h2>
        <p className="mb-4">
          KaamLink provides an online platform connecting local workers with individuals seeking services (employers). We do not directly employ the workers, nor do we guarantee the quality of services provided.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Payments and Fees</h2>
        <p className="mb-4">
          Employers agree to pay the agreed-upon amount for services rendered. KaamLink may charge a platform fee for facilitating the transaction. All fees are clearly displayed before a booking is confirmed.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Conduct</h2>
        <p className="mb-4">
          Users agree to treat each other with respect and professionalism. Any form of harassment, discrimination, or illegal behavior will result in immediate account termination.
        </p>
      </div>
    </div>
  );
};

export default Terms;
