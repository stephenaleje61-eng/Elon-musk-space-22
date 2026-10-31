import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Search, 
  Circle, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  Image as ImageIcon, 
  ArrowLeft, 
  Edit2, 
  Clock, 
  ShieldCheck, 
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  ChatUser, 
  RealConversation, 
  RealMessageItem 
} from '../types';
import { 
  registerOrUpdateUser, 
  setUserOnlineStatus, 
  subscribeToUsers, 
  subscribeToUserConversations, 
  getOrCreateConversation, 
  sendHumanMessage, 
  subscribeToConversationMessages, 
  markMessagesAsRead, 
  reportAbusiveMessage 
} from '../services/chatService';
import { auth } from '../lib/firebase';

interface HumanChatSpaceProps {
  initialSubject?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const HumanChatSpace: React.FC<HumanChatSpaceProps> = ({
  initialSubject,
  isModal = false,
  onClose
}) => {
  // Visitor Persistent Identity
  const [visitorId] = useState<string>(() => {
    let vid = localStorage.getItem('elon_visitor_id');
    if (!vid) {
      vid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('elon_visitor_id', vid);
    }
    return vid;
  });

  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem('elon_visitor_name') || '';
  });

  const [nameInput, setNameInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(!displayName);

  // Registered state
  const [myUser, setMyUser] = useState<ChatUser | null>(null);

  // Directory & Conversations
  const [sidebarTab, setSidebarTab] = useState<'users' | 'conversations'>('users');
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [conversations, setConversations] = useState<RealConversation[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Active Chat Session
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeOtherUser, setActiveOtherUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<RealMessageItem[]>([]);
  
  // Message inputs
  const [messageText, setMessageText] = useState(initialSubject || '');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Reporting modal
  const [reportingMessage, setReportingMessage] = useState<RealMessageItem | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize and register user
  useEffect(() => {
    if (displayName.trim()) {
      registerOrUpdateUser(visitorId, displayName.trim()).then((u) => {
        setMyUser(u);
        localStorage.setItem('elon_visitor_name', displayName.trim());
      });
    }
  }, [visitorId, displayName]);

  // 2. Presence handling
  useEffect(() => {
    if (!visitorId) return;

    setUserOnlineStatus(visitorId, true);

    const handleBeforeUnload = () => {
      setUserOnlineStatus(visitorId, false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setUserOnlineStatus(visitorId, false);
    };
  }, [visitorId]);

  // 3. Listen to all registered chat users
  useEffect(() => {
    const unsub = subscribeToUsers((users) => {
      setAllUsers(users);
      // Update my user object in case suspended
      const me = users.find(u => u.userId === visitorId);
      if (me) setMyUser(me);
    });
    return () => unsub();
  }, [visitorId]);

  // 4. Listen to my conversations
  useEffect(() => {
    if (!visitorId) return;
    const unsub = subscribeToUserConversations(visitorId, (convs) => {
      setConversations(convs);
    });
    return () => unsub();
  }, [visitorId]);

  // 5. Listen to messages of active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const unsub = subscribeToConversationMessages(activeConversationId, (msgs) => {
      setMessages(msgs);
      // Mark received messages as read
      markMessagesAsRead(activeConversationId, visitorId);
    });

    return () => unsub();
  }, [activeConversationId, visitorId]);

  // Auto scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Display Name Setup
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const trimmed = nameInput.trim();
    setDisplayName(trimmed);
    localStorage.setItem('elon_visitor_name', trimmed);
    const u = await registerOrUpdateUser(visitorId, trimmed);
    setMyUser(u);
    setIsEditingName(false);
  };

  // Open Conversation with Selected User
  const handleSelectUser = async (targetUser: ChatUser) => {
    if (!myUser) {
      setIsEditingName(true);
      return;
    }

    if (targetUser.userId === visitorId) {
      alert('You cannot start a direct conversation with yourself. Select another registered member.');
      return;
    }

    try {
      const convId = await getOrCreateConversation(myUser, targetUser);
      setActiveConversationId(convId);
      setActiveOtherUser(targetUser);
    } catch (err) {
      console.error('Failed to open channel:', err);
    }
  };

  // Select existing conversation
  const handleSelectConversation = (conv: RealConversation) => {
    const otherId = conv.participants.find(p => p !== visitorId) || '';
    const otherDetails = conv.participantDetails?.[otherId];
    
    setActiveConversationId(conv.id);
    setActiveOtherUser({
      userId: otherId,
      displayName: otherDetails?.displayName || `User_${otherId.slice(-4)}`,
      photoURL: otherDetails?.photoURL || '',
      online: allUsers.find(u => u.userId === otherId)?.online || false,
      lastSeen: allUsers.find(u => u.userId === otherId)?.lastSeen || '',
      createdAt: ''
    });
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageText.trim() && !imageUrlInput.trim()) || sending || !activeConversationId || !activeOtherUser) {
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      await sendHumanMessage(
        activeConversationId,
        visitorId,
        activeOtherUser.userId,
        myUser?.displayName || displayName || 'Visitor',
        messageText.trim(),
        imageUrlInput.trim() || undefined
      );

      setMessageText('');
      setImageUrlInput('');
      setShowImageInput(false);
    } catch (err: any) {
      setSendError(err.message || 'Failed to dispatch message to Firestore.');
    } finally {
      setSending(false);
    }
  };

  // Submit Abuse Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingMessage || !reportReason.trim()) return;

    try {
      await reportAbusiveMessage(
        visitorId,
        displayName || 'Anonymous',
        reportingMessage.senderId,
        reportingMessage.conversationId,
        reportingMessage.id,
        reportingMessage.text,
        reportReason.trim()
      );
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportingMessage(null);
        setReportReason('');
      }, 2000);
    } catch (err) {
      alert('Failed to submit report.');
    }
  };

  // Filtered directory users
  const otherUsers = allUsers.filter(u => u && u.userId !== visitorId);
  const filteredUsers = otherUsers.filter(u => {
    const name = (u?.displayName || u?.userId || '').toLowerCase();
    const query = (userSearch || '').trim().toLowerCase();
    return !query || name.includes(query);
  });

  return (
    <div className={`bg-[#050a14] text-white flex flex-col font-mono overflow-hidden ${
      isModal ? 'h-full rounded-2xl border border-[#1a2a4a]' : 'rounded-2xl border border-[#1a2a4a] shadow-2xl h-[650px] sm:h-[720px]'
    }`}>
      
      {/* Top Header Bar */}
      <header className="px-5 py-3.5 bg-[#0a152a] border-b border-[#1a2a4a] flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#1677FF] to-[#33ddff] flex items-center justify-center text-white font-extrabold text-sm shadow-md">
            EMS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide text-white">
                ELON MUSK SPACE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#33ff66]/10 text-[#33ff66] border border-[#33ff66]/30">
                REAL HUMAN CHAT &bull; LIVE
              </span>
            </div>
            <div className="text-[11px] text-gray-400 flex items-center gap-2">
              <span>Your Handle:</span>
              <strong className="text-[#33ddff]">{displayName || 'Set Display Name'}</strong>
              <button
                onClick={() => {
                  setNameInput(displayName);
                  setIsEditingName(true);
                }}
                className="text-gray-400 hover:text-white transition-colors"
                title="Edit Display Name"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Display Name Setup Banner / Overlay */}
      {isEditingName && (
        <div className="p-4 bg-[#0a152a] border-b border-[#1a2a4a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4 text-[#33ddff] shrink-0" />
            <span>Choose your public chat handle so other community members can recognize you:</span>
          </div>

          <form onSubmit={handleSaveName} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              required
              maxLength={24}
              placeholder="e.g. StarlinkPioneer"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="px-3 py-1.5 bg-[#050a14] border border-[#1a2a4a] text-white rounded-lg text-xs focus:outline-hidden focus:border-[#33ddff]"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#33ddff] hover:bg-[#20b8d6] text-[#050a14] font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
            >
              Save Handle
            </button>
            {displayName && (
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="px-3 py-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg text-xs"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      )}

      {/* Main Grid: Left Directory / Right Chat Window */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
        
        {/* LEFT COLUMN: ACTIVE USERS & MY CONVERSATIONS */}
        <aside className={`md:col-span-1 border-r border-[#1a2a4a] bg-[#070e1c] flex flex-col overflow-hidden ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Tabs */}
          <div className="flex border-b border-[#1a2a4a] bg-[#0a152a] text-xs">
            <button
              onClick={() => setSidebarTab('users')}
              className={`flex-1 py-2.5 px-3 font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                sidebarTab === 'users'
                  ? 'border-[#33ddff] text-[#33ddff] bg-[#050a14]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>COMMUNITY ({otherUsers.length})</span>
            </button>

            <button
              onClick={() => setSidebarTab('conversations')}
              className={`flex-1 py-2.5 px-3 font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                sidebarTab === 'conversations'
                  ? 'border-[#33ddff] text-[#33ddff] bg-[#050a14]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>CHANNELS ({conversations.length})</span>
            </button>
          </div>

          {/* Search Bar for Community */}
          {sidebarTab === 'users' && (
            <div className="p-3 border-b border-[#1a2a4a]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Find registered member..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#050a14] border border-[#1a2a4a] text-white rounded-lg text-xs placeholder:text-gray-600 focus:outline-hidden focus:border-[#33ddff]"
                />
              </div>
            </div>
          )}

          {/* List Area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {sidebarTab === 'users' ? (
              filteredUsers.length === 0 ? (
                <div className="text-center py-12 px-4 text-xs text-gray-500 space-y-2">
                  <Users className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="font-semibold text-gray-400">No other users online yet</p>
                  <p className="text-[11px] leading-relaxed">
                    Open this app in a second browser tab or mobile device to test live two-way human messaging!
                  </p>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = activeOtherUser?.userId === u.userId;
                  return (
                    <div
                      key={u.userId}
                      onClick={() => handleSelectUser(u)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#1a2a4a] border-[#33ddff] text-white'
                          : 'bg-[#0a152a] border-[#1a2a4a] text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="relative shrink-0">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#1677FF] to-[#33ddff] flex items-center justify-center font-bold text-white text-xs">
                            {(u.displayName || u.userId || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a152a] ${
                            u.online ? 'bg-[#33ff66]' : 'bg-gray-500'
                          }`}></span>
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-xs text-white truncate">{u.displayName || u.userId || 'Anonymous Member'}</div>
                          <div className="text-[10px] text-gray-400">
                            {u.online ? 'Online now' : `Seen ${new Date(u.lastSeen || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </div>
                        </div>
                      </div>

                      <button
                        className="px-2.5 py-1 bg-[#1677FF] hover:bg-blue-600 text-white rounded text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        Chat &rarr;
                      </button>
                    </div>
                  );
                })
              )
            ) : (
              /* Channels Tab */
              conversations.length === 0 ? (
                <div className="text-center py-12 px-4 text-xs text-gray-500 space-y-2">
                  <MessageSquare className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="font-semibold text-gray-400">No active channels</p>
                  <p className="text-[11px]">Select a user from the Community tab to start a conversation.</p>
                </div>
              ) : (
                conversations.map((c) => {
                  const otherId = c.participants.find(p => p !== visitorId) || '';
                  const other = c.participantDetails?.[otherId];
                  const isSelected = activeConversationId === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectConversation(c)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1a2a4a] border-[#33ddff] text-white'
                          : 'bg-[#0a152a] border-[#1a2a4a] text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white truncate">
                          {other?.displayName || `User_${otherId.slice(-4)}`}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(c.lastMessageAt || c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-1">
                        {c.lastMessage || 'Channel established'}
                      </p>
                    </div>
                  );
                })
              )
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: REAL-TIME CONVERSATION CHATBOX */}
        <main className={`md:col-span-2 flex flex-col bg-[#050a14] overflow-hidden ${
          !activeConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          {activeConversationId && activeOtherUser ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3 sm:p-4 bg-[#0a152a] border-b border-[#1a2a4a] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConversationId(null)}
                    className="md:hidden p-1 text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#1677FF] to-[#33ddff] flex items-center justify-center font-bold text-white text-xs shadow-sm">
                      {(activeOtherUser.displayName || activeOtherUser.userId || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a152a] ${
                      activeOtherUser.online ? 'bg-[#33ff66] animate-pulse' : 'bg-gray-500'
                    }`}></span>
                  </div>

                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{activeOtherUser.displayName || activeOtherUser.userId || 'Member'}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        activeOtherUser.online ? 'bg-[#33ff66]/10 text-[#33ff66]' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {activeOtherUser.online ? '● ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      Persistent Channel: {activeConversationId.slice(0, 16)}...
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 hidden sm:block">
                  Direct encrypted human connection
                </div>
              </div>

              {/* Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#070e1c]">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-xs text-gray-500 space-y-2">
                    <MessageSquare className="w-8 h-8 text-[#1a2a4a] mx-auto" />
                    <p className="font-semibold text-gray-300">Channel Ready</p>
                    <p className="text-[11px]">Type your message below. Messages are saved permanently in Cloud Firestore.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === visitorId;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-0.5 px-1">
                          <span className={isMe ? 'text-[#33ddff] font-bold' : 'text-gray-300 font-bold'}>
                            {m.senderName}
                          </span>
                          <span>&bull;</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                          {/* Report Button on received messages */}
                          {!isMe && (
                            <button
                              onClick={() => setReportingMessage(m)}
                              className="text-gray-600 hover:text-red-400 transition-colors ml-1"
                              title="Report abusive message"
                            >
                              <AlertTriangle className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap shadow-md ${
                            isMe
                              ? 'bg-[#1677FF] text-white rounded-tr-xs'
                              : 'bg-[#0a152a] text-gray-100 border border-[#1a2a4a] rounded-tl-xs'
                          }`}
                        >
                          {m.text}

                          {m.imageUrl && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-white/20">
                              <img src={m.imageUrl} alt="attachment" className="max-w-full max-h-60 object-cover" />
                            </div>
                          )}

                          {/* Message Delivery Status Indicator */}
                          {isMe && (
                            <div className="flex justify-end items-center gap-1 mt-1 text-[10px] text-blue-200">
                              {m.status === 'read' ? (
                                <span className="flex items-center gap-0.5 text-cyan-300" title="Read by recipient">
                                  <CheckCheck className="w-3 h-3" />
                                  <span>Read</span>
                                </span>
                              ) : m.status === 'delivered' ? (
                                <span className="flex items-center gap-0.5 text-blue-200" title="Delivered to server">
                                  <CheckCheck className="w-3 h-3" />
                                  <span>Delivered</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5 text-blue-300" title="Sent">
                                  <Check className="w-3 h-3" />
                                  <span>Sent</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Error warning if suspension or failure */}
              {sendError && (
                <div className="px-4 py-2 bg-red-950/70 border-t border-red-800 text-xs text-red-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{sendError}</span>
                  </div>
                  <button onClick={() => setSendError(null)} className="text-gray-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Image URL Input Drawer */}
              {showImageInput && (
                <div className="p-2.5 bg-[#0a152a] border-t border-[#1a2a4a] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#33ddff]" />
                  <input
                    type="url"
                    placeholder="Paste image URL (https://images.unsplash.com/...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-[#050a14] border border-[#1a2a4a] text-white rounded-lg text-xs"
                  />
                  <button
                    onClick={() => setShowImageInput(false)}
                    className="px-2 py-1 text-gray-400 hover:text-white text-xs"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#0a152a] border-t border-[#1a2a4a] flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className={`p-2 rounded-xl transition-colors ${
                    showImageInput || imageUrlInput ? 'bg-[#33ddff] text-[#050a14]' : 'bg-[#050a14] text-gray-400 hover:text-white border border-[#1a2a4a]'
                  }`}
                  title="Attach Image URL"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder={`Message ${activeOtherUser.displayName || 'Member'}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sending || myUser?.isSuspended}
                  className="flex-1 px-4 py-2.5 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs focus:outline-hidden focus:border-[#33ddff] disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={sending || (!messageText.trim() && !imageUrlInput.trim()) || myUser?.isSuspended}
                  className="px-5 py-2.5 bg-[#33ddff] hover:bg-[#20b8d6] disabled:opacity-40 text-[#050a14] font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </>
          ) : (
            /* Empty state when no chat is selected */
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0a152a] border border-[#1a2a4a] flex items-center justify-center text-[#33ddff]">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-base font-bold text-white tracking-wide">
                  Real Human Chat Space
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Connect with real members across the world. Select any registered user from the community list to start a 1-on-1 real-time conversation.
                </p>
              </div>

              {otherUsers.length > 0 && (
                <button
                  onClick={() => handleSelectUser(otherUsers[0])}
                  className="px-4 py-2 bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Chat with {otherUsers[0].displayName || otherUsers[0].userId || 'Member'} &rarr;
                </button>
              )}
            </div>
          )}
        </main>

      </div>

      {/* REPORT MODAL */}
      {reportingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#0a152a] border border-[#1a2a4a] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>REPORT ABUSIVE MESSAGE</span>
              </div>
              <button
                onClick={() => setReportingMessage(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#050a14] rounded-lg text-xs text-gray-300 border border-[#1a2a4a] space-y-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase">FLAGGED TEXT:</span>
              <p className="italic text-gray-200">"{reportingMessage.text}"</p>
            </div>

            {reportSuccess ? (
              <div className="p-3 rounded-lg bg-emerald-950/60 text-emerald-300 text-xs text-center font-bold">
                ✓ Report delivered to platform owner for review.
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Reason for report:
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#050a14] border border-[#1a2a4a] text-white rounded-lg text-xs"
                  >
                    <option value="">Select violation reason...</option>
                    <option value="Harassment or abusive language">Harassment or abusive language</option>
                    <option value="Spam or fraudulent financial offer">Spam or fraudulent financial offer</option>
                    <option value="Inappropriate or illegal content">Inappropriate or illegal content</option>
                    <option value="Impersonation of official company personnel">Impersonation of official company personnel</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingMessage(null)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg"
                  >
                    Submit Report to Owner
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
