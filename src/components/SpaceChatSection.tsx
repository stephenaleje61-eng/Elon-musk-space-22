import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Lock
} from 'lucide-react';
import { RealMessage, JoinRequestItem } from '../types';
import { 
  fbAddRequest, 
  fbListenVisitorRequest, 
  fbListenMessages, 
  fbSendMsg, 
  getLocalChatBackup 
} from '../services/chatService';

export const SpaceChatSection: React.FC = () => {
  const [visitorId, setVisitorId] = useState<string>('');
  const [name, setName] = useState('');
  const [loc, setLoc] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted' | 'declined'>('none');
  const [messages, setMessages] = useState<RealMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Visitor ID
  useEffect(() => {
    let vid = localStorage.getItem('elon_visitor_id');
    if (!vid) {
      vid = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('elon_visitor_id', vid);
    }
    setVisitorId(vid);

    const savedName = localStorage.getItem('elon_visitor_name');
    const savedLoc = localStorage.getItem('elon_visitor_loc');
    if (savedName) setName(savedName);
    if (savedLoc) setLoc(savedLoc);
  }, []);

  // Real-time synchronization
  useEffect(() => {
    if (!visitorId) return;

    // Check local backup first
    const local = getLocalChatBackup();
    const existingReq = Object.values(local.joinRequests).find(r => r.visitorId === visitorId);
    if (existingReq) {
      setRequestStatus(existingReq.status);
      if (existingReq.name) setName(existingReq.name);
      if (existingReq.loc) setLoc(existingReq.loc);
    }

    // Subscribe to Firestore for real-time join request
    const unsubRequest = fbListenVisitorRequest(visitorId, (req) => {
      if (req) {
        setRequestStatus(req.status);
        if (req.name) setName(req.name);
        if (req.loc) setLoc(req.loc);
      }
    });

    // If accepted, listen to real-time messages
    let unsubMessages = () => {};
    if (requestStatus === 'accepted' || existingReq?.status === 'accepted') {
      unsubMessages = fbListenMessages(visitorId, (msgs) => {
        setMessages(msgs);
      });
    }

    return () => {
      unsubRequest();
      unsubMessages();
    };
  }, [visitorId, requestStatus]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !loc.trim() || !message.trim() || submitting) return;

    setSubmitting(true);
    localStorage.setItem('elon_visitor_name', name.trim());
    localStorage.setItem('elon_visitor_loc', loc.trim());

    try {
      await fbAddRequest(name.trim(), loc.trim(), message.trim(), visitorId);
      setRequestStatus('pending');
    } catch (err) {
      alert('Request saved locally.');
      setRequestStatus('pending');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMsg) return;

    setSendingMsg(true);
    try {
      await fbSendMsg(visitorId, name || 'Visitor', chatInput.trim());
      setChatInput('');
    } catch (err) {
      alert('Message dispatch failed. Please retry.');
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <section id="space-chat-section" className="py-12 bg-[#050a14] text-white border-y border-[#1a2a4a] font-mono">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* VIEW 1: JOIN FORM */}
        {requestStatus === 'none' && (
          <div className="bg-[#0a152a] border border-[#1a2a4a] rounded-2xl p-6 sm:p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#33ddff]/10 border border-[#33ddff]/30 flex items-center justify-center text-[#33ddff]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                  REQUEST TO JOIN SPACE CHAT
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real Human-to-Human Communication &bull; Zero Bots &bull; Authoritative Firestore Sync
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Connect directly with the platform operator. Inquiries regarding Tesla vehicles, SpaceX flights, Starlink rollout, or technology questions are answered personally by human operators.
            </p>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name or handle..."
                    className="w-full px-4 py-2.5 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs focus:outline-hidden focus:border-[#33ddff] placeholder:text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Your Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={loc}
                    onChange={(e) => setLoc(e.target.value)}
                    placeholder="e.g. Austin, TX / Berlin / Tokyo..."
                    className="w-full px-4 py-2.5 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs focus:outline-hidden focus:border-[#33ddff] placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What would you like to discuss with Elon Musk Space operations?..."
                  className="w-full px-4 py-2.5 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs focus:outline-hidden focus:border-[#33ddff] placeholder:text-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#33ddff] hover:bg-[#20b8d6] disabled:opacity-50 text-[#050a14] font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-[#33ddff]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'DISPATCHING TO FIRESTORE...' : 'SEND JOIN REQUEST'}</span>
              </button>
            </form>
          </div>
        )}

        {/* VIEW 2: WAITING FOR ACCEPTANCE */}
        {requestStatus === 'pending' && (
          <div className="bg-[#0a152a] border border-[#1a2a4a] rounded-2xl p-8 sm:p-12 text-center space-y-5 shadow-2xl">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-2xl bg-[#050a14] border border-[#33ddff]/40 flex items-center justify-center text-[#33ddff]">
                <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#33ff66] rounded-full animate-ping"></span>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Waiting for ELON MUSK to accept your request...
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your request has been delivered to the verified administrator console. This screen will update in real time the moment the administrator clicks Accept.
              </p>
            </div>

            <div className="p-4 bg-[#050a14] border border-[#1a2a4a] rounded-xl text-left text-xs text-gray-300 max-w-md mx-auto space-y-1.5">
              <div className="text-[10px] font-bold text-[#33ddff] uppercase">RECORDED TRANSMISSION:</div>
              <div><span className="text-gray-500">Name:</span> {name}</div>
              <div><span className="text-gray-500">Location:</span> {loc}</div>
              <div className="text-gray-400 italic text-[11px] pt-1">"{message}"</div>
            </div>

            <button
              onClick={() => setRequestStatus('none')}
              className="text-xs text-gray-500 hover:text-white underline cursor-pointer"
            >
              Cancel or Submit New Request
            </button>
          </div>
        )}

        {/* VIEW 3: LIVE ACCEPTED CHAT */}
        {requestStatus === 'accepted' && (
          <div className="bg-[#0a152a] border border-[#1a2a4a] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 bg-[#050a14] border-b border-[#1a2a4a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#33ff66] animate-pulse"></span>
                <span className="font-bold text-sm text-white">
                  PRIVATE CHAT WITH ELON MUSK [ADMIN] ● LIVE
                </span>
              </div>
              <span className="text-xs text-gray-400">
                Visitor: {name} ({loc})
              </span>
            </div>

            {/* Scrollable messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#070e1c]">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500">
                  Channel established. Send your message below.
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isAdmin = m.from === 'ELON MUSK [ADMIN]';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="text-[10px] text-gray-400 mb-0.5 px-1">
                        <span className={isAdmin ? 'text-[#33ddff] font-bold' : 'text-gray-300 font-bold'}>
                          {m.from}
                        </span>
                        <span> &bull; </span>
                        <span>{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap shadow-md ${
                          isAdmin
                            ? 'bg-[#050a14] text-white border border-[#1a2a4a] rounded-tl-xs'
                            : 'bg-[#1677FF] text-white rounded-tr-xs'
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

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#050a14] border-t border-[#1a2a4a] flex gap-2">
              <input
                type="text"
                placeholder="Type your message to ELON MUSK [ADMIN]..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={sendingMsg}
                className="flex-1 px-4 py-2.5 bg-[#0a152a] border border-[#1a2a4a] text-white rounded-xl text-xs focus:outline-hidden focus:border-[#33ddff]"
              />
              <button
                type="submit"
                disabled={sendingMsg || !chatInput.trim()}
                className="px-5 py-2.5 bg-[#33ddff] hover:bg-[#20b8d6] disabled:opacity-50 text-[#050a14] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </section>
  );
};
