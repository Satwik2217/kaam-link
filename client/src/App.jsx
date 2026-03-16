import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import WorkerDashboard from '@/pages/worker/WorkerDashboard';
import WorkerProfileSetup from '@/pages/worker/WorkerProfileSetup';
import EmployerDashboard from '@/pages/employer/EmployerDashboard';
import SearchWorkers from '@/pages/employer/SearchWorkers';
import LandingPage from '@/pages/LandingPage';

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

          {/* Auth routes (no Navbar) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

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

