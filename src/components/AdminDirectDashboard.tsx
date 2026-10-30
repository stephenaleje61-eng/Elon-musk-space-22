import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  Users, 
  AlertTriangle, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  Search, 
  Activity, 
  Layers, 
  LogOut, 
  LogIn, 
  Lock, 
  Eye, 
  ExternalLink,
  RefreshCw,
  X
} from 'lucide-react';
import { 
  ChatUser, 
  RealConversation, 
  RealMessageItem, 
  ReportItem, 
  ContentItem 
} from '../types';
import { 
  auth, 
  googleProvider, 
  ADMIN_EMAIL 
} from '../lib/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  subscribeToUsers, 
  subscribeToAllConversations, 
  subscribeToConversationMessages, 
  subscribeToReports, 
  adminSuspendUser, 
  adminDeleteUser, 
  adminDeleteMessage, 
  adminUpdateReportStatus 
} from '../services/chatService';
import { AdminCMSModal } from './AdminCMSModal';

interface AdminDirectDashboardProps {
  onClose: () => void;
  items: ContentItem[];
}

export const AdminDirectDashboard: React.FC<AdminDirectDashboardProps> = ({
  onClose,
  items
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);

  // Email/Password login inputs for owner
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'users' | 'conversations' | 'reports' | 'stats' | 'cms'>('users');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [conversations, setConversations] = useState<RealConversation[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Selected conversation for message inspection
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [convMessages, setConvMessages] = useState<RealMessageItem[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Is verified owner
  const isOwner = currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Load Real-time Data if Owner
  useEffect(() => {
    if (!isOwner) return;

    const unsubUsers = subscribeToUsers((u) => setUsers(u));
    const unsubConvs = subscribeToAllConversations((c) => setConversations(c));
    const unsubReports = subscribeToReports((r) => setReports(r));

    return () => {
      unsubUsers();
      unsubConvs();
      unsubReports();
    };
  }, [isOwner]);

  // Listen to messages of selected conversation
  useEffect(() => {
    if (!isOwner || !selectedConvId) {
      setConvMessages([]);
      return;
    }

    const unsub = subscribeToConversationMessages(selectedConvId, (msgs) => {
      setConvMessages(msgs);
    });
    return () => unsub();
  }, [isOwner, selectedConvId]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages]);

  // Handlers for Authentication
  const handleGoogleSignIn = async () => {
    setLoginError(null);
    setLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setLoginError(err.message || 'Google sign-in failed');
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
      setLoginError(err.message || 'Authentication failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  // Moderation Actions
  const handleToggleSuspend = async (user: ChatUser) => {
    const newStatus = !user.isSuspended;
    if (confirm(`${newStatus ? 'Suspend' : 'Unsuspend'} user ${user.displayName}?`)) {
      try {
        await adminSuspendUser(user.userId, newStatus);
      } catch (err) {
        alert('Action failed');
      }
    }
  };

  const handleDeleteUser = async (user: ChatUser) => {
    if (confirm(`Permanently delete account ${user.displayName} (${user.userId}) from the database?`)) {
      try {
        await adminDeleteUser(user.userId);
      } catch (err) {
        alert('Action failed');
      }
    }
  };

  const handleDeleteMessage = async (msg: RealMessageItem) => {
    if (confirm('Delete this message permanently from the chat?')) {
      try {
        await adminDeleteMessage(msg.conversationId, msg.id);
      } catch (err) {
        alert('Failed to delete message');
      }
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await adminUpdateReportStatus(reportId, 'dismissed');
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleResolveReport = async (report: ReportItem) => {
    if (confirm(`Suspend reported user ${report.reportedUserId} and resolve report?`)) {
      try {
        await adminSuspendUser(report.reportedUserId, true);
        await adminUpdateReportStatus(report.id, 'reviewed');
      } catch (err) {
        alert('Action failed');
      }
    }
  };

  // -------------------------------------------------------------------
  // SCREEN 1: ACCESS DENIED OR LOGIN REQUIRED
  // -------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050a14] flex items-center justify-center text-[#33ddff] font-mono">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>VERIFYING OWNER CREDENTIALS...</span>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#050a14] text-gray-200 font-mono flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0a152a] border border-[#1a2a4a] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-wider">
              OWNER ADMIN CONSOLE
            </h2>
            <p className="text-xs text-gray-400">
              Restricted Administrative Gateway &bull; Unauthorized Access Prohibited
            </p>
          </div>

          {currentUser ? (
            /* Logged in with wrong account */
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 space-y-3">
              <div className="flex items-center gap-2 font-bold text-red-200">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>403 FORBIDDEN — ACCESS DENIED</span>
              </div>
              <p className="leading-relaxed">
                Signed in as: <strong className="text-white">{currentUser.email || 'Anonymous Visitor'}</strong>.
              </p>
              <p className="leading-relaxed text-[11px] text-gray-400">
                This dashboard is exclusively reserved for the verified platform owner: <strong className="text-[#33ddff]">{ADMIN_EMAIL}</strong>.
              </p>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2 bg-red-900/60 hover:bg-red-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Sign Out Account
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#1a2a4a] hover:bg-gray-800 text-gray-300 rounded-lg transition-colors cursor-pointer"
                >
                  Exit
                </button>
              </div>
            </div>
          ) : (
            /* Not logged in */
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[#050a14] border border-[#1a2a4a] text-xs text-gray-300 space-y-1">
                <div className="text-[#33ddff] font-bold">AUTHORIZED OWNER ACCOUNT:</div>
                <div className="text-white font-bold">{ADMIN_EMAIL}</div>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-xs">
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
                <span className="bg-[#0a152a] px-2 text-[10px] text-gray-500 uppercase">or owner password</span>
                <div className="absolute inset-x-0 h-px bg-[#1a2a4a] -z-1"></div>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Owner Email</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={ADMIN_EMAIL}
                    className="w-full px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-lg text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full py-2.5 bg-[#33ddff] hover:bg-[#20b8d6] text-[#050a14] font-extrabold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {loggingIn ? 'Authenticating...' : 'Authenticate Owner'}
                </button>
              </form>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                &larr; Return to Visitor Space
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // SCREEN 2: AUTHORIZED OWNER ADMIN DASHBOARD
  // -------------------------------------------------------------------
  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.userId.toLowerCase().includes(userSearch.toLowerCase())
  );

  const pendingReports = reports.filter(r => r.status === 'pending');
  const onlineUsersCount = users.filter(u => u.online).length;

  return (
    <div className="min-h-screen bg-[#050a14] text-gray-200 font-mono flex flex-col">
      
      {/* Top Header */}
      <header className="border-b border-[#1a2a4a] bg-[#0a152a] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#33ddff]/10 border border-[#33ddff]/40 flex items-center justify-center text-[#33ddff]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-wider">
                ELON MUSK SPACE [OWNER DASHBOARD]
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#33ff66]/10 text-[#33ff66] border border-[#33ff66]/30">
                VERIFIED OWNER
              </span>
            </div>
            <div className="text-[11px] text-gray-400 flex items-center gap-2">
              <span>{ADMIN_EMAIL}</span>
              <span>&bull;</span>
              <span className="text-[#33ddff]">FIRESTORE SYNC ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#050a14] border border-[#1a2a4a] text-gray-300">
            <Clock className="w-3.5 h-3.5 text-[#33ddff]" />
            <span className="font-mono text-[11px]">{currentTime || 'SYNCING UTC...'}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="px-3 py-2 bg-[#1a2a4a] hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-2 bg-[#ff3366]/20 hover:bg-[#ff3366]/30 text-[#ff3366] border border-[#ff3366]/40 rounded-lg text-xs font-bold cursor-pointer"
          >
            Exit Console
          </button>
        </div>
      </header>

      {/* Statistics Bar */}
      <section className="bg-[#070e1c] border-b border-[#1a2a4a] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#0a152a] p-3 rounded-lg border border-[#1a2a4a] flex items-center justify-between">
            <span className="text-gray-400">REGISTERED USERS</span>
            <span className="text-white font-bold">{users.length}</span>
          </div>
          <div className="bg-[#0a152a] p-3 rounded-lg border border-[#1a2a4a] flex items-center justify-between">
            <span className="text-gray-400">ONLINE RIGHT NOW</span>
            <span className="text-[#33ff66] font-bold">{onlineUsersCount} ACTIVE</span>
          </div>
          <div className="bg-[#0a152a] p-3 rounded-lg border border-[#1a2a4a] flex items-center justify-between">
            <span className="text-gray-400">CONVERSATIONS</span>
            <span className="text-[#33ddff] font-bold">{conversations.length}</span>
          </div>
          <div className="bg-[#0a152a] p-3 rounded-lg border border-[#1a2a4a] flex items-center justify-between">
            <span className="text-gray-400">PENDING REPORTS</span>
            <span className={`font-bold ${pendingReports.length > 0 ? 'text-[#ff3366]' : 'text-gray-400'}`}>
              {pendingReports.length} FLAGGED
            </span>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-6">
        <div className="flex border-b border-[#1a2a4a] gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'users'
                ? 'bg-[#0a152a] text-[#33ddff] border-t-2 border-[#33ddff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>REGISTERED CHAT USERS ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'conversations'
                ? 'bg-[#0a152a] text-[#33ddff] border-t-2 border-[#33ddff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>ALL CONVERSATIONS ({conversations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'reports'
                ? 'bg-[#0a152a] text-[#33ddff] border-t-2 border-[#33ddff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>REPORTED MESSAGES ({pendingReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'stats'
                ? 'bg-[#0a152a] text-[#33ddff] border-t-2 border-[#33ddff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>PLATFORM HEALTH</span>
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'cms'
                ? 'bg-[#0a152a] text-[#33ddff] border-t-2 border-[#33ddff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>CATALOGUE CMS</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 flex flex-col">
        
        {/* TAB 1: REGISTERED CHAT USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Registered Chat Participants Directory
                </h3>
                <p className="text-xs text-gray-400">Real people registered in the Firebase Firestore user collection</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user by name or ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#0a152a] border border-[#1a2a4a] text-white rounded-xl text-xs focus:outline-hidden focus:border-[#33ddff]"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-[#1a2a4a] rounded-xl bg-[#0a152a]">
              <table className="w-full text-left text-xs divide-y divide-[#1a2a4a]">
                <thead className="bg-[#070e1c] text-gray-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Participant</th>
                    <th className="py-3 px-4">Visitor / User ID</th>
                    <th className="py-3 px-4">Presence</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2a4a]/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No registered users matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.userId} className="hover:bg-[#050a14]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#1677FF] to-[#33ddff] flex items-center justify-center font-bold text-white text-xs">
                              {u.displayName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-white">{u.displayName}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-gray-400">
                          {u.userId}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${u.online ? 'bg-[#33ff66] animate-pulse' : 'bg-gray-600'}`}></span>
                            <span className={u.online ? 'text-[#33ff66] font-bold text-[11px]' : 'text-gray-400 text-[11px]'}>
                              {u.online ? 'ONLINE' : `Seen ${new Date(u.lastSeen || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {u.isSuspended ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                              SUSPENDED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#33ff66]/10 text-[#33ff66] border border-[#33ff66]/30">
                              ACTIVE
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleSuspend(u)}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                                u.isSuspended
                                  ? 'bg-[#33ff66]/20 text-[#33ff66] hover:bg-[#33ff66]/30'
                                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                              }`}
                            >
                              {u.isSuspended ? 'Unsuspend' : 'Suspend User'}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors cursor-pointer"
                              title="Delete user record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CONVERSATIONS */}
        {activeTab === 'conversations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[550px]">
            {/* Conversation list */}
            <div className="lg:col-span-1 bg-[#0a152a] border border-[#1a2a4a] rounded-xl p-4 flex flex-col space-y-3">
              <div className="text-xs font-bold text-[#33ddff] uppercase tracking-wider px-1">
                Active Channels ({conversations.length})
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[600px]">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-500">
                    No conversations initiated yet.
                  </div>
                ) : (
                  conversations.map((c) => {
                    const isSelected = selectedConvId === c.id;
                    const participantNames = Object.values(c.participantDetails || {})
                      .map(p => p.displayName)
                      .join(' ↔ ') || c.participants.join(' ↔ ');

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedConvId(c.id)}
                        className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1a2a4a] border-[#33ddff] text-white shadow-md'
                            : 'bg-[#050a14] border-[#1a2a4a] text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="font-bold text-xs text-white truncate">
                          {participantNames}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-1">
                          {c.lastMessage || 'Channel established'}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2">
                          <span>{new Date(c.lastMessageAt || c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[#33ddff]">INSPECT LOGS &rarr;</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Conversation Inspector Area */}
            <div className="lg:col-span-2 bg-[#0a152a] border border-[#1a2a4a] rounded-xl flex flex-col overflow-hidden">
              {selectedConvId ? (
                <>
                  <div className="p-4 bg-[#050a14] border-b border-[#1a2a4a] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>CHANNEL: {selectedConvId}</span>
                        <span className="w-2 h-2 rounded-full bg-[#33ff66] animate-pulse"></span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {convMessages.length} permanent human messages recorded
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedConvId(null)}
                      className="px-3 py-1 bg-[#1a2a4a] text-gray-300 hover:text-white rounded text-xs"
                    >
                      Close
                    </button>
                  </div>

                  <div className="h-[55vh] overflow-y-auto p-4 space-y-3 bg-[#070e1c]">
                    {convMessages.length === 0 ? (
                      <div className="text-center py-12 text-xs text-gray-500">
                        No messages recorded in this channel.
                      </div>
                    ) : (
                      convMessages.map((m) => (
                        <div
                          key={m.id}
                          className="bg-[#050a14] border border-[#1a2a4a] p-3 rounded-xl flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1 max-w-[85%]">
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span className="font-bold text-[#33ddff]">{m.senderName}</span>
                              <span>&bull;</span>
                              <span>ID: {m.senderId}</span>
                              <span>&bull;</span>
                              <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                              <span className="px-1.5 py-0.2 rounded bg-blue-900/40 text-blue-300 uppercase text-[9px]">
                                {m.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                              {m.text}
                            </div>
                            {m.imageUrl && (
                              <img src={m.imageUrl} alt="attachment" className="max-w-xs rounded-lg mt-1 border border-gray-700" />
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteMessage(m)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors cursor-pointer shrink-0"
                            title="Delete inappropriate message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500 space-y-2">
                  <MessageSquare className="w-10 h-10 text-[#1a2a4a]" />
                  <p className="text-sm font-bold text-gray-300">Select a conversation</p>
                  <p className="text-xs max-w-xs">
                    Choose any channel on the left to monitor messages and remove any inappropriate content.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: REPORTED MESSAGES */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Flagged &amp; Reported Abuse Moderation Queue
              </h3>
              <p className="text-xs text-gray-400">
                User-submitted flags for abusive language, scams, or offensive content
              </p>
            </div>

            {reports.length === 0 ? (
              <div className="bg-[#0a152a] border border-[#1a2a4a] rounded-xl p-12 text-center text-gray-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#33ff66]/60 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No reports on file</p>
                <p className="text-xs">Community chat reports will appear here for review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="bg-[#0a152a] border border-[#1a2a4a] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                          {r.status.toUpperCase()}
                        </span>
                        <span className="text-gray-400">
                          Reported by: <strong className="text-white">{r.reportedByName || r.reportedBy}</strong>
                        </span>
                        <span>&bull;</span>
                        <span className="text-gray-500">{new Date(r.createdAt).toLocaleString()}</span>
                      </div>

                      <div className="p-3 bg-[#050a14] border border-[#1a2a4a] rounded-lg text-xs">
                        <div className="text-[10px] text-gray-400 mb-1">
                          FLAGGED MESSAGE (Sender ID: {r.reportedUserId}):
                        </div>
                        <div className="text-gray-200 italic">"{r.messageText}"</div>
                      </div>

                      <div className="text-xs text-amber-300">
                        <strong>Reason provided:</strong> {r.reason}
                      </div>
                    </div>

                    <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                      {r.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleResolveReport(r)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Suspend Abuser &amp; Resolve
                          </button>
                          <button
                            onClick={() => handleDismissReport(r.id)}
                            className="px-4 py-2 bg-[#1a2a4a] hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Dismiss Report
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 font-bold">
                          ✓ Handled ({r.status})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PLATFORM STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0a152a] border border-[#1a2a4a] rounded-xl p-5 space-y-2">
                <span className="text-xs text-gray-400">Total User Base</span>
                <div className="text-3xl font-bold text-white">{users.length}</div>
                <div className="text-[11px] text-[#33ff66]">Persistent Firestore records</div>
              </div>

              <div className="bg-[#0a152a] border border-[#1a2a4a] rounded-xl p-5 space-y-2">
                <span className="text-xs text-gray-400">Active Real-Time Channels</span>
                <div className="text-3xl font-bold text-[#33ddff]">{conversations.length}</div>
                <div className="text-[11px] text-gray-400">Direct 1-on-1 human conversations</div>
              </div>

              <div className="bg-[#0a152a] border border-[#1a2a4a] rounded-xl p-5 space-y-2">
                <span className="text-xs text-gray-400">Backend Authority</span>
                <div className="text-lg font-bold text-[#33ff66] flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Cloud Firestore Online</span>
                </div>
                <div className="text-[11px] text-gray-400">Project: gen-lang-client-0894854388</div>
              </div>
            </div>

            <div className="bg-[#0a152a] border border-[#1a2a4a] rounded-xl p-6 space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                System Security &amp; Compliance Audit
              </h4>
              <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside leading-relaxed">
                <li>Human-to-Human real-time communication verified via Firebase Firestore listeners (`onSnapshot`).</li>
                <li>Zero AI chatbot or automated bot responses in conversations.</li>
                <li>Messages stored permanently in `conversations/{'{id}'}/messages` with read status.</li>
                <li>Administrative privileges enforced exclusively for owner `{ADMIN_EMAIL}`.</li>
                <li>Ordinary visitors have zero access to moderation endpoints or administrative data.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 5: CATALOGUE CMS */}
        {activeTab === 'cms' && (
          <AdminCMSModal
            isOpen={true}
            onClose={() => setActiveTab('users')}
            items={items}
          />
        )}

      </main>
    </div>
  );
};
