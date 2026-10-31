'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAIL, ADMIN_UID } from '../../src/lib/firebase';
import { SpaceXIcon } from '../../src/components/SpaceXIcon';
import { AdminDirectDashboard } from '../../src/components/AdminDirectDashboard';
import { INITIAL_CONTENT_ITEMS } from '../../src/data/seedData';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState(ADMIN_EMAIL);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isVerifiedAdmin =
    currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
    currentUser?.uid === ADMIN_UID;

  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setLoginError(err.message || 'Google authentication failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
    } catch (err: any) {
      setLoginError('Authentication failed. Please verify credentials for ' + ADMIN_EMAIL);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleExit = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-white font-mono">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0084FF]" />
          <span>VERIFYING OWNER PERMISSIONS...</span>
        </div>
      </div>
    );
  }

  // ACCESS DENIED SCREEN: when not authenticated as elonmuskspace241@gmail.com
  if (!isVerifiedAdmin) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-[#111111] border border-[#222222] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <SpaceXIcon size={48} className="mx-auto" withGlow />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-tech">
                Admin Only - Login with {ADMIN_EMAIL}
              </h2>
              <div className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                SPACE X &bull; ELON MUSK SPACE
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Only <strong>{ADMIN_EMAIL}</strong> can accept friend requests or manage chats.
            </p>
          </div>

          {currentUser ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 space-y-3">
              <div className="flex items-center gap-2 font-bold text-red-200">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>ACCESS DENIED</span>
              </div>
              <p className="leading-relaxed">
                Signed in as: <strong className="text-white">{currentUser.email || 'Visitor'}</strong>.
              </p>
              <p className="text-[11px] text-gray-400">
                This portal is strictly reserved for {ADMIN_EMAIL}.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2 bg-red-900/60 hover:bg-red-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
                <button
                  onClick={handleExit}
                  className="px-4 py-2 bg-[#222222] hover:bg-[#333333] text-gray-300 rounded-lg transition-colors cursor-pointer"
                >
                  Homepage
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#222222] text-xs space-y-1">
                <div className="text-gray-400 text-[10px] uppercase font-mono">REQUIRED ADMIN ACCOUNT:</div>
                <div className="text-white font-bold">{ADMIN_EMAIL}</div>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-xs">
                  {loginError}
                </div>
              )}

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loggingIn}
                className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google ({ADMIN_EMAIL})</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <span className="bg-[#111111] px-2 text-[10px] text-gray-500 uppercase font-mono">or email credentials</span>
                <div className="absolute inset-x-0 h-px bg-[#222222] -z-1"></div>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Admin Email</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 text-white text-xs focus:border-[#0084FF] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 text-white text-xs focus:border-[#0084FF] focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full py-2.5 bg-[#0084FF] hover:bg-[#0070d6] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {loggingIn ? 'Authenticating...' : 'Sign In as Administrator'}
                </button>
              </form>

              {/* Anonymous note */}
              <div className="p-3 rounded-lg bg-[#0c0c0c] border border-[#1a1a1a] text-[11px] text-gray-400 text-center">
                <span className="text-gray-500">Anonymous visitor note:</span> Visitors can freely browse all website sections without signing in.
              </div>

              <div className="pt-1 text-center">
                <button
                  onClick={handleExit}
                  className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // FULL AUTHORIZED DASHBOARD
  return (
    <AdminDirectDashboard
      onClose={handleExit}
      items={INITIAL_CONTENT_ITEMS}
    />
  );
}
