import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { RealMessage, JoinRequestItem } from '../types';
import { 
  fbAddRequest, 
  fbListenVisitorRequest, 
  fbListenMessages, 
  fbSendMsg, 
  getLocalChatBackup 
} from '../services/chatService';

interface PrivateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessageText?: string;
}

export const PrivateChatModal: React.FC<PrivateChatModalProps> = ({
  isOpen,
  onClose,
  initialMessageText
}) => {
  // Visitor ID persistent in localStorage
  const [visitorId, setVisitorId] = useState<string>('');
  const [name, setName] = useState('');
  const [loc, setLoc] = useState('');
  const [message, setMessage] = useState(initialMessageText || '');
  const [submitting, setSubmitting] = useState(false);
  
  // Real-time conversation state
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

    // Load saved visitor details if available
    const savedName = localStorage.getItem('elon_visitor_name');
    const savedLoc = localStorage.getItem('elon_visitor_loc');
    if (savedName) setName(savedName);
    if (savedLoc) setLoc(savedLoc);
  }, []);

  // Handle incoming message prefill
  useEffect(() => {
    if (initialMessageText) {
      setMessage(initialMessageText);
    }
  }, [initialMessageText]);

  // Listen to request status & messages
  useEffect(() => {
    if (!isOpen || !visitorId) return;

    // Check local backup first
    const local = getLocalChatBackup();
    const existingReq = Object.values(local.joinRequests).find(r => r.visitorId === visitorId);
    if (existingReq) {
      setRequestStatus(existingReq.status);
      if (existingReq.name) setName(existingReq.name);
      if (existingReq.loc) setLoc(existingReq.loc);
    }

    // Subscribe to Firestore for real-time join request acceptance
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
  }, [isOpen, visitorId, requestStatus]);

  // Auto-scroll chatbox
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

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
      alert('Request saved to local queue.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#050a14] text-white rounded-2xl shadow-2xl max-w-xl w-full h-[85vh] sm:h-[700px] flex flex-col overflow-hidden border border-[#1a2a4a] font-mono">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0a152a] border-b border-[#1a2a4a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#1677FF] to-[#33ddff] flex items-center justify-center text-white font-tech font-extrabold text-sm">
              EMS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white tracking-wide">
                  ELON MUSK SPACE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#33ddff]/10 text-[#33ddff] border border-[#33ddff]/30">
                  REAL HUMAN CHAT
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Direct 1-on-1 Communication with Platform Desk
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIEW 1: REQUEST FORM */}
        {requestStatus === 'none' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border border-[#1a2a4a] bg-[#0a152a] p-4 rounded-xl space-y-1">
                <div className="text-xs font-bold text-[#33ddff] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>REQUEST TO JOIN SPACE CHAT</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pt-1">
                  Connect directly with the platform operator. All messages are typed by real human participants—zero AI bots or automated scripts.
                </p>
              </div>

              <form onSubmit={handleJoinSubmit} className="space-y-3.5">
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
                    className="w-full px-3.5 py-2.5 bg-[#070e1c] border border-[#1a2a4a] text-white rounded-xl text-xs focus:outline-hidden focus:border-[#33ddff] placeholder:text-gray-600"
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
                    className="w-full px-3.5 py-2.5 bg-[#070e1c] border border-[#1a2a4a] text-white rounded-xl text-xs focus:outline-hidden focus:border-[#33ddff] placeholder:text-gray-600"
                  />
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
                    placeholder="Describe what you want to discuss with Elon Musk Space operations..."
                    className="w-full px-3.5 py-2.5 bg-[#070e1c] border border-[#1a2a4a] text-white rounded-xl text-xs focus:outline-hidden focus:border-[#33ddff] placeholder:text-gray-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#33ddff] hover:bg-[#20b8d6] disabled:opacity-50 text-[#050a14] font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#33ddff]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'SENDING REQUEST...' : 'SEND JOIN REQUEST'}</span>
                </button>
              </form>
            </div>

            <div className="text-[10px] text-gray-500 text-center pt-4">
              Your request will be delivered to the verified administrator console in real time.
            </div>
          </div>
        )}

        {/* VIEW 2: WAITING FOR ACCEPTANCE */}
        {requestStatus === 'pending' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#0a152a] border border-[#33ddff]/40 flex items-center justify-center text-[#33ddff]">
                <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#33ff66] rounded-full animate-ping"></span>
            </div>

            <div className="space-y-1.5 max-w-sm">
              <h4 className="text-base font-bold text-white tracking-wide">
                Waiting for ELON MUSK to accept your request...
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your join request has been submitted. This window will automatically update the instant the administrator accepts.
              </p>
            </div>

            <div className="p-3 bg-[#0a152a] border border-[#1a2a4a] rounded-xl text-left text-xs text-gray-300 w-full max-w-sm space-y-1">
              <div className="text-[10px] font-bold text-[#33ddff]">YOUR SUBMISSION:</div>
              <div><span className="text-gray-500">Name:</span> {name}</div>
              <div><span className="text-gray-500">Location:</span> {loc}</div>
              <div className="text-gray-400 italic text-[11px] pt-1">"{message}"</div>
            </div>

            <button
              onClick={() => setRequestStatus('none')}
              className="text-xs text-gray-500 hover:text-white underline cursor-pointer pt-2"
            >
              Cancel or Edit Request
            </button>
          </div>
        )}

        {/* VIEW 3: ACCEPTED & LIVE CHAT */}
        {requestStatus === 'accepted' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Status bar */}
            <div className="px-4 py-2 bg-[#070e1c] border-b border-[#1a2a4a] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-[#33ff66]">
                <span className="w-2 h-2 rounded-full bg-[#33ff66] animate-pulse"></span>
                <span className="font-bold">REQUEST ACCEPTED &bull; LIVE</span>
              </div>
              <span className="text-gray-500">Visitor: {name} ({loc})</span>
            </div>

            {/* Scrollable message box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#050a14]">
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

                      {/* Bubble: Visitor right side blue; Administrator left side dark background */}
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap shadow-md ${
                          isAdmin
                            ? 'bg-[#0a152a] text-white border border-[#1a2a4a] rounded-tl-xs'
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

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#0a152a] border-t border-[#1a2a4a] flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={sendingMsg}
                className="flex-1 px-4 py-2.5 bg-[#050a14] border border-[#1a2a4a] text-white rounded-xl text-xs focus:outline-hidden focus:border-[#33ddff]"
              />
              <button
                type="submit"
                disabled={sendingMsg || !chatInput.trim()}
                className="px-4 py-2.5 bg-[#33ddff] hover:bg-[#20b8d6] disabled:opacity-50 text-[#050a14] font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>

          </div>
        )}

        {/* VIEW 4: DECLINED */}
        {requestStatus === 'declined' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-gray-500" />
            <h4 className="text-sm font-bold text-white">Request Closed</h4>
            <p className="text-xs text-gray-400 max-w-xs">
              This space chat request was closed by operations. You may submit a new inquiry at any time.
            </p>
            <button
              onClick={() => setRequestStatus('none')}
              className="px-4 py-2 bg-[#1a2a4a] text-white rounded-lg text-xs font-bold"
            >
              Submit New Request
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
