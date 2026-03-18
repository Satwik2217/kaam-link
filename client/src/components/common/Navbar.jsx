import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Briefcase,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
  Globe,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { currentLanguage, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardPath =
    user?.role === 'worker' ? '/worker/dashboard' : '/employer/dashboard';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Briefcase size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">
              Kaam<span className="text-primary">Link</span>
            </span>
          </Link>

          {/* Desktop Nav - Role Based */}
          <nav className="hidden md:flex items-center gap-6">
            {/* If NOT a worker, show Find Workers */}
            {user?.role !== 'worker' && (
              <Link
                to="/find-workers"
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              >
                {t('nav.findWorkers')}
              </Link>
            )}

            {/* If IS a worker, show Worker Specific Links */}
            {isAuthenticated && user?.role === 'worker' && (
              <>
                <Link
                  to="/worker/my-bookings"
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <ClipboardList size={14} /> My Bookings
                </Link>
                <Link
                  to="/worker/kyc"
                  className="text-sm font-medium text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <ShieldCheck size={14} /> KYC Status
                </Link>
              </>
            )}

            <Link
              to="/how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              {t('nav.howItWorks')}
            </Link>
            <Link
              to="/safety"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              {t('nav.safety')}
            </Link>
          </nav>

          {/* Auth Actions & Language */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary px-2 py-1 rounded-md transition-colors"
              title="Switch Language"
            >
              <Globe size={16} /> {currentLanguage === 'en' ? 'HI' : 'EN'}
            </button>
            <div className="w-px h-6 bg-border mx-2"></div>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.fullName?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-card-hover border border-border py-1 z-50">
                    <Link
                      to={dashboardPath}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-muted"
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-muted"
                    >
                      <User size={14} /> My Profile
                    </Link>
                    <hr className="my-1 border-border" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-outline py-2 px-4 text-sm">
                  {t('nav.login')}
                </Link>
                <Link to="/signup" className="btn-primary py-2 px-4 text-sm">
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-sm text-gray-500">Language</span>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-sm font-medium text-primary px-3 py-1.5 rounded-lg bg-primary/10 transition-colors"
            >
              <Globe size={16} /> {currentLanguage === 'en' ? 'हिन्दी (Hindi)' : 'English'}
            </button>
          </div>
          
          {/* Mobile Logic: Hide Find Workers for Workers */}
          {user?.role !== 'worker' && (
            <Link
              to="/find-workers"
              className="block py-2 text-sm font-medium text-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('nav.findWorkers')}
            </Link>
          )}

          {isAuthenticated && user?.role === 'worker' && (
             <>
               <Link
                to="/worker/my-bookings"
                className="block py-2 text-sm font-medium text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                My Bookings
              </Link>
              <Link
                to="/worker/kyc"
                className="block py-2 text-sm font-medium text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                KYC Status
              </Link>
             </>
          )}

          <Link
            to="/how-it-works"
            className="block py-2 text-sm font-medium text-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('nav.howItWorks')}
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link
                to={dashboardPath}
                className="block py-2 text-sm font-medium text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full text-left py-2 text-sm font-medium text-destructive"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link
                to="/login"
                className="btn-outline text-sm flex-1 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/signup"
                className="btn-primary text-sm flex-1 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                 {t('nav.signup')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;