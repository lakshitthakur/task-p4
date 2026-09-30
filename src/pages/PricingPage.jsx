import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PricingPage() {
  const { currentUser, upgradeToPaid } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgradeClick = () => {
    if (!currentUser) {
      alert('Please log in to upgrade your subscription plan.');
      navigate('/login');
      return;
    }
    if (currentUser.subscriptionPlan === 'Paid') {
      alert('You are already subscribed to the Premium Paid plan.');
      return;
    }
    setIsModalOpen(true);
    setErrorMsg('');
  };

  const handlePaymentChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const validatePayment = () => {
    const { cardName, cardNumber, expiry, cvv } = paymentData;
    if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      setErrorMsg('All payment fields are required.');
      return false;
    }
    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cleanCard)) {
      setErrorMsg('Enter a valid 16-digit card number.');
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry)) {
      setErrorMsg('Enter a valid expiry date (MM/YY).');
      return false;
    }
    if (!/^\d{3}$/.test(cvv)) {
      setErrorMsg('Enter a valid 3-digit CVV.');
      return false;
    }
    return true;
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validatePayment()) return;

    setIsProcessing(true);
    try {
      await upgradeToPaid();
      setSuccessMsg('Payment successful! Your account has been upgraded to the Paid Plan.');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
      }, 2000);
    } catch (err) {
      setErrorMsg('Failed to process upgrade: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h2>Choose Your DEV@Deakin Plan</h2>
        <p>Unlock advanced posting options, extended media limits, and community tools.</p>
      </div>

      <div className="pricing-cards-grid">
        {/* Free Plan Card */}
        <div className="pricing-card">
          <h3>Free Plan</h3>
          <p className="price-tag">$0 <span>/ month</span></p>
          <ul className="plan-features">
            <li>Standard Question & Article posting</li>
            <li>Up to 3 tags per post</li>
            <li>Standard community support</li>
            <li>Basic profile customisation</li>
          </ul>
          <button className="plan-btn disabled" disabled>
            {currentUser && currentUser.subscriptionPlan !== 'Paid' ? 'Current Plan' : 'Free Tier'}
          </button>
        </div>

        {/* Paid Premium Plan Card */}
        <div className="pricing-card premium">
          <div className="badge-featured">Recommended</div>
          <h3>Paid Premium</h3>
          <p className="price-tag">$9.99 <span>/ month</span></p>
          <ul className="plan-features">
            <li>Early access to featured academic posts</li>
            <li>Unlimited post creation per month</li>
            <li>Increased image and media upload sizes</li>
            <li>Verified Author badge on all posts</li>
            <li>Priority feedback and review queue</li>
          </ul>
          <button
            className="plan-btn upgrade"
            onClick={handleUpgradeClick}
            disabled={currentUser?.subscriptionPlan === 'Paid'}
          >
            {currentUser?.subscriptionPlan === 'Paid' ? 'Active Plan' : 'Upgrade Plan'}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Upgrade to Premium</h3>
            <p className="modal-desc">Enter card details to complete your $9.99/mo subscription.</p>

            {errorMsg && <div className="auth-feedback-banner error">{errorMsg}</div>}
            {successMsg && <div className="auth-feedback-banner success">{successMsg}</div>}

            <form onSubmit={handleProcessPayment} className="auth-form">
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  name="cardName"
                  placeholder="e.g. Alex Smith"
                  value={paymentData.cardName}
                  onChange={handlePaymentChange}
                />
              </div>

              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  maxLength="16"
                  placeholder="1234 5678 9101 1121"
                  value={paymentData.cardNumber}
                  onChange={handlePaymentChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Expiry (MM/YY)</label>
                  <input
                    type="text"
                    name="expiry"
                    maxLength="5"
                    placeholder="12/28"
                    value={paymentData.expiry}
                    onChange={handlePaymentChange}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    maxLength="3"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={handlePaymentChange}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="nav-logout-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="auth-submit-btn"
                  style={{ flex: 1 }}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Confirm & Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PricingPage;