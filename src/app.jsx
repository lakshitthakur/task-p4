import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/lp';
import SignupPage from './pages/sup';
import PostPage from './pages/PostPage';
import PricingPage from './pages/PricingPage';
import BrowsePosts from './pages/BrowsePosts';

import './app.css';

function App() {
  return (
    <AuthProvider>
      <Router>

        <div className="app-container">

          <Navbar />

          <main className="main-content">

            <Routes>

              {/* Public routes */}

              <Route
                path="/"
                element={<HomePage />}
              />

              <Route
                path="/login"
                element={<LoginPage />}
              />

              <Route
                path="/signup"
                element={<SignupPage />}
              />

              <Route
                path="/pricing"
                element={<PricingPage />}
              />

              <Route
                path="/browse"
                element={<BrowsePosts />}
              />


              {/* Protected routes */}

              <Route element={<ProtectedRoute />}>

                <Route
                  path="/post"
                  element={<PostPage />}
                />

              </Route>

            </Routes>

          </main>

          <Footer />

        </div>

      </Router>
    </AuthProvider>
  );
}

export default App;