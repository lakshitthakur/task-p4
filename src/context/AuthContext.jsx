import React, { createContext, useContext, useEffect, useState } from 'react';

import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updatePassword
} from 'firebase/auth';

import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc
} from 'firebase/firestore';

import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load the user's Firestore profile
    const loadUserProfile = async (firebaseUser) => {
        if (!firebaseUser) {
            setCurrentUser(null);
            return null;
        }

        // Do not treat an unverified account as an authenticated
        // application user.
        if (!firebaseUser.emailVerified) {
            setCurrentUser(null);
            return null;
        }

        try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();

                const user = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    emailVerified: firebaseUser.emailVerified,
                    ...userData
                };

                setCurrentUser(user);
                return user;
            }

            // Fallback if the Firebase account exists but the
            // Firestore profile does not.
            const fallbackUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                name: firebaseUser.displayName || '',
                subscriptionPlan: 'Free',
                role: 'user'
            };

            setCurrentUser(fallbackUser);
            return fallbackUser;

        } catch (error) {
            console.error('Error loading user profile:', error);
            setCurrentUser(null);
            throw error;
        }
    };

    // Listen for Firebase authentication changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    await loadUserProfile(firebaseUser);
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error('Auth state error:', error);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    // Login
    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const firebaseUser = result.user;

            // User has not verified their email yet
            if (!firebaseUser.emailVerified) {
    setCurrentUser(null);

    throw new Error(
        'Please verify your email address before logging in.'
    );
}

            // Load the verified user's profile
            const user = await loadUserProfile(firebaseUser);

            return user;

        } catch (error) {
            console.error('Login error:', error);

            // Keep our custom verification message
            if (
                error.message ===
                'Please verify your email address before logging in.'
            ) {
                throw error;
            }

            throw error;
        }
    };

    // Create a new account
    const signup = async (name, email, password) => {
    try {
        // Create Firebase authentication account
        const result = await createUserWithEmailAndPassword(
            auth,
            email.trim().toLowerCase(),
            password
        );

        const firebaseUser = result.user;

        // Create the user's Firestore profile
        await setDoc(doc(db, 'users', firebaseUser.uid), {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subscriptionPlan: 'Free',
            role: 'user',
            createdAt: serverTimestamp()
        });

        // Get a fresh Firebase ID token
        const idToken =
            await firebaseUser.getIdToken(true);

        // Ask our backend to generate the Firebase
        // verification link and send it through Resend.
        const response = await fetch(
            'http://localhost:5001/api/send-verification-email',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                'Unable to send verification email.'
            );
        }

        console.log(
            'Custom verification email sent successfully.'
        );

        // Sign the user out until their email is verified.
        await signOut(auth);

        return {
            success: true,
            message:
                'Account created successfully. Please check your email and verify your account before logging in.'
        };

    } catch (error) {
        console.error('Signup error:', error);

        throw error;
    }
};

const resendVerificationEmail = async () => {
    try {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            throw new Error(
                'No active account found. Please log in again.'
            );
        }

        // Refresh the Firebase user information
        await firebaseUser.reload();

        const refreshedUser = auth.currentUser;

        if (!refreshedUser) {
            throw new Error(
                'Unable to find your account. Please log in again.'
            );
        }

        // Don't send another email if already verified
        if (refreshedUser.emailVerified) {
            return {
                success: true,
                message: 'Your email is already verified.'
            };
        }

        // Get a fresh Firebase ID token
        const idToken =
            await refreshedUser.getIdToken(true);

        // Send request to our secure backend
        const response = await fetch(
            'http://localhost:5001/api/send-verification-email',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                'Unable to send verification email.'
            );
        }

        console.log(
            'Custom verification email sent successfully.'
        );

        return {
            success: true,
            message:
                'Verification email sent successfully. Please check your inbox.'
        };

    } catch (error) {

        console.error(
            'Custom verification email error:',
            error
        );

        throw error;
    }
};

    // Check whether the user has verified their email
    const refreshVerificationStatus = async () => {
        try {
            const firebaseUser = auth.currentUser;

            if (!firebaseUser) {
                return false;
            }

            await firebaseUser.reload();

            const refreshedUser = auth.currentUser;

            if (!refreshedUser) {
                return false;
            }

            if (!refreshedUser.emailVerified) {
                return false;
            }

            await loadUserProfile(refreshedUser);

            return true;

        } catch (error) {
            console.error(
                'Verification status refresh error:',
                error
            );

            return false;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    // Password reset
    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);

            return {
                success: true,
                message:
                    'Password reset email sent. Please check your inbox.'
            };

        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    };

    // Change password for logged-in user
    const changePassword = async (newPassword) => {
        try {
            const firebaseUser = auth.currentUser;

            if (!firebaseUser) {
                throw new Error(
                    'You must be logged in to change your password.'
                );
            }

            await updatePassword(firebaseUser, newPassword);

            return {
                success: true,
                message: 'Password changed successfully.'
            };

        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    };

    // Upgrade subscription
    const upgradeToPaid = async () => {
        try {
            if (!auth.currentUser) {
                throw new Error(
                    'You must be logged in to upgrade your account.'
                );
            }

            const userRef = doc(
                db,
                'users',
                auth.currentUser.uid
            );

            await updateDoc(userRef, {
                subscriptionPlan: 'Paid'
            });

            setCurrentUser((previousUser) => ({
                ...previousUser,
                subscriptionPlan: 'Paid'
            }));

            return {
                success: true,
                message: 'Your account has been upgraded to Paid.'
            };

        } catch (error) {
            console.error('Upgrade error:', error);
            throw error;
        }
    };

    const value = {
        currentUser,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        resendVerificationEmail,
        refreshVerificationStatus,
        changePassword,
        upgradeToPaid
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom authentication hook
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside an AuthProvider'
        );
    }

    return context;
}

export default AuthContext;