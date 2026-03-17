import React from 'react';

const HowItWorks = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">
          How Kaam<span className="text-primary">Link</span> Works
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connecting you with trusted local professionals for your everyday needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-4">For Employers</h2>
          <ol className="space-y-4 list-decimal list-inside text-gray-700">
            <li><span className="font-semibold">Search:</span> Browse our directory of verified local workers.</li>
            <li><span className="font-semibold">Review:</span> Check profiles, skills, ratings, and hourly rates.</li>
            <li><span className="font-semibold">Book:</span> Send a booking request with your job details and timing.</li>
            <li><span className="font-semibold">Confirm:</span> Wait for the worker to accept your request.</li>
            <li><span className="font-semibold">Complete:</span> Once the job is done, mark it as complete and release payment.</li>
          </ol>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-4">For Workers</h2>
          <ol className="space-y-4 list-decimal list-inside text-gray-700">
            <li><span className="font-semibold">Create Profile:</span> Setup your profile with skills, experience, and pricing.</li>
            <li><span className="font-semibold">Get Requests:</span> Receive booking requests from employers nearby.</li>
            <li><span className="font-semibold">Accept:</span> Review the job details and accept if it fits your schedule.</li>
            <li><span className="font-semibold">Work:</span> Go to the location, do the job, and update status.</li>
            <li><span className="font-semibold">Get Paid:</span> Receive payment securely once the employer confirms completion.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
