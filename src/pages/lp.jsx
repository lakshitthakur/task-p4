import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const navigate = useNavigate();

    const {
        login,
        resetPassword,
        resendVerificationEmail,
        refreshVerificationStatus
    } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const [showReset, setShowReset] = useState(false);
    const [resetMessage, setResetMessage] = useState('');

    const [verificationRequired, setVerificationRequired] =
        useState(false);

    // Login
    const handleLoginSubmit = async (event) => {
        event.preventDefault();

        setError('');
        setSuccess('');
        setResetMessage('');
        setVerificationRequired(false);

        if (!email || !password) {
            setError('Please enter your email and password.');
            return;
        }

        setIsLoading(true);

        try {
            await login(email, password);

            navigate('/');
        } catch (loginError) {
            console.error('Login error:', loginError);

            if (
                loginError.message?.includes(
                    'verify your email'
                )
            ) {
                setVerificationRequired(true);
                setError('');
            } else if (
                loginError.code === 'auth/invalid-credential' ||
                loginError.code === 'auth/wrong-password' ||
                loginError.code === 'auth/user-not-found'
            ) {
                setError(
                    'Invalid email or password.'
                );
            } else if (
                loginError.code === 'auth/invalid-email'
            ) {
                setError(
                    'Please enter a valid email address.'
                );
            } else if (
                loginError.code === 'auth/too-many-requests'
            ) {
                setError(
                    'Too many login attempts. Please try again later.'
                );
            } else {
                setError(
                    loginError.message ||
                    'Unable to log in. Please try again.'
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Resend verification email
    const handleResendVerification = async () => {
        setError('');
        setSuccess('');

        setIsResending(true);

        try {
            await resendVerificationEmail();

            setSuccess(
                'Verification email sent successfully. Please check your inbox and spam folder.'
            );
        } catch (verificationError) {
            console.error(
                'Resend verification error:',
                verificationError
            );

            setError(
                verificationError.message ||
                'Unable to resend the verification email.'
            );
        } finally {
            setIsResending(false);
        }
    };

    // Check whether email has now been verified
    const handleCheckVerification = async () => {
        setError('');
        setSuccess('');

        setIsChecking(true);

        try {
            const verified =
                await refreshVerificationStatus();

            if (verified) {
                setSuccess(
                    'Email verified successfully! Redirecting...'
                );

                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else {
                setError(
                    'Your email is not verified yet. Please click the verification link in your email and try again.'
                );
            }
        } catch (verificationError) {
            console.error(
                'Verification check error:',
                verificationError
            );

            setError(
                'Unable to check your verification status.'
            );
        } finally {
            setIsChecking(false);
        }
    };

    // Forgot password
    const handlePasswordReset = async () => {
        setError('');
        setResetMessage('');

        if (!email) {
            setError(
                'Enter your email address first.'
            );
            return;
        }

        try {
            await resetPassword(email);

            setResetMessage(
                'Password reset email sent. Please check your inbox.'
            );
        } catch (resetError) {
            console.error(
                'Password reset error:',
                resetError
            );

            if (
                resetError.code ===
                'auth/user-not-found'
            ) {
                setError(
                    'No account was found with this email address.'
                );
            } else if (
                resetError.code ===
                'auth/invalid-email'
            ) {
                setError(
                    'Please enter a valid email address.'
                );
            } else {
                setError(
                    resetError.message ||
                    'Unable to send password reset email.'
                );
            }
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-container">

                <div className="auth-card">

                    <h1>Welcome Back</h1>

                    <p className="auth-subtitle">
                        Log in to your DEV@Deakin account
                    </p>

                    {/* Normal error */}
                    {error && !verificationRequired && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="auth-success">
                            {success}
                        </div>
                    )}

                    {/* Email verification panel */}
                    {verificationRequired && (
                        <div className="verification-panel">

                            <div className="verification-icon">
                                ✉️
                            </div>

                            <h2>
                                Verify your email
                            </h2>

                            <p>
                                Your account was created, but
                                your email address has not been
                                verified yet.
                            </p>

                            <p>
                                We have sent a verification
                                email to:
                            </p>

                            <strong>
                                {email}
                            </strong>

                            <div className="verification-actions">

                                <button
                                    type="button"
                                    onClick={
                                        handleResendVerification
                                    }
                                    disabled={isResending}
                                    className="primary-button"
                                >
                                    {isResending
                                        ? 'Sending...'
                                        : 'Resend verification email'}
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleCheckVerification
                                    }
                                    disabled={isChecking}
                                    className="secondary-button"
                                >
                                    {isChecking
                                        ? 'Checking...'
                                        : "I've verified my email"}
                                </button>

                            </div>

                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="auth-success">
                                    {success}
                                </div>
                            )}

                            <p className="verification-help">
                                Didn't receive the email?
                                Check your spam or junk folder.
                            </p>

                        </div>
                    )}

                    {/* Login form */}
                    {!verificationRequired && (
                        <form
                            onSubmit={handleLoginSubmit}
                            className="auth-form"
                        >

                            <div className="form-group">

                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />

                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="primary-button"
                            >
                                {isLoading
                                    ? 'Logging in...'
                                    : 'Log In'}
                            </button>

                        </form>
                    )}

                    {/* Forgot password */}
                    {!verificationRequired && (
                        <div className="forgot-password-section">

                            {!showReset ? (
                                <button
                                    type="button"
                                    className="forgot-password-btn"
                                    onClick={() => {
                                        setShowReset(true);
                                        setError('');
                                    }}
                                >
                                    Forgot your password?
                                </button>
                            ) : (
                                <div className="reset-password-box">

                                    <h3>
                                        Reset your password
                                    </h3>

                                    <p>
                                        Enter your email address
                                        and we'll send you a
                                        password reset link.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            handlePasswordReset
                                        }
                                        className="secondary-button"
                                    >
                                        Send reset email
                                    </button>

                                    {resetMessage && (
                                        <div className="auth-success">
                                            {resetMessage}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className="forgot-password-btn"
                                        onClick={() => {
                                            setShowReset(false);
                                            setResetMessage('');
                                            setError('');
                                        }}
                                    >
                                        Back to login
                                    </button>

                                </div>
                            )}

                        </div>
                    )}

                    {!verificationRequired && (
                        <div className="auth-footer">
                            <p>
                                Don't have an account?
                            </p>

                            <button
                                type="button"
                                className="link-button"
                                onClick={() =>
                                    navigate('/signup')
                                }
                            >
                                Create an account
                            </button>
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}

export default LoginPage;