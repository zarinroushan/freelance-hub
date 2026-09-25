import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './services/context/ThemeContext';
import { AuthProvider } from './services/context/AuthContext';

import { LandingNavbar, AppNavbar } from './components/navigation/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/home/homepage';
import { LoginPage } from './pages/login/LoginPage';
import { SignupPage } from './pages/Signup/SignupPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { GigsPage } from './components/gigs/GigsPage';
import { GigDetailPage } from './pages/GigDetail/GigDetailPage';
import { ApplicationsPage } from './pages/applications/ApplicationsPage';
import { GigApplicationsPage } from './pages/applications/GigApplicationsPage';
import { PostGigPage } from './pages/PostGig/PostGigPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { MessagesPage } from './pages/Messages/MessagesPage';
import { ContractsPage } from './pages/Contracts/ContractsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { GoogleCallbackPage } from './pages/login/GoogleCallbackPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';

/** Offsets inner-page content below the fixed navbar height (72px). */
function NavbarPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNavbar />
      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        {children}
      </div>
    </>
  );
}

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

              {/* Home — LandingNavbar floats over full-screen hero; no padding-top needed */}
              <Route
                path="/"
                element={
                  <>
                    <LandingNavbar />
                    <HomePage />
                  </>
                }
              />

              {/* Login */}
              <Route
                path="/login"
                element={<LoginPage />}
              />

              <Route path="/auth/callback" element={<GoogleCallbackPage />} />

              {/* Signup */}
              <Route
                path="/signup"
                element={<SignupPage />}
              />

              {/* All Gigs */}
              <Route
                path="/gigs"
                element={
                  <NavbarPage>
                    <GigsPage />
                  </NavbarPage>
                }
              />

              {/* Gig Details */}
              <Route
                path="/gigs/:id"
                element={
                  <NavbarPage>
                    <GigDetailPage />
                  </NavbarPage>
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
                    <NavbarPage>
                      <DashboardPage />
                    </NavbarPage>
                  </ProtectedRoute>
                }
              />

              {/* Applications List */}
              <Route
                path="/applications"
                element={
                  <ProtectedRoute>
                    <NavbarPage>
                      <ApplicationsPage />
                    </NavbarPage>
                  </ProtectedRoute>
                }
              />

              {/* Gig Applications View (Gig Owner) */}
              <Route
                path="/applications/:gigId"
                element={
                  <ProtectedRoute>
                    <NavbarPage>
                      <GigApplicationsPage />
                    </NavbarPage>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/gigs/:gigId/applications"
                element={
                  <ProtectedRoute>
                    <NavbarPage>
                      <GigApplicationsPage />
                    </NavbarPage>
                  </ProtectedRoute>
                }
              />

              {/* Post a New Gig - CLIENT ONLY */}
              <Route
                path="/gigs/new"
                element={
                  <ProtectedRoute role="client">
                    <NavbarPage>
                      <PostGigPage />
                    </NavbarPage>
                  </ProtectedRoute>
                }
              />

              {/* Profile */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <NavbarPage>
                      <ProfilePage />
                    </NavbarPage>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <NavbarPage>
                      <ProfilePage />
                    </NavbarPage>
                  </ProtectedRoute>
                }
              />

              {/* Messages */}
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <NavbarPage>
                      <MessagesPage />
                    </NavbarPage>
                  </ProtectedRoute>
                }
              />

              {/* Contracts */}
              <Route
                path="/contracts"
                element={
                  <ProtectedRoute>
                    <NavbarPage>
                      <ContractsPage />
                    </NavbarPage>
                  </ProtectedRoute>
                }
              />

              {/* Settings */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <NavbarPage>
                      <SettingsPage />
                    </NavbarPage>
                  </ProtectedRoute>
                }
              />

              {/* Notifications */}
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
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

