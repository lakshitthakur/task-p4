import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">DEV@Deakin</Link>
      <input
        type="text"
        className="nav-search"
        placeholder="Search..."
      />
      <div className="nav-links">
        {/* Updated route to the new post creation interface */}
        <Link to="/post" className="nav-post">Post</Link>
        <Link to="/login" className="nav-login-btn">Login</Link>
      </div>
    </nav>
  );
}

export default Navbar;