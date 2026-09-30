import React, { useState } from 'react';

function HomePage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (event) => {
    event.preventDefault();

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://task-p5.onrender.com/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Subscription failed.');
      }

      setMessage(data.message);
      setEmail('');
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.message || 'Unable to subscribe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          marginBottom: '1rem',
          color: '#0f172a',
        }}
      >
        Welcome to DEV@Deakin
      </h1>

      <p
        style={{
          color: '#64748b',
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto 2rem',
        }}
      >
        A platform for students and academics to connect, share knowledge,
        and collaborate.
      </p>

      <section
        style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
        }}
      >
        <h2 style={{ color: '#0f172a' }}>
          Stay Connected
        </h2>

        <p style={{ color: '#64748b' }}>
          Subscribe to our newsletter for the latest DEV@Deakin updates.
        </p>

        <form onSubmit={handleSubscribe}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '12px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              boxSizing: 'border-box',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <p style={{ color: 'green', marginTop: '1rem' }}>
            {message}
          </p>
        )}

        {error && (
          <p style={{ color: 'red', marginTop: '1rem' }}>
            {error}
          </p>
        )}
      </section>
    </div>
  );
}

export default HomePage;