import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './services/context/AuthContext';

import { Navbar } from './components/navigation/Navbar';

import { HomePage } from './pages/home/homepage';

import { LoginPage } from './pages/login/LoginPage';

import { SignupPage } from './pages/Signup/SignupPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[var(--color-background)]">
          <Routes>
            {/* Public routes without navbar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Routes with navbar */}
            <Route path="/" element={
              <>
                <Navbar />
                <HomePage />
              </>
            } />
            
            {/* Add more routes as we build pages */}
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
import { GigDetailPage } from './pages/GigDetail/GigDetailPage';

// Add route:
<Route path="/gigs/:id" element={
  <>
    <Navbar />
    <GigDetailPage />
  </>
} />
export default App;