import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ShieldCheck, Clock, Users, Star, StarHalf, Briefcase, Sparkles, Search, Calendar, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { icon: Search, name: 'Maid', path: '/find-workers?skill=maid', color: 'from-blue-500 to-cyan-500' },
  { icon: Sparkles, name: 'Cook', path: '/find-workers?skill=cook', color: 'from-orange-500 to-red-500' },
  { icon: Calendar, name: 'Driver', path: '/find-workers?skill=driver', color: 'from-green-500 to-emerald-500' },
  { icon: Zap, name: 'Plumber', path: '/find-workers?skill=plumber', color: 'from-purple-500 to-pink-500' },
  { icon: Search, name: 'Electrician', path: '/find-workers?skill=electrician', color: 'from-yellow-500 to-orange-500' },
  { icon: Users, name: 'Elder Care', path: '/find-workers?skill=elder_care', color: 'from-indigo-500 to-purple-500' },
  { icon: Sparkles, name: 'Babysitter', path: '/find-workers?skill=babysitter', color: 'from-pink-500 to-rose-500' },
  { icon: Search, name: 'More...', path: '/find-workers', color: 'from-gray-500 to-slate-500' },
];

const LandingPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.primary.200/0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,theme(colors.accent.200/0.3),transparent_50%)]" />
        
        {/* Floating glass orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary-200/40 to-accent-200/40 rounded-full backdrop-blur-3xl animate-float shadow-glass" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-accent-200/30 to-primary-200/30 rounded-full backdrop-blur-3xl animate-float animation-delay-2000 shadow-glass" />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-br from-primary-100/40 to-accent-100/40 rounded-full backdrop-blur-3xl animate-float animation-delay-4000 shadow-glass" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
            {/* Trust badges */}
            <div className="flex justify-center items-center gap-x-6 text-sm font-medium">
              <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-secondary-600">
                <ShieldCheck className="w-4 h-4 text-success-500" />
                <span>KYC Verified</span>
              </div>
              <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-secondary-600">
                <Users className="w-4 h-4 text-primary-500" />
                <span>10k+ Workers</span>
              </div>
              <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-secondary-600">
                <Star className="w-4 h-4 text-accent-500" />
                <span>4.8 Rating</span>
              </div>
            </div>
            
            {/* Main headline */}
            <div className="space-y-6">
              <h1 className="text-gradient font-display text-5xl md:text-7xl font-extrabold tracking-tight text-balance">
                {t('hero.title') || "Reliable Help for Your Home"}
              </h1>
              <p className="text-xl md:text-2xl text-secondary-600 leading-relaxed font-light max-w-3xl mx-auto text-balance">
                {t('hero.subtitle') || "Connect directly with verified maids, cooks, drivers, and more. No middlemen, no hidden fees."}
              </p>
            </div>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/find-workers" 
                className="group btn-primary text-lg px-8 py-4 flex items-center justify-center w-full sm:w-auto shadow-glow"
              >
                {t('hero.ctaHire') || "Hire a Worker"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/signup?role=worker" 
                className="group bg-white/80 backdrop-blur-md hover:bg-white text-secondary-800 border border-white/60 hover:border-secondary-200 font-bold text-lg px-8 py-4 rounded-xl shadow-glass hover:shadow-glass-hover transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
              >
                {t('hero.ctaJoin') || "Join as Worker"}
                <Briefcase className="ml-2 w-5 h-5 text-secondary-400 group-hover:text-primary-500 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-gradient-to-b from-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-secondary-900">{t('home.whatHelp')}</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">{t('home.browseCats')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={idx} 
                  to={cat.path}
                  className="group card-glass p-8 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="font-semibold text-secondary-700 group-hover:text-primary-600 transition-colors">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold text-secondary-900">{t('nav.howItWorks')}</h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">Three simple steps to find your perfect match.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-glass p-8 group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">1</div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">Search & Compare</h3>
              <p className="text-secondary-600 leading-relaxed">Browse verified worker profiles, read authentic reviews, and compare transparent wage rates.</p>
            </div>
            <div className="card-glass p-8 group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">2</div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">Book Instantly</h3>
              <p className="text-secondary-600 leading-relaxed">Select your preferred worker and time slot. No agency fees or hidden commission deductions.</p>
            </div>
            <div className="card-glass p-8 group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">3</div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">Get the job done</h3>
              <p className="text-secondary-600 leading-relaxed">The worker arrives securely via our tracking system. Pay them directly after satisfactory work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why KaamLink / Trust & Safety */}
      <section className="py-24 bg-gradient-to-b from-secondary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-secondary-900">{t('home.whyKaamlink')}</h2>
              <div className="space-y-6">
                <div className="flex gap-4 group">
                  <div className="flex-shrink-0 mt-1 w-12 h-12 bg-success-100 text-success-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary-900 text-lg">{t('home.bgChecked')}</h4>
                    <p className="text-secondary-600 mt-1 leading-relaxed">{t('home.bgDesc')}</p>
                  </div>
                </div>
                <div className="flex gap-4 group">
                  <div className="flex-shrink-0 mt-1 w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary-900 text-lg">{t('home.directMatch')}</h4>
                    <p className="text-secondary-600 mt-1 leading-relaxed">{t('home.directDesc')}</p>
                  </div>
                </div>
                <div className="flex gap-4 group">
                  <div className="flex-shrink-0 mt-1 w-12 h-12 bg-accent-100 text-accent-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary-900 text-lg">{t('home.safetyTitle')}</h4>
                    <p className="text-secondary-600 mt-1 leading-relaxed">{t('home.safetyDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-glass p-8 space-y-6">
              <h3 className="text-2xl font-bold text-secondary-900">What people say</h3>
              <div className="space-y-4">
                 <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-300">
                    <div className="flex text-accent-400 mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                    </div>
                    <p className="text-secondary-700 italic leading-relaxed">"Found a reliable cook in 10 minutes. The direct payment system gave me peace of mind knowing all money goes to her."</p>
                    <p className="text-sm font-semibold text-secondary-500 mt-4">— Priya S., Bangalore</p>
                 </div>
                 <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-300">
                    <div className="flex text-accent-400 mb-3">
                      {[...Array(4)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                      <StarHalf size={18} fill="currentColor" />
                    </div>
                    <p className="text-secondary-700 italic leading-relaxed">"Being a worker on KaamLink is great. I get jobs nearby and I'm not giving 20% to an agency anymore."</p>
                    <p className="text-sm font-semibold text-secondary-500 mt-4">— Ramesh K., Driver</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.1),transparent_50%)]" />
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full backdrop-blur-xl animate-float" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/10 rounded-full backdrop-blur-xl animate-float animation-delay-2000" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to simplify your life?</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Join thousands of happy customers and workers who trust KaamLink for reliable help.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="bg-white hover:bg-gray-50 text-primary font-bold py-4 px-8 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                Sign Up Now
              </Link>
              <Link to="/find-workers" className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300">
                Browse Workers First
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
