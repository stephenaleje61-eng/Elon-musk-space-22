import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Minus, 
  Send, 
  CheckCheck, 
  Check, 
  Clock,
  UserPlus,
  Shield,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { 
  ensureVisitorAuth, 
  sendFriendRequest,
  subscribeToVisitorFriendRequest,
  subscribeToVisitorActiveConversation,
  subscribeToChatMessages,
  sendChatMessage,
  markChatAsRead,
  setChatTyping,
  FriendRequest,
  RealConversation,
  RealChatMessage,
  ADMIN_EMAIL,
  ADMIN_UID
} from '../services/friendChatService';

interface MessengerWidgetProps {
  initialOpen?: boolean;
  onClose?: () => void;
  externalTriggerOpen?: boolean;
  initialText?: string;
}

const ELON_AVATAR = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/240px-Elon_Musk_Royal_Society_%28crop2%29.jpg';

export const MessengerWidget: React.FC<MessengerWidgetProps> = ({
  initialOpen = false,
  onClose,
  externalTriggerOpen,
  initialText
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [visitorUid, setVisitorUid] = useState<string>('');
  
  // Friend Request & Conversation state
  const [friendRequest, setFriendRequest] = useState<FriendRequest | null>(null);
  const [conversation, setConversation] = useState<RealConversation | null>(null);
  const [messages, setMessages] = useState<RealChatMessage[]>([]);
  
  // Form fields
  const [visitorName, setVisitorName] = useState<string>(() => {
    return localStorage.getItem('elon_visitor_display_name') || 'Guest';
  });
  const [requestMessage, setRequestMessage] = useState('Hi Elon, I want to connect on Elon Musk Space');
  const [inputText, setInputText] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Initialize Visitor Auth on mount
  useEffect(() => {
    ensureVisitorAuth().then(uid => setVisitorUid(uid));
  }, []);

  // Sync external open triggers (e.g. from navbar or hero buttons)
  useEffect(() => {
    if (externalTriggerOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    }
  }, [externalTriggerOpen]);

  // Set initial text if provided
  useEffect(() => {
    if (initialText && isOpen) {
      setInputText(initialText);
    }
  }, [initialText, isOpen]);

  // Subscribe to Visitor's Friend Request
  useEffect(() => {
    if (!visitorUid) return;
    const unsub = subscribeToVisitorFriendRequest(visitorUid, (req) => {
      setFriendRequest(req);
    });
    return () => unsub();
  }, [visitorUid]);

  // Subscribe to Visitor's Active Conversation (only once accepted)
  useEffect(() => {
    if (!visitorUid) return;
    const unsub = subscribeToVisitorActiveConversation(visitorUid, (convo) => {
      setConversation(convo);
    });
    return () => unsub();
  }, [visitorUid]);

  // Subscribe to Real-Time Messages when conversation is active
  useEffect(() => {
    if (!conversation?.id || !isOpen || isMinimized) return;

    const unsub = subscribeToChatMessages(conversation.id, (msgs) => {
      setMessages(msgs);
    });

    // Mark as read for visitor
    markChatAsRead(conversation.id, false);

    return () => unsub();
  }, [conversation?.id, isOpen, isMinimized]);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen && !isMinimized && conversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, conversation?.isTypingForAdmin, isOpen, isMinimized]);

  // Typing indicator broadcast
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (conversation?.id) {
      setChatTyping(conversation.id, false, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (conversation?.id) {
          setChatTyping(conversation.id, false, false);
        }
      }, 2000);
    }
  };

  // Submit Friend Request
  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingRequest) return;
    setSendingRequest(true);

    try {
      const uid = visitorUid || await ensureVisitorAuth();
      setVisitorUid(uid);
      localStorage.setItem('elon_visitor_display_name', visitorName);

      await sendFriendRequest(uid, visitorName, requestMessage);
    } catch (err) {
      console.error('Failed to send friend request:', err);
    } finally {
      setSendingRequest(false);
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !conversation?.id || !visitorUid || sendingMessage) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSendingMessage(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (conversation?.id) {
      setChatTyping(conversation.id, false, false);
    }

    try {
      await sendChatMessage(conversation.id, visitorUid, textToSend, false);
    } catch (err) {
      console.error('Error dispatching message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Format timestamp helper
  const formatTime = (ts: any) => {
    if (!ts) return '';
    try {
      const date = ts?.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const isAccepted = friendRequest?.status === 'accepted' && !!conversation;
  const isPending = friendRequest?.status === 'pending';
  const isDeclined = friendRequest?.status === 'declined';

  return (
    <>
      {/* ========================================================= */}
      {/* 1. HOMEPAGE CHAT BUTTON (Black pill, white text, green dot) */}
      {/* Label: "ADD FRIEND - CHAT ELON MUSK" */}
      {/* ========================================================= */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          aria-label="Add Friend or Chat with Elon Musk"
          className="fixed bottom-6 right-6 z-40 group cursor-pointer"
        >
          <div className="relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 bg-black text-white rounded-full border border-white/20 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200">
            {/* Green Online Dot with pulse */}
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                isPending ? 'bg-amber-400 opacity-75' : 'bg-[#00C851] opacity-75'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                isPending ? 'bg-amber-400' : 'bg-[#00C851]'
              } shadow-xs`}></span>
            </span>

            {/* Button Label */}
            <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase font-mono text-white select-none">
              {isAccepted 
                ? 'CHAT ELON MUSK' 
                : isPending 
                ? 'REQUEST PENDING &bull; ELON MUSK' 
                : 'ADD FRIEND - CHAT ELON MUSK'}
            </span>

            {/* Subtle status tag */}
            <span className="text-[10px] text-gray-400 hidden sm:inline">
              {isAccepted ? '&bull; Friends' : isPending ? '&bull; Waiting' : '&bull; Connect'}
            </span>
          </div>
        </button>
      )}

      {/* ========================================================= */}
      {/* MINIMIZED FLOATING BADGE (when visitor minimizes window) */}
      {/* ========================================================= */}
      {isOpen && isMinimized && (
        <div 
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 z-40 bg-black text-white p-3 rounded-full border border-white/20 shadow-2xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
        >
          <div className="relative">
            <img 
              src={ELON_AVATAR} 
              alt="Elon Musk" 
              className="w-10 h-10 rounded-full object-cover border border-white/30"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00C851] rounded-full border-2 border-black"></span>
          </div>
          <div className="pr-2">
            <div className="text-xs font-bold font-mono">Elon Musk</div>
            <div className="text-[10px] text-[#00C851] flex items-center gap-1">
              {isAccepted ? 'Active now' : 'Request Sent'}
            </div>
          </div>
          {conversation && (conversation.unreadForVisitor || 0) > 0 && (
            <span className="bg-[#0084FF] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {conversation.unreadForVisitor}
            </span>
          )}
          <Maximize2 className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. VISITOR WINDOW (350px wide x 450px height, #000000) */}
      {/* ========================================================= */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[350px] max-w-[calc(100vw-32px)] h-[460px] max-h-[85vh] bg-[#000000] text-white rounded-2xl border border-[#222222] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-150">
          
          {/* HEADER: Black #000000 with border-b #222222 */}
          <div className="bg-[#000000] border-b border-[#222222] px-3.5 py-2.5 flex items-center justify-between shrink-0 select-none">
            {/* Left: Avatar + "Elon Musk" 14px + green dot "Active now" */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img 
                  src={ELON_AVATAR} 
                  alt="Elon Musk" 
                  className="w-9 h-9 rounded-full object-cover border border-white/20"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00C851] rounded-full border border-black shadow-xs"></span>
              </div>
              <div>
                <div className="text-[14px] font-bold text-white leading-tight flex items-center gap-1.5 font-sans">
                  Elon Musk
                  <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded font-mono font-medium">VERIFIED</span>
                </div>
                <div className="text-[11px] text-[#00C851] font-medium flex items-center gap-1 leading-none mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C851] inline-block"></span>
                  Active now
                </div>
              </div>
            </div>

            {/* Right: Minimize _ and Close X */}
            <div className="flex items-center gap-1 text-gray-400">
              <button
                onClick={() => setIsMinimized(true)}
                title="Minimize"
                className="p-1.5 hover:text-white hover:bg-[#1a1a1a] rounded-full transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onClose) onClose();
                }}
                title="Close"
                className="p-1.5 hover:text-white hover:bg-[#1a1a1a] rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* BODY CONTENT ROUTING: 
              State A: Not sent yet -> Friend Request Form
              State B: Pending -> "Request Sent - Waiting for Elon Musk to accept"
              State C: Declined -> Retry Card
              State D: Accepted -> Active Real 1-on-1 Messenger Chat
          {/* ========================================================= */}

          {/* STATE A: NO FRIEND REQUEST SENT YET */}
          {!friendRequest && (
            <div className="flex-1 bg-[#000000] p-4 flex flex-col justify-between overflow-y-auto">
              <div className="text-center pt-2 space-y-3">
                <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2 border-white/20 shadow-md">
                  <img src={ELON_AVATAR} alt="Elon Musk" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Connect with Elon Musk</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                    Send a real friend request. Direct 1-on-1 human messaging unlocks automatically once Elon accepts.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#111111] border border-[#222222] text-left space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-[11px]">
                    <Shield className="w-3.5 h-3.5" />
                    Verified Admin Receiver: {ADMIN_EMAIL}
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Real human connection &bull; No automated chatbots &bull; Permanent Firestore storage
                  </div>
                </div>
              </div>

              {/* Friend Request Form */}
              <form onSubmit={handleSendFriendRequest} className="space-y-3 pt-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-xs focus:border-[#0084FF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Message (Optional)</label>
                  <input
                    type="text"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Hi Elon, I want to connect..."
                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-xs focus:border-[#0084FF] focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingRequest}
                  className="w-full py-2.5 bg-[#0084FF] hover:bg-[#0070d6] text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{sendingRequest ? 'Sending Request...' : 'Send Friend Request'}</span>
                </button>
              </form>
            </div>
          )}

          {/* STATE B: FRIEND REQUEST PENDING */}
          {isPending && (
            <div className="flex-1 bg-[#000000] p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                  <img src={ELON_AVATAR} alt="Elon Musk" className="w-full h-full object-cover" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-black shadow-md">
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>

              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-800">
                  REQUEST PENDING
                </span>
                <h3 className="text-white font-bold text-base mt-2">
                  Request Sent - Waiting for Elon Musk to accept
                </h3>
                <p className="text-xs text-gray-400 max-w-[260px] mx-auto leading-relaxed pt-1">
                  Your request has been routed to <strong>{ADMIN_EMAIL}</strong>. As soon as Elon clicks Accept, this window will instantly switch to direct 1-on-1 chat.
                </p>
              </div>

              <div className="w-full bg-[#111111] border border-[#222222] p-3 rounded-xl text-left space-y-1 text-xs">
                <div className="text-gray-500 text-[10px] uppercase font-mono">Sent as:</div>
                <div className="font-semibold text-white">{friendRequest.senderName}</div>
                {friendRequest.message && (
                  <div className="text-gray-400 text-[11px] italic mt-1">"{friendRequest.message}"</div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#00C851]">
                <span className="w-2 h-2 rounded-full bg-[#00C851] animate-pulse"></span>
                <span>Live listener active &bull; Auto-syncing</span>
              </div>
            </div>
          )}

          {/* STATE C: REQUEST DECLINED */}
          {isDeclined && (
            <div className="flex-1 bg-[#000000] p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-800 flex items-center justify-center text-red-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Friend Request Declined</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-[260px] mx-auto">
                  Elon Musk was unable to accept your request at this time. You may submit a new request.
                </p>
              </div>

              <button
                onClick={() => setFriendRequest(null)}
                className="px-5 py-2 bg-[#222222] hover:bg-[#333333] text-white rounded-full text-xs font-semibold cursor-pointer transition-colors"
              >
                Send New Friend Request
              </button>
            </div>
          )}

          {/* STATE D: FRIEND REQUEST ACCEPTED -> REAL 1-ON-1 CHAT */}
          {isAccepted && conversation && (
            <>
              {/* Messages Area (#000000) */}
              <div className="flex-1 bg-[#000000] overflow-y-auto p-3 space-y-2.5 text-[13px]">
                
                {/* Friendship banner */}
                <div className="text-center py-3 px-2 border-b border-[#1a1a1a] mb-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[11px] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Friends with Elon Musk on Elon Musk Space
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5">
                    Real human messages &bull; End-to-end Firestore persistence
                  </p>
                </div>

                {/* Messages list */}
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    <p>You are now connected!</p>
                    <p className="text-[10px] text-gray-600 mt-1">Send your first message to Elon.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isVisitor = msg.senderId === visitorUid;

                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-end gap-1.5 max-w-[75%]">
                          {!isVisitor && (
                            <img 
                              src={ELON_AVATAR} 
                              alt="Elon" 
                              className="w-6 h-6 rounded-full object-cover mb-1 border border-white/20 shrink-0"
                            />
                          )}

                          {/* Bubble: Visitor #0084FF, Admin #303030 */}
                          <div 
                            className={`px-3.5 py-2 text-[13px] leading-relaxed break-words ${
                              isVisitor 
                                ? 'bg-[#0084FF] text-white rounded-2xl rounded-br-xs shadow-xs' 
                                : 'bg-[#303030] text-white rounded-2xl rounded-bl-xs shadow-xs'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>

                        {/* Timestamp & Status: small gray 10px */}
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5 px-1 font-sans">
                          <span>{formatTime(msg.timestamp)}</span>
                          {isVisitor && (
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
                  })
                )}

                {/* Typing Indicator */}
                {conversation?.isTypingForAdmin && (
                  <div className="flex items-end gap-1.5">
                    <img 
                      src={ELON_AVATAR} 
                      alt="Elon" 
                      className="w-6 h-6 rounded-full object-cover mb-1 border border-white/20 shrink-0"
                    />
                    <div className="bg-[#303030] px-3.5 py-2 rounded-2xl rounded-bl-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer: Black #000000, border-t #222222 */}
              <form 
                onSubmit={handleSendMessage}
                className="bg-[#000000] border-t border-[#222222] p-2.5 flex items-center gap-2 shrink-0"
              >
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Aa"
                    className="w-full bg-[#222222] text-white text-[13px] placeholder-gray-500 px-3.5 py-2 rounded-full border border-transparent focus:border-white/30 focus:outline-hidden transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim() || sendingMessage}
                  title="Send message"
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                    inputText.trim() 
                      ? 'bg-[#0084FF] text-white cursor-pointer hover:scale-105 active:scale-95 shadow-md' 
                      : 'text-gray-600 bg-transparent cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </>
          )}

        </div>
      )}
    </>
  );
};
