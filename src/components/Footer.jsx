import React, { useState } from 'react';

function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing! We sent a confirmation to ${email}`);
      setEmail('');
    }
  };

  return (
    <footer className="site-footer">
      <div className="newsletter-bar">
        <span>SIGN UP FOR OUR DAILY INSIDER</span>
        <form onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Subscribe</button>
        </form>
      </div>

      <div className="footer-links">
        <div>
          <h4>Explore</h4>
          <ul>
            <li>Home</li>
            <li>Questions</li>
            <li>Articles</li>
            <li>Tutorials</li>
          </ul>
        </div>
        <div>
          <h4>Support</h4>
          <ul>
            <li>FAQs</li>
            <li>Help</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div>
          <h4>Stay connected</h4>
          <p>🌐 📘 📷</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>DEV@Deakin 2026</p>
        <ul>
          <li>Privacy Policy</li>
          <li>Terms</li>
          <li>Code of Conduct</li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;