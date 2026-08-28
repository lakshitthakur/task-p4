import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">DEV@Deakin</Link>
      <input type="text" placeholder="Search..." className="nav-search" />
      <div className="nav-links">
        <span className="nav-post">Post</span>
        <Link to="/login" className="nav-login-btn">Login</Link>
      </div>
    </nav>
  );
}

export default Navbar;