import React from 'react';
import { MessageSquare, Users, ShieldCheck, Zap } from 'lucide-react';
import { HumanChatSpace } from './HumanChatSpace';

export const SpaceChatSection: React.FC = () => {
  return (
    <section id="space-chat-section" className="py-12 bg-[#050a14] text-white border-y border-[#1a2a4a] font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#33ddff]/10 border border-[#33ddff]/30 flex items-center justify-center text-[#33ddff]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                ELON MUSK SPACE — HUMAN CHAT LOUNGE
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-Time Human-to-Human Messaging &bull; Persistent Firestore Database &bull; Zero Bots
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#33ff66]/10 text-[#33ff66] border border-[#33ff66]/30 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#33ff66] animate-pulse"></span>
              FIRESTORE SYNC ACTIVE
            </span>
          </div>
        </div>

        {/* Embedded Full Real-Time Human Chat Space */}
        <HumanChatSpace isModal={false} />

      </div>
    </section>
  );
};
