import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">DEV@Deakin</Link>
      <input type="text" className="nav-search" placeholder="Search..." />
      <div className="nav-links">
        <Link to="/post" className="nav-post">Post</Link>
        {/* Task D1 Required Pricing Link */}
        <Link to="/pricing" className="nav-post">Pricing</Link>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className={`plan-badge ${currentUser.subscriptionPlan?.toLowerCase()}`}>
              {currentUser.subscriptionPlan || 'Free'} Plan
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currentUser.name}</span>
            <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="nav-login-btn">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;