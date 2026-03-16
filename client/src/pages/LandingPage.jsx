import React from 'react';

const LandingPage = () => (
  <div className="max-w-7xl mx-auto px-4 py-20 text-center">
    <h1 className="font-display text-5xl font-bold text-gray-900 mb-4">
      India's Most Trusted <span className="text-primary">Daily Wage</span> Platform
    </h1>
    <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
      Connect directly with verified workers. No middlemen. Fair wages. Complete safety.
    </p>
    <div className="flex gap-4 justify-center">
      <a href="/signup" className="btn-primary">
        Get Started Free
      </a>
      <a href="/find-workers" className="btn-outline">
        Browse Workers
      </a>
    </div>
  </div>
);

export default LandingPage;

