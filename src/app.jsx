import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/lp';
import SignupPage from './pages/sup';
import PostPage from './pages/PostPage';
import PricingPage from './pages/PricingPage';
import './app.css';
import BrowsePosts from './pages/BrowsePosts';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/post" element={<PostPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/browse" element={<BrowsePosts />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;