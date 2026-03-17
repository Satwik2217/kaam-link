import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import WorkerDashboard from '@/pages/worker/WorkerDashboard';
import WorkerProfileSetup from '@/pages/worker/WorkerProfileSetup';
import WorkerKycSetup from '@/pages/worker/WorkerKycSetup';
import WorkerMyBookings from '@/pages/worker/WorkerMyBookings';
import EmployerDashboard from '@/pages/employer/EmployerDashboard';
import SearchWorkers from '@/pages/employer/SearchWorkers';
import EmployerMyBookings from '@/pages/employer/EmployerMyBookings';
import LandingPage from '@/pages/LandingPage';
import FindWorkers from '@/pages/public/FindWorkers';
import HowItWorks from '@/pages/public/HowItWorks';
import Safety from '@/pages/public/Safety';
import Terms from '@/pages/public/Terms';
import Privacy from '@/pages/public/Privacy';
import ProfilePage from '@/pages/profile/ProfilePage';

const NotFound = () => (
  <div className="max-w-7xl mx-auto px-4 py-20 text-center">
    <h1 className="font-display text-6xl font-bold text-gray-200 mb-4">404</h1>
    <p className="text-xl text-gray-600 mb-6">Page not found</p>
    <a href="/" className="btn-primary">
      Go Home
    </a>
  </div>
);

// Pages that show the Navbar
const LayoutWithNav = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes with Navbar */}
          <Route
            path="/"
            element={
              <LayoutWithNav>
                <LandingPage />
              </LayoutWithNav>
            }
          />
          <Route
            path="/find-workers"
            element={
              <LayoutWithNav>
                <FindWorkers />
              </LayoutWithNav>
            }
          />
          <Route
            path="/how-it-works"
            element={
              <LayoutWithNav>
                <HowItWorks />
              </LayoutWithNav>
            }
          />
          <Route
            path="/safety"
            element={
              <LayoutWithNav>
                <Safety />
              </LayoutWithNav>
            }
          />
          <Route
            path="/terms"
            element={
              <LayoutWithNav>
                <Terms />
              </LayoutWithNav>
            }
          />
          <Route
            path="/privacy"
            element={
              <LayoutWithNav>
                <Privacy />
              </LayoutWithNav>
            }
          />

          {/* Auth routes (no Navbar) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected: General User Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <LayoutWithNav>
                  <ProfilePage />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />

          {/* Protected: Worker routes */}
          <Route
            path="/worker/dashboard"
            element={
              <ProtectedRoute role="worker">
                <LayoutWithNav>
                  <WorkerDashboard />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/profile-setup"
            element={
              <ProtectedRoute role="worker">
                <LayoutWithNav>
                  <WorkerProfileSetup />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/kyc"
            element={
              <ProtectedRoute role="worker">
                <LayoutWithNav>
                  <WorkerKycSetup />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/my-bookings"
            element={
              <ProtectedRoute role="worker">
                <LayoutWithNav>
                  <WorkerMyBookings />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />

          {/* Protected: Employer routes */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute role="employer">
                <LayoutWithNav>
                  <EmployerDashboard />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/search"
            element={
              <ProtectedRoute role="employer">
                <LayoutWithNav>
                  <SearchWorkers />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/my-bookings"
            element={
              <ProtectedRoute role="employer">
                <LayoutWithNav>
                  <EmployerMyBookings />
                </LayoutWithNav>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route
            path="*"
            element={
              <LayoutWithNav>
                <NotFound />
              </LayoutWithNav>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

