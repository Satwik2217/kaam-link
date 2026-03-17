import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-8">
        Privacy Policy
      </h1>
      <div className="prose prose-blue max-w-none text-gray-700">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
        <p className="mb-4">
          We collect information you provide directly to us, such as your name, phone number, location, and payment details. For workers, we also collect professional details, skills, and verification documents.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to operate our platform, match workers with employers, process payments, and improve our services. We also use it to maintain trust and safety on our platform.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
        <p className="mb-4">
          We share necessary information between employers and workers to facilitate bookings. For example, your name and approximate location will be shared when a booking request is made.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
        <p className="mb-4">
          We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
        <p className="mb-4">
          You have the right to access, correct, or delete your personal information. You can manage your information through your account settings or by contacting our support team.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
