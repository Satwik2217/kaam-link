import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ShieldCheck, Clock, Users, Star, StarHalf, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { icon: '🧹', name: 'Maid', path: '/find-workers?skill=maid' },
  { icon: '🍳', name: 'Cook', path: '/find-workers?skill=cook' },
  { icon: '🚗', name: 'Driver', path: '/find-workers?skill=driver' },
  { icon: '🔧', name: 'Plumber', path: '/find-workers?skill=plumber' },
  { icon: '⚡', name: 'Electrician', path: '/find-workers?skill=electrician' },
  { icon: '🧓', name: 'Elder Care', path: '/find-workers?skill=elder_care' },
  { icon: '👶', name: 'Babysitter', path: '/find-workers?skill=babysitter' },
  { icon: '🛠️', name: 'More...', path: '/find-workers' },
];

const LandingPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 drop-shadow-sm">
              {t('hero.title') || "Reliable Help for Your Home"}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed font-light">
              {t('hero.subtitle') || "Connect directly with verified maids, cooks, drivers, and more. No middlemen, no hidden fees."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/find-workers" 
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transform hover:-translate-y-1 transition-all duration-300 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center w-full sm:w-auto"
              >
                {t('hero.ctaHire') || "Hire a Worker"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                to="/signup?role=worker" 
                className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 shadow-sm transform hover:-translate-y-1 transition-all duration-300 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center w-full sm:w-auto"
              >
                {t('hero.ctaJoin') || "Join as Worker"}
                <Briefcase className="ml-2 w-5 h-5 text-gray-400" />
              </Link>
            </div>
            
            <div className="mt-12 flex justify-center items-center gap-x-8 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-1.5 backdrop-blur-sm bg-white/40 px-3 py-1.5 rounded-full border border-gray-200/60">
                <ShieldCheck className="text-green-500 w-4 h-4" /> KYC Verified
              </div>
              <div className="flex items-center gap-1.5 backdrop-blur-sm bg-white/40 px-3 py-1.5 rounded-full border border-gray-200/60">
                <Users className="text-blue-500 w-4 h-4" /> 10k+ Workers
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What do you need help with?</h2>
            <p className="text-gray-500">Browse professionals across top categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                to={cat.path}
                className="group p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all duration-200 bg-gray-50 hover:bg-white"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                <span className="font-semibold text-gray-700 group-hover:text-primary">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('nav.howItWorks')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Three simple steps to find your perfect match.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold mb-6">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Search & Compare</h3>
              <p className="text-gray-600">Browse verified worker profiles, read authentic reviews, and compare transparent wage rates.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center text-xl font-bold mb-6">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Book Instantly</h3>
              <p className="text-gray-600">Select your preferred worker and time slot. No agency fees or hidden commission deductions.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-xl font-bold mb-6">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get the job done</h3>
              <p className="text-gray-600">The worker arrives securely via our tracking system. Pay them directly after satisfactory work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why KaamLink / Trust & Safety */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose KaamLink?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1"><ShieldCheck className="w-6 h-6 text-green-500" /></div>
                  <div>
                    <h4 className="font-bold text-gray-900">Background Checked</h4>
                    <p className="text-gray-600 text-sm mt-1">Every worker must pass a thorough KYC verification process linking their Aadhaar before accepting jobs.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1"><Briefcase className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h4 className="font-bold text-gray-900">Direct Connections, Zero Commissions</h4>
                    <p className="text-gray-600 text-sm mt-1">Pay 100% of the wage directly to the worker. We don't take a cut from their hard-earned money.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1"><Clock className="w-6 h-6 text-orange-500" /></div>
                  <div>
                    <h4 className="font-bold text-gray-900">In-App SOS & Safety Tracking</h4>
                    <p className="text-gray-600 text-sm mt-1">Integrated women-first safety features, one-click SOS button, and location status during active jobs.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What people say</h3>
              <div className="space-y-4">
                 <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-50">
                    <div className="flex text-yellow-400 mb-2"><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/></div>
                    <p className="text-gray-700 italic text-sm">"Found a reliable cook in 10 minutes. The direct payment system gave me peace of mind knowing all money goes to her."</p>
                    <p className="text-xs font-semibold text-gray-500 mt-3">— Priya S., Bangalore</p>
                 </div>
                 <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-50">
                    <div className="flex text-yellow-400 mb-2"><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><Star size={16} fill="currentColor"/><StarHalf size={16} fill="currentColor"/></div>
                    <p className="text-gray-700 italic text-sm">"Being a worker on KaamLink is great. I get jobs nearby and I'm not giving 20% to an agency anymore."</p>
                    <p className="text-xs font-semibold text-gray-500 mt-3">— Ramesh K., Driver</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to simplify your life?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-white hover:bg-gray-50 text-primary font-bold py-3 px-8 rounded-lg shadow-lg">
              Sign Up Now
            </Link>
            <Link to="/find-workers" className="bg-primary-dark hover:bg-black/20 text-white font-bold py-3 px-8 rounded-lg border border-white/20">
              Browse Workers First
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
