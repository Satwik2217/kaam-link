import React from 'react';

const Safety = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-8">
        Trust & Safety at Kaam<span className="text-primary">Link</span>
      </h1>
      
      <div className="space-y-8 text-gray-700">
        <section className="card p-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900">Verified Profiles</h2>
          <p>
            Every user on our platform is required to provide a valid phone number. We encourage users to complete their profiles with accurate information to build trust within the community.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900">Secure Payments</h2>
          <p>
            Payments are handled securely. Employers can see the agreed amount upfront, and workers are guaranteed payment upon successful completion of the job, protecting both parties.
          </p>
        </section>

        <section className="card p-6 border-l-4 border-destructive">
          <h2 className="text-xl font-bold mb-3 text-destructive">Emergency SOS Concept</h2>
          <p className="mb-4">
            Safety is our top priority. We are implementing an SOS feature for active bookings.
          </p>
          <p>
            If you ever feel unsafe during a job, you will be able to trigger an SOS alert directly from the booking details screen. This will alert our support team and optionally your emergency contacts with your current location.
          </p>
        </section>
        
        <section className="card p-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900">Reviews and Ratings</h2>
          <p>
            Our two-way review system ensures accountability. Both workers and employers can leave feedback after a job is completed, helping maintain a high-quality community.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Safety;
