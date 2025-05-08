import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Caffeine from './pages/Caffeine';
import HeartRate from './pages/HeartRate';

// Temporary auth check (replace with actual auth logic later)
const isAuthenticated = () => {
  return localStorage.getItem('user') !== null;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Default route - redirect to login if not authenticated, home if authenticated */}
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caffeine"
          element={
            <ProtectedRoute>
              <Caffeine />
            </ProtectedRoute>
          }
        />
        <Route
          path="/heart"
          element={
            <ProtectedRoute>
              <HeartRate />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App; 