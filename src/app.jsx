import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar.jsx';
import Footer from './components/Footer.jsx';
import LoginPage from './pages/lp.jsx';
import SignupPage from './pages/sup.jsx';
import './app.css';

function Home() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Welcome to DEV@Deakin</h2>
      <p>Explore articles, tutorials, and connect with other developers.</p>
    </main>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;