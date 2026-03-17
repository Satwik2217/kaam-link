import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Briefcase,
  UserCheck,
  Building2,
  ArrowRight,
  Phone,
  Lock,
  User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation } from 'react-router-dom';

const SignupPage = () => {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    role: 'employer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Read role from URL query params on mount
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'worker' || roleParam === 'employer') {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await signup(formData);
      if (data.success) {
        navigate(
          data.user.role === 'worker'
            ? '/worker/dashboard'
            : '/employer/dashboard'
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Signup failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Briefcase size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-900">
              Kaam<span className="text-primary">Link</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-gray-900 mt-6">
            {t('signup.createAccount')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t('signup.subtitle')}
          </p>
        </div>

        <div className="card p-8">
          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() =>
                setFormData((p) => ({ ...p, role: 'employer' }))
              }
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                formData.role === 'employer'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 size={16} /> {t('signup.hiring')}
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: 'worker' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                formData.role === 'worker'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserCheck size={16} /> {t('signup.worker')}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('signup.fullName')}
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={t('signup.fullNamePlaceholder')}
                  required
                  className="input-field pl-9"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('login.mobile')}
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <span className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-500 text-sm border-r border-border pr-2">
                  +91
                </span>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('login.mobilePlaceholder')}
                  required
                  maxLength={10}
                  className="input-field pl-20"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('signup.email')}{' '}
                <span className="text-gray-400 font-normal">{t('signup.optional')}</span>
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('signup.emailPlaceholder')}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('signup.passwordPlaceholder')}
                  required
                  className="input-field pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{' '}
                  {t('signup.creating')}
                </>
              ) : (
                <>
                  {t('signup.createBtn')} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('signup.alreadyHave')}{' '}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              {t('nav.login')}
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          {t('signup.agree')}{' '}
          <Link to="/terms" className="text-primary hover:underline">
            {t('signup.terms')}
          </Link>{' '}
          {t('signup.and')}{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            {t('signup.privacy')}
          </Link>
          {t('signup.agreeEnd') ? ` ${t('signup.agreeEnd')}` : ''}
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

