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
  Layers, 
  LogOut, 
  LogIn, 
  Lock, 
  Send,
  CheckCheck,
  Check,
  X,
  RefreshCw,
  UserCheck,
  UserX,
  Archive
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  ADMIN_EMAIL,
  ADMIN_UID
} from '../lib/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  subscribeToAllFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  subscribeToAdminChats,
  subscribeToChatMessages,
  sendChatMessage,
  markChatAsRead,
  setChatTyping,
  adminDeleteConversation,
  FriendRequest,
  RealConversation,
  RealChatMessage
} from '../services/friendChatService';
import { ContentItem } from '../types';
import { AdminCMSModal } from './AdminCMSModal';
import { SpaceXIcon } from './SpaceXIcon';

interface AdminDirectDashboardProps {
  onClose: () => void;
  items: ContentItem[];
}

const ELON_AVATAR = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/240px-Elon_Musk_Royal_Society_%28crop2%29.jpg';

export const AdminDirectDashboard: React.FC<AdminDirectDashboardProps> = ({
  onClose,
  items
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);

  // Authentication inputs
  const [emailInput, setEmailInput] = useState(ADMIN_EMAIL);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dashboard Tabs: Tab 1: Friend Requests, Tab 2: Chats, Tab 3: CMS
  const [activeTab, setActiveTab] = useState<'requests' | 'chats' | 'cms'>('requests');

  // Tab 1: Friend Requests
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [reqFilter, setReqFilter] = useState<'pending' | 'accepted' | 'declined' | 'all'>('pending');
  const [processingReqId, setProcessingReqId] = useState<string | null>(null);

  // Tab 2: Accepted Chats
  const [conversations, setConversations] = useState<RealConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<RealChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const adminTypingTimeoutRef = useRef<any>(null);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Strict Admin Check: ONLY elonmuskspace241@gmail.com
  const isVerifiedAdmin = 
    currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
    currentUser?.uid === ADMIN_UID;

  // Real-time Subscriptions for Verified Admin
  useEffect(() => {
    if (!isVerifiedAdmin) return;

    // 1. Subscribe to all friend requests
    const unsubReqs = subscribeToAllFriendRequests((list) => {
      setFriendRequests(list);
    });

    // 2. Subscribe to accepted conversations
    const unsubChats = subscribeToAdminChats((convList) => {
      // Filter out deleted if desired or keep active
      const activeConvs = convList.filter(c => !c.deletedByAdmin);
      setConversations(activeConvs);
      if (!selectedConvoId && activeConvs.length > 0) {
        setSelectedConvoId(activeConvs[0].id);
      }
    });

    return () => {
      unsubReqs();
      unsubChats();
    };
  }, [isVerifiedAdmin]);

  // Subscribe to Selected Conversation Messages
  useEffect(() => {
    if (!isVerifiedAdmin || !selectedConvoId) {
      setMessages([]);
      return;
    }

    const unsub = subscribeToChatMessages(selectedConvoId, (msgs) => {
      setMessages(msgs);
    });

    // Mark conversation read for admin
    markChatAsRead(selectedConvoId, true);

    return () => unsub();
  }, [isVerifiedAdmin, selectedConvoId]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConvoId]);

  // Handlers for Authentication
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
      setLoginError('Authentication failed. Please verify administrator credentials for ' + ADMIN_EMAIL);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  // Admin Accept Friend Request
  const handleAcceptRequest = async (req: FriendRequest) => {
    if (!isVerifiedAdmin || processingReqId) return;
    setProcessingReqId(req.id);
    try {
      const convoId = await acceptFriendRequest(req, currentUser?.uid || ADMIN_UID);
      setToastMessage('Friend Request Accepted - Chat Created');
      setTimeout(() => setToastMessage(null), 3500);
      // Switch directly to Chats tab and select this new conversation
      setSelectedConvoId(convoId);
      setActiveTab('chats');
    } catch (err) {
      console.error('Failed to accept request:', err);
      alert('Could not accept request. Ensure you are signed in as ' + ADMIN_EMAIL);
    } finally {
      setProcessingReqId(null);
    }
  };

  // Admin Decline Friend Request
  const handleDeclineRequest = async (requestId: string) => {
    if (!isVerifiedAdmin || processingReqId) return;
    setProcessingReqId(requestId);
    try {
      await declineFriendRequest(requestId);
    } catch (err) {
      console.error('Failed to decline request:', err);
    } finally {
      setProcessingReqId(null);
    }
  };

  // Admin Message Input & Typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (selectedConvoId) {
      setChatTyping(selectedConvoId, true, true);
      if (adminTypingTimeoutRef.current) clearTimeout(adminTypingTimeoutRef.current);
      adminTypingTimeoutRef.current = setTimeout(() => {
        if (selectedConvoId) {
          setChatTyping(selectedConvoId, true, false);
        }
      }, 2000);
    }
  };

  // Admin Send Message
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || inputText).trim();
    if (!textToSend || !selectedConvoId || isSending) return;

    setIsSending(true);
    setInputText('');

    if (adminTypingTimeoutRef.current) clearTimeout(adminTypingTimeoutRef.current);
    setChatTyping(selectedConvoId, true, false);

    try {
      await sendChatMessage(
        selectedConvoId, 
        currentUser?.uid || ADMIN_UID, 
        textToSend, 
        true, 
        ADMIN_EMAIL
      );
    } catch (err) {
      console.error('Failed to dispatch admin message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // === 3. DELETE RULE - ONLY ADMIN ===
  // When admin deletes: set deletedByAdmin = true, but keep data for 30 days in archive
  const handleDeleteChat = async () => {
    if (!selectedConvoId || isDeleting) return;

    if (currentUser?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && currentUser?.uid !== ADMIN_UID) {
      alert('Unauthorized: Only elonmuskspace241@gmail.com can delete conversations.');
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to delete this chat?\n\n' +
      'Rule: Per platform policy, this conversation will be hidden from the visitor immediately and safely retained in the 30-day platform archive. The system never hard-deletes records automatically.'
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await adminDeleteConversation(selectedConvoId, currentUser?.email || ADMIN_EMAIL);
      setSelectedConvoId(null);
      alert('Conversation has been archived. Retained for 30 days in platform archives.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete chat');
    } finally {
      setIsDeleting(false);
    }
  };

  // Selected conversation info
  const selectedConversation = conversations.find(c => c.id === selectedConvoId);
  const visitorUid = selectedConversation?.participants?.find(p => p !== (currentUser?.uid || ADMIN_UID)) || '';
  const visitorDisplayName = selectedConversation?.participantNames?.[visitorUid] || 'Visitor';

  // Filter conversations in search
  const filteredConversations = conversations.filter((c) => {
    const vId = c.participants?.find(p => p !== (currentUser?.uid || ADMIN_UID)) || '';
    const name = (c.participantNames?.[vId] || 'Visitor').toLowerCase();
    const msg = (c.lastMessage || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || msg.includes(q) || vId.includes(q);
  });

  // Time format helper
  const formatTime = (ts: any) => {
    if (!ts) return '';
    try {
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const pendingRequestsCount = friendRequests.filter(r => r.status === 'pending').length;

  // -------------------------------------------------------------------
  // SCREEN 1: ACCESS DENIED OR LOGIN REQUIRED
  // -------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-white font-mono">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0084FF]" />
          <span>VERIFYING OWNER PERMISSIONS...</span>
        </div>
      </div>
    );
  }

  if (!isVerifiedAdmin) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-[#111111] border border-[#222222] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-3">
            <SpaceXIcon size={44} className="mx-auto" withGlow />
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-tech">
                Admin Only - Login with {ADMIN_EMAIL}
              </h2>
              <div className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                SPACE X &bull; ELON MUSK SPACE
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Only <strong>{ADMIN_EMAIL}</strong> can accept requests or delete chats.
            </p>
          </div>

          {currentUser ? (
            /* Logged in with unauthorized email */
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 space-y-3">
              <div className="flex items-center gap-2 font-bold text-red-200">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>403 FORBIDDEN — ADMIN ACCESS ONLY</span>
              </div>
              <p className="leading-relaxed">
                Currently signed in as: <strong className="text-white">{currentUser.email || 'Anonymous Visitor'}</strong>.
              </p>
              <p className="leading-relaxed text-[11px] text-gray-400">
                Per user specification, only <strong className="text-[#0084FF]">{ADMIN_EMAIL}</strong> has permission to accept friend requests or manage chats.
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
                  className="px-4 py-2 bg-[#222222] hover:bg-[#333333] text-gray-300 rounded-lg transition-colors cursor-pointer"
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            /* Not logged in */
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
                  {loggingIn ? 'Authenticating...' : 'Unlock Admin Workspace'}
                </button>
              </form>

              {/* Anonymous Note */}
              <div className="p-3 rounded-lg bg-[#0c0c0c] border border-[#1a1a1a] text-[11px] text-gray-400 text-center">
                <span className="text-gray-500">Anonymous visitor note:</span> Visitors can freely browse all website sections without signing in.
              </div>

              <div className="pt-1 text-center">
                <button
                  onClick={onClose}
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

  // -------------------------------------------------------------------
  // SCREEN 2: AUTHORIZED ADMINISTRATOR CONSOLE
  // -------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col font-sans overflow-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#0084FF] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Bar */}
      <header className="h-14 bg-[#000000] border-b border-[#222222] px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <SpaceXIcon size={28} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wider uppercase font-mono text-white flex items-center gap-1.5 font-tech">
                  ADMIN PORTAL
                </span>
                <div className="text-[10px] text-[#00C851] leading-none flex items-center gap-1 font-mono font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#00C851]"></span>
                  Online
                </div>
              </div>
              <div className="text-[10px] text-gray-400 font-mono leading-none mt-0.5">
                {ADMIN_EMAIL}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 ml-4 sm:ml-8 border-l border-[#222222] pl-3 sm:pl-6">
            
            {/* Tab 1: Friend Requests (pending) (count badge blue) */}
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'requests' 
                  ? 'bg-[#222222] text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-[#111111]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#0084FF]" />
              <span className="hidden sm:inline">Friend Requests (pending)</span>
              <span className="sm:hidden">Requests</span>
              {pendingRequestsCount > 0 && (
                <span className="bg-[#0084FF] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* Tab 2: Private Chats (count) */}
            <button
              onClick={() => setActiveTab('chats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'chats' 
                  ? 'bg-[#222222] text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-[#111111]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#0084FF]" />
              <span className="hidden sm:inline">Private Chats ({conversations.length})</span>
              <span className="sm:hidden">Chats ({conversations.length})</span>
            </button>

            {/* Tab 3: Catalogue CMS */}
            <button
              onClick={() => setActiveTab('cms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'cms' 
                  ? 'bg-[#222222] text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-[#111111]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Catalogue CMS</span>
            </button>
          </div>
        </div>

        {/* Right header actions: Logout button (black with white border) + Exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSignOut}
            title="Logout from Admin"
            className="px-3 py-1.5 bg-black text-white border border-white hover:bg-white hover:text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-mono"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          <button
            onClick={onClose}
            title="Exit to Website"
            className="px-3 py-1.5 bg-[#222222] hover:bg-[#333333] text-gray-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* TAB 1: FRIEND REQUESTS (PENDING) */}
      {/* Accept / Decline buttons ONLY visible for elonmuskspace241@gmail.com */}
      {/* ========================================================= */}
      {activeTab === 'requests' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>FRIEND REQUESTS</span>
                  <span className="text-xs bg-[#1a1a1a] text-purple-400 border border-purple-800/40 px-2 py-0.5 rounded-full font-mono">
                    {friendRequests.length} Total
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real Facebook-style friend requests submitted by visitors to chat with Elon Musk.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex gap-1.5 text-xs">
                {(['pending', 'accepted', 'declined', 'all'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setReqFilter(tab)}
                    className={`px-3 py-1 rounded-lg uppercase font-mono text-xs cursor-pointer transition-colors ${
                      reqFilter === tab 
                        ? 'bg-[#0084FF] text-white font-bold' 
                        : 'bg-[#161616] text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests List */}
            <div className="grid gap-3">
              {friendRequests
                .filter(r => reqFilter === 'all' || r.status === reqFilter)
                .map((req) => {
                  const isProcessing = processingReqId === req.id;

                  return (
                    <div 
                      key={req.id} 
                      className="bg-[#111111] border border-[#222222] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#333333] transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1e1e1e] border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                            {req.senderName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-white">{req.senderName}</span>
                            <span className="text-[10px] text-gray-500 font-mono ml-2">ID: {req.senderId.slice(-6)}</span>
                          </div>

                          <span className={`text-[10px] px-2 py-0.2 rounded uppercase font-mono ml-2 ${
                            req.status === 'accepted' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            req.status === 'declined' ? 'bg-red-950 text-red-400 border border-red-800' :
                            'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        {req.message && (
                          <p className="text-xs text-gray-300 pl-10">"{req.message}"</p>
                        )}

                        <div className="text-[10px] text-gray-500 pl-10 font-mono">
                          Target: {req.receiverEmail} &bull; {formatTime(req.createdAt)}
                        </div>
                      </div>

                      {/* Accept/Decline ONLY VISIBLE FOR elonmuskspace241@gmail.com */}
                      {req.status === 'pending' && isVerifiedAdmin && (
                        <div className="flex items-center gap-2 shrink-0 sm:self-center pl-10 sm:pl-0">
                          <button
                            onClick={() => handleAcceptRequest(req)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-[#0084FF] hover:bg-[#0070d6] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{isProcessing ? 'Accepting...' : 'Accept'}</span>
                          </button>

                          <button
                            onClick={() => handleDeclineRequest(req.id)}
                            disabled={isProcessing}
                            className="px-3.5 py-2 bg-[#222222] hover:bg-[#333333] text-gray-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

              {friendRequests.filter(r => reqFilter === 'all' || r.status === reqFilter).length === 0 && (
                <div className="p-12 text-center text-gray-500 text-xs bg-[#111111] rounded-xl border border-[#222222]">
                  No {reqFilter} friend requests found.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CHATS (ACCEPTED FRIENDSHIPS) */}
      {/* Facebook Messenger Desktop 2-Pane Layout */}
      {/* ========================================================= */}
      {activeTab === 'chats' && (
        <div className="flex-1 flex overflow-hidden bg-[#000000]">
          
          {/* Left Sidebar (320px) */}
          <aside className="w-80 sm:w-[320px] shrink-0 bg-[#000000] border-r border-[#222222] flex flex-col h-full overflow-hidden select-none">
            <div className="p-3.5 space-y-3 border-b border-[#1a1a1a]">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white tracking-tight font-sans">
                  Chats
                </h1>
                <span className="text-xs text-gray-400 font-mono">
                  {conversations.length} Friends
                </span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Messenger"
                  className="w-full bg-[#1a1a1a] text-white text-[13px] placeholder-gray-500 pl-9 pr-3 py-1.5 rounded-full border border-transparent focus:border-white/30 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#111111]">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-xs space-y-2">
                  <p>No active chats.</p>
                  <p className="text-[11px] text-gray-600">
                    Accept incoming friend requests in Tab 1 to start real human 1-on-1 conversations.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const vUid = conv.participants?.find(p => p !== (currentUser?.uid || ADMIN_UID)) || '';
                  const name = conv.participantNames?.[vUid] || 'Visitor';
                  const isSelected = conv.id === selectedConvoId;
                  const hasUnread = (conv.unreadForAdmin || 0) > 0;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConvoId(conv.id)}
                      className={`w-full p-3 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#1a1a1a]' : 'hover:bg-[#0f0f0f]'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-[#1e1e1e] border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00C851] rounded-full border-2 border-black"></span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-[13px] truncate ${hasUnread ? 'font-bold text-white' : 'font-semibold text-gray-200'}`}>
                            {name}
                          </span>
                          <span className="text-[10px] text-gray-500 ml-1 shrink-0">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-0.5">
                          <p className={`text-[12px] truncate ${hasUnread ? 'text-white font-medium' : 'text-gray-400'}`}>
                            {conv.lastMessage || 'Connected'}
                          </p>
                          {hasUnread && (
                            <span className="bg-[#0084FF] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ml-2">
                              {conv.unreadForAdmin}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-[#0a0a0a] border-t border-[#1a1a1a] text-[11px] text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00C851]"></span>
                Replying as <strong className="text-white">Elon Musk</strong>
              </span>
              <span className="text-[10px] text-gray-600 font-mono">30-day Retention</span>
            </div>
          </aside>

          {/* Right Main Chat Pane */}
          <main className="flex-1 flex flex-col h-full bg-[#000000] overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="h-14 bg-[#000000] border-b border-[#222222] px-4 flex items-center justify-between shrink-0 select-none">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-[#222222] border border-white/20 flex items-center justify-center text-white font-bold text-sm">
                        {visitorDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00C851] rounded-full border-2 border-black"></span>
                    </div>

                    <div>
                      <div className="text-[14px] font-bold text-white leading-tight flex items-center gap-2">
                        {visitorDisplayName}
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-mono">FRIEND</span>
                      </div>
                      <div className="text-[11px] text-[#00C851] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C851]"></span>
                        Active now &bull; ID: {visitorUid.slice(-6)}
                      </div>
                    </div>
                  </div>

                  {/* === 3. DELETE RULE - ONLY ADMIN ===
                      Delete Chat button (black border white text, 12px)
                  */}
                  {isVerifiedAdmin && (
                    <button
                      onClick={handleDeleteChat}
                      disabled={isDeleting}
                      title="Delete conversation (30-day archive retention)"
                      className="px-3 py-1 bg-black text-white border border-white hover:bg-[#1a1a1a] rounded-md text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer font-mono"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isDeleting ? 'Archiving...' : 'Delete Chat'}</span>
                    </button>
                  )}
                </div>

                {/* Message Thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#000000] text-[13px]">
                  <div className="text-center py-4 border-b border-[#111111] mb-2">
                    <div className="w-14 h-14 rounded-full mx-auto bg-[#1a1a1a] border border-white/20 flex items-center justify-center text-white font-extrabold text-xl mb-1.5">
                      {visitorDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-white font-bold text-base">{visitorDisplayName}</h3>
                    <p className="text-xs text-gray-500">Connected through accepted friend request</p>
                  </div>

                  {messages.map((msg) => {
                    const isAdminMsg = msg.senderEmail === ADMIN_EMAIL || msg.senderId === (currentUser?.uid || ADMIN_UID);

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-[70%]">
                          {!isAdminMsg && (
                            <div className="w-7 h-7 rounded-full bg-[#222222] border border-white/20 flex items-center justify-center text-white font-bold text-xs shrink-0 mb-1">
                              {visitorDisplayName.charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Bubble: Admin #0084FF, Visitor #303030 */}
                          <div
                            className={`px-3.5 py-2 text-[13px] leading-relaxed break-words ${
                              isAdminMsg
                                ? 'bg-[#0084FF] text-white rounded-2xl rounded-br-xs shadow-xs'
                                : 'bg-[#303030] text-white rounded-2xl rounded-bl-xs shadow-xs'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>

                        {/* Timestamp & receipts */}
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5 px-1 font-mono">
                          <span>{formatTime(msg.timestamp)}</span>
                          {isAdminMsg && (
                            <span className="flex items-center text-gray-400">
                              &bull; {msg.read ? (
                                <span className="text-[#0084FF] flex items-center gap-0.5 font-medium">
                                  <CheckCheck className="w-3 h-3" /> Seen
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Delivered
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Visitor Typing Indicator */}
                  {selectedConversation.isTypingForVisitor && (
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#222222] border border-white/20 flex items-center justify-center text-white font-bold text-xs shrink-0 mb-1">
                        {visitorDisplayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="bg-[#303030] px-3.5 py-2 rounded-2xl rounded-bl-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Reply Presets */}
                <div className="bg-[#0a0a0a] px-4 py-2 border-t border-[#1a1a1a] flex items-center gap-2 overflow-x-auto text-xs shrink-0">
                  <span className="text-[10px] text-gray-500 uppercase font-mono shrink-0">Fast Reply:</span>
                  {[
                    "Welcome! Excited to connect with you.",
                    "Starlink and SpaceX are making huge strides this year.",
                    "Let me know your thoughts on our latest technology roadmap."
                  ].map((phrase, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(undefined, phrase)}
                      className="px-2.5 py-1 bg-[#1a1a1a] hover:bg-[#252525] text-gray-300 hover:text-white rounded-full text-[11px] shrink-0 transition-colors cursor-pointer"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="bg-[#000000] border-t border-[#222222] p-3 flex items-center gap-2.5 shrink-0"
                >
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="text"
                      value={inputText}
                      onChange={handleInputChange}
                      placeholder="Aa"
                      className="w-full bg-[#222222] text-white text-[13px] placeholder-gray-500 px-4 py-2.5 rounded-full border border-transparent focus:border-white/30 focus:outline-hidden transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    title="Send as Elon Musk"
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      inputText.trim()
                        ? 'bg-[#0084FF] text-white cursor-pointer hover:scale-105 active:scale-95 shadow-md'
                        : 'text-gray-600 bg-transparent cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center text-white mb-4">
                  <MessageSquare className="w-8 h-8 text-[#0084FF]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Select a conversation</h3>
                <p className="text-xs text-gray-400 max-w-sm">
                  Accepted friends appear here. You can chat directly with visitors in real-time.
                </p>
              </div>
            )}
          </main>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CATALOGUE CMS */}
      {/* ========================================================= */}
      {activeTab === 'cms' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto">
            <AdminCMSModal
              isOpen={true}
              onClose={() => setActiveTab('requests')}
              items={items}
            />
          </div>
        </div>
      )}

    </div>
  );
};
