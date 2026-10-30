import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  UserCheck, 
  Check, 
  X, 
  Download, 
  Send, 
  Database, 
  Activity, 
  Layers, 
  ChevronRight,
  ExternalLink,
  Trash2,
  Edit3,
  Plus
} from 'lucide-react';
import { JoinRequestItem, PrivateChatItem, RealMessage, ContentItem } from '../types';
import { 
  fbListenRequests, 
  fbListenActiveChats, 
  fbListenMessages, 
  fbAccept, 
  fbDecline, 
  fbSendMsg, 
  exportAllChats 
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
  const [activeTab, setActiveTab] = useState<'requests' | 'active_chats' | 'cms'>('requests');
  const [requests, setRequests] = useState<JoinRequestItem[]>([]);
  const [activeChats, setActiveChats] = useState<PrivateChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatVisitor, setActiveChatVisitor] = useState<{ name: string; loc: string } | null>(null);
  const [messages, setMessages] = useState<RealMessage[]>([]);
  const [replyInput, setReplyInput] = useState('');
  const [sending, setSending] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Listeners
  useEffect(() => {
    const unsubRequests = fbListenRequests((reqs) => {
      setRequests(reqs);
    });

    const unsubChats = fbListenActiveChats((chats) => {
      setActiveChats(chats);
    });

    return () => {
      unsubRequests();
      unsubChats();
    };
  }, []);

  // Listen to messages of selected active chat
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const unsub = fbListenMessages(activeChatId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsub();
  }, [activeChatId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAcceptRequest = async (req: JoinRequestItem) => {
    await fbAccept(req.id, req.visitorId, req.name, req.loc, req.msg);
    setActiveChatId(req.visitorId);
    setActiveChatVisitor({ name: req.name, loc: req.loc });
    setActiveTab('active_chats');
  };

  const handleDeclineRequest = async (reqId: string) => {
    if (confirm('Decline this space join request?')) {
      await fbDecline(reqId);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeChatId || sending) return;

    setSending(true);
    try {
      await fbSendMsg(activeChatId, 'ELON MUSK [ADMIN]', replyInput.trim());
      setReplyInput('');
    } catch (err) {
      alert('Error sending reply.');
    } finally {
      setSending(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAllChats();
    } catch (err) {
      alert('Failed to export chat logs.');
    } finally {
      setExporting(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-[#050a14] text-gray-200 font-mono flex flex-col">
      
      {/* Top Admin Header Bar */}
      <header className="border-b border-[#1a2a4a] bg-[#0a152a] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#33ddff]/10 border border-[#33ddff]/40 flex items-center justify-center text-[#33ddff]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-wider">
                ELON MUSK [ADMIN]
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#33ff66]/10 text-[#33ff66] border border-[#33ff66]/30">
                DIRECT ACCESS ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-gray-400 flex items-center gap-2">
              <span>ELONMUSKSPACE241@GMAIL.COM</span>
              <span>&bull;</span>
              <span className="text-[#33ddff]">AUTHENTICATED</span>
            </div>
          </div>
        </div>

        {/* Clock & Action Buttons */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#050a14] border border-[#1a2a4a] text-gray-300">
            <Clock className="w-3.5 h-3.5 text-[#33ddff]" />
            <span className="font-mono text-[11px]">{currentTime || 'SYNCING UTC...'}</span>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-3.5 py-2 bg-[#1a2a4a] hover:bg-[#253966] text-[#33ddff] hover:text-white border border-[#33ddff]/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'EXPORTING...' : 'EXPORT ALL CHATS'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-2 bg-[#ff3366]/20 hover:bg-[#ff3366]/30 text-[#ff3366] border border-[#ff3366]/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            EXIT DASHBOARD
          </button>
        </div>
      </header>

      {/* Dashboard Statistics Strip */}
      <section className="bg-[#070e1c] border-b border-[#1a2a4a] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#0a152a] p-3 rounded-lg border border-[#1a2a4a] flex items-center justify-between">
            <span className="text-gray-400">MODE</span>
            <span className="text-[#33ff66] font-bold">REAL CHAT</span>
          </div>
          <div className="bg-[#0a152a] p-3 rounded-lg border border-[#1a2a4a] flex items-center justify-between">
            <span className="text-gray-400">REQUESTS</span>
            <span className="text-[#33ddff] font-bold">{pendingRequests.length} PENDING</span>
          </div>
          <div className="bg-[#0a152a] p-3 rounded-lg border border-[#1a2a4a] flex items-center justify-between">
            <span className="text-gray-400">ACTIVE</span>
            <span className="text-white font-bold">{activeChats.length} CONVERSATIONS</span>
          </div>
          <div className="bg-[#0a152a] p-3 rounded-lg border border-[#1a2a4a] flex items-center justify-between">
            <span className="text-gray-400">STORAGE</span>
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-[#33ddff]" /> FIRESTORE
            </span>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-6">
        <div className="flex border-b border-[#1a2a4a] gap-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-[#0a152a] text-[#33ddff] border-t-2 border-[#33ddff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>SPACE JOIN REQUESTS ({pendingRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('active_chats')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'active_chats'
                ? 'bg-[#0a152a] text-[#33ddff] border-t-2 border-[#33ddff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>ACTIVE CONVERSATIONS ({activeChats.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'cms'
                ? 'bg-[#0a152a] text-[#33ddff] border-t-2 border-[#33ddff]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>CATALOGUE CMS ({items.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 flex flex-col">
        
        {/* TAB 1: SPACE JOIN REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Incoming Space Chat Join Requests</span>
              </h2>
              <span className="text-xs text-gray-400">Real-time sync via Cloud Firestore</span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="bg-[#0a152a] border border-[#1a2a4a] rounded-xl p-12 text-center text-gray-500 space-y-2">
                <Activity className="w-8 h-8 text-[#33ddff]/40 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No pending join requests</p>
                <p className="text-xs">Visitor requests from the homepage will appear here instantly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#0a152a] border border-[#1a2a4a] rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-[#33ddff]/50 transition-all shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white text-sm">{req.name}</span>
                        <span className="text-[#33ddff] bg-[#33ddff]/10 px-2 py-0.5 rounded text-[11px]">
                          📍 {req.loc}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Submitted: {new Date(req.time).toLocaleString()}
                      </div>
                      <div className="p-3 rounded-lg bg-[#050a14] border border-[#1a2a4a] text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                        "{req.msg}"
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#1a2a4a]">
                      <button
                        onClick={() => handleAcceptRequest(req)}
                        className="flex-1 py-2 bg-[#33ff66] hover:bg-[#28d954] text-[#050a14] font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>ACCEPT &amp; OPEN CHAT</span>
                      </button>

                      <button
                        onClick={() => handleDeclineRequest(req.id)}
                        className="px-4 py-2 bg-[#ff3366]/20 hover:bg-[#ff3366]/30 text-[#ff3366] border border-[#ff3366]/40 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        DECLINE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE CONVERSATIONS & PRIVATE CHAT */}
        {activeTab === 'active_chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[550px]">
            
            {/* Conversations List */}
            <div className="lg:col-span-1 bg-[#0a152a] border border-[#1a2a4a] rounded-xl p-4 flex flex-col space-y-3">
              <div className="text-xs font-bold text-[#33ddff] uppercase tracking-wider px-1">
                Active Channels ({activeChats.length})
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {activeChats.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-500">
                    No active conversations accepted yet.
                  </div>
                ) : (
                  activeChats.map((chat) => {
                    const isSelected = activeChatId === chat.visitorId;
                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setActiveChatId(chat.visitorId);
                          setActiveChatVisitor({ name: chat.name, loc: chat.loc });
                        }}
                        className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1a2a4a] border-[#33ddff] text-white shadow-md'
                            : 'bg-[#050a14] border-[#1a2a4a] text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{chat.name}</span>
                          <span className="text-[10px] text-gray-400">{chat.loc}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-1">
                          {chat.lastMsg || 'Chat initialized'}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2">
                          <span>{new Date(chat.lastTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[#33ddff] font-semibold flex items-center gap-1">
                            OPEN PRIVATE CHAT &rarr;
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Private 1-on-1 Chat Area */}
            <div className="lg:col-span-2 bg-[#0a152a] border border-[#1a2a4a] rounded-xl flex flex-col overflow-hidden">
              {activeChatId && activeChatVisitor ? (
                <>
                  {/* Private Chat Header */}
                  <div className="p-4 bg-[#050a14] border-b border-[#1a2a4a] flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>PRIVATE CHAT WITH {activeChatVisitor.name.toUpperCase()} ({activeChatVisitor.loc.toUpperCase()})</span>
                        <span className="w-2 h-2 rounded-full bg-[#33ff66] animate-pulse"></span>
                        <span className="text-[11px] text-[#33ff66] font-bold">● LIVE</span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Direct encrypted human-to-human channel
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveChatId(null);
                        setActiveChatVisitor(null);
                      }}
                      className="px-3 py-1.5 bg-[#1a2a4a] hover:bg-gray-700 text-gray-300 hover:text-white text-xs rounded-lg transition-colors"
                    >
                      CLOSE
                    </button>
                  </div>

                  {/* Scrollable Chatbox (~55vh) */}
                  <div className="h-[55vh] overflow-y-auto p-4 space-y-3 bg-[#070e1c]">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-xs text-gray-500">
                        No messages yet in this private conversation.
                      </div>
                    ) : (
                      messages.map((m, idx) => {
                        const isAdmin = m.from === 'ELON MUSK [ADMIN]';
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                          >
                            <div className="text-[10px] text-gray-400 mb-0.5 px-1">
                              <span className={isAdmin ? 'text-[#33ddff] font-bold' : 'text-gray-300 font-bold'}>
                                {m.from}
                              </span>
                              <span> &bull; </span>
                              <span>{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div
                              className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                                isAdmin
                                  ? 'bg-[#1a2a4a] text-white border border-[#33ddff]/40 rounded-tr-xs'
                                  : 'bg-[#0055ff] text-white rounded-tl-xs'
                              }`}
                            >
                              {m.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Admin Reply Input */}
                  <form onSubmit={handleSendAdminReply} className="p-3 bg-[#050a14] border-t border-[#1a2a4a] flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your private reply as ELON MUSK [ADMIN]..."
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      disabled={sending}
                      className="flex-1 px-4 py-2.5 bg-[#0a152a] border border-[#1a2a4a] text-white rounded-xl text-xs focus:outline-hidden focus:border-[#33ddff]"
                    />
                    <button
                      type="submit"
                      disabled={sending || !replyInput.trim()}
                      className="px-5 py-2.5 bg-[#33ddff] hover:bg-[#20b8d6] disabled:opacity-50 text-[#050a14] font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>SEND AS ELON MUSK [ADMIN]</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500 space-y-2">
                  <MessageSquare className="w-10 h-10 text-[#1a2a4a]" />
                  <p className="text-sm font-bold text-gray-300">Select an active conversation</p>
                  <p className="text-xs max-w-xs">
                    Choose any visitor on the left to review messages and type replies directly.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: CATALOGUE CMS */}
        {activeTab === 'cms' && (
          <div className="space-y-4">
            <AdminCMSModal
              isOpen={true}
              onClose={() => setActiveTab('requests')}
              items={items}
            />
          </div>
        )}

      </main>
    </div>
  );
};
