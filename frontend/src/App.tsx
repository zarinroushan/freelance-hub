import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './services/context/ThemeContext';
import { AuthProvider } from './services/context/AuthContext';

import { Navbar } from './components/navigation/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/home/homepage';
import { LoginPage } from './pages/login/LoginPage';
import { SignupPage } from './pages/Signup/SignupPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { GigsPage } from './components/gigs/GigsPage';
import { GigDetailPage } from './pages/GigDetail/GigDetailPage';
import { ApplicationsPage } from './pages/applications/ApplicationsPage';
import { PostGigPage } from './pages/PostGig/PostGigPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { MessagesPage } from './pages/Messages/MessagesPage';
import { ContractsPage } from './pages/Contracts/ContractsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-[var(--color-background)]">
            <Routes>

              {/* =========================
                  PUBLIC ROUTES
              ========================== */}

              {/* Home */}
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <HomePage />
                  </>
                }
              />

              {/* Login */}
              <Route
                path="/login"
                element={<LoginPage />}
              />

              {/* Signup */}
              <Route
                path="/signup"
                element={<SignupPage />}
              />

              {/* All Gigs */}
              <Route
                path="/gigs"
                element={
                  <>
                    <Navbar />
                    <GigsPage />
                  </>
                }
              />

              {/* Gig Details */}
              <Route
                path="/gigs/:id"
                element={
                  <>
                    <Navbar />
                    <GigDetailPage />
                  </>
                }
              />

              {/* =========================
                  PROTECTED ROUTES
              ========================== */}

              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Applications */}
              <Route
                path="/applications"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <ApplicationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Post a New Gig - CLIENT ONLY */}
              <Route
                path="/gigs/new"
                element={
                  <ProtectedRoute role="client">
                    <Navbar />
                    <PostGigPage />
                  </ProtectedRoute>
                }
              />

              {/* Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Messages */}
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />

              {/* Contracts */}
              <Route
                path="/contracts"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <ContractsPage />
                  </ProtectedRoute>
                }
              />

              {/* Settings */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;