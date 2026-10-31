import React, { useState } from 'react';
import { 
  Rocket, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  MessageSquare, 
  Lock, 
  FileText,
  X
} from 'lucide-react';
import { SECTIONS } from '../data/seedData';
import { SectionId } from '../types';
import { SpaceXIcon } from './SpaceXIcon';

interface FooterProps {
  onSelectSection: (id: SectionId) => void;
  onOpenChat: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectSection, onOpenChat }) => {
  const [modalPolicy, setModalPolicy] = useState<'privacy' | 'terms' | 'disclaimer' | null>(null);

  return (
    <footer className="bg-[#05070B] text-gray-400 text-xs border-t border-gray-800">
      
      {/* Upper Footer: Nine Sections & Official Portals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <SpaceXIcon size={28} />
              <div>
                <span className="font-extrabold text-base tracking-wider text-white font-tech block leading-tight">
                  ELON MUSK SPACE
                </span>
                <span className="text-[10px] text-gray-400 font-mono font-medium">
                  SPACE X
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              An independent international technology platform dedicated to exploring electric vehicles, reusable rocketry, robotics, satellite telecommunications, neural interfaces, tunneling infrastructure, and investment intelligence.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenChat}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1677FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>CHAT ELON MUSK (Operations Desk)</span>
              </button>
            </div>
          </div>

          {/* Column 1: Core Technology Sections */}
          <div className="space-y-3">
            <div className="text-white font-bold text-xs font-tech uppercase tracking-wider">
              Sections 01 - 05
            </div>
            <ul className="space-y-2">
              {SECTIONS.slice(0, 5).map(sec => (
                <li key={sec.id}>
                  <button
                    onClick={() => onSelectSection(sec.id)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {sec.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Frontier & Financial Sections */}
          <div className="space-y-3">
            <div className="text-white font-bold text-xs font-tech uppercase tracking-wider">
              Sections 06 - 09
            </div>
            <ul className="space-y-2">
              {SECTIONS.slice(5).map(sec => (
                <li key={sec.id}>
                  <button
                    onClick={() => onSelectSection(sec.id)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {sec.title}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setModalPolicy('disclaimer')}
                  className="text-amber-400 hover:text-amber-300 font-medium"
                >
                  SEC &amp; Financial Disclosures
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Official Portals */}
          <div className="space-y-3">
            <div className="text-white font-bold text-xs font-tech uppercase tracking-wider">
              Official Portals
            </div>
            <ul className="space-y-2">
              {[
                { name: 'Tesla Official', url: 'https://www.tesla.com' },
                { name: 'SpaceX Official', url: 'https://www.spacex.com' },
                { name: 'Starlink Official', url: 'https://www.starlink.com' },
                { name: 'xAI Research', url: 'https://x.ai' },
                { name: 'Neuralink BCI', url: 'https://neuralink.com' },
                { name: 'The Boring Company', url: 'https://www.boringcompany.com' },
                { name: 'X Platform', url: 'https://x.com' }
              ].map(link => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="w-3 h-3 text-gray-500" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Independence & Trademark Disclaimers */}
        <div className="mt-12 pt-8 border-t border-gray-800 space-y-3 text-[11px] text-gray-500 leading-relaxed">
          <div className="flex items-start gap-2 bg-white/5 p-4 rounded-xl border border-white/5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>LEGAL &amp; TRADEMARK DISCLAIMER:</strong> ELON MUSK SPACE is an independent news, research, and technology documentation platform. This website is not endorsed, sponsored, affiliated with, or authorized by Elon Musk, Tesla, Inc., Space Exploration Technologies Corp. (SpaceX), Starlink, xAI, Neuralink Corp., The Boring Company, or X Corp. All brand names, logos, vehicle models, and trademarks are the registered property of their respective holders. Mention of commercial products does not imply direct brokerage or authorized dealership unless explicitly stated.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} ELON MUSK SPACE. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setModalPolicy('privacy')} className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => setModalPolicy('terms')} className="hover:text-white transition-colors">
              Terms of Platform
            </button>
            <button onClick={() => setModalPolicy('disclaimer')} className="hover:text-white transition-colors">
              Risk Notice
            </button>
          </div>
        </div>
      </div>

      {/* Policy Modals */}
      {modalPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white text-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-base font-tech text-[#111111]">
                {modalPolicy === 'privacy' && 'Privacy & Data Protection Policy'}
                {modalPolicy === 'terms' && 'Terms of Use & Community Conduct'}
                {modalPolicy === 'disclaimer' && 'Securities & Regulatory Disclaimers'}
              </h4>
              <button onClick={() => setModalPolicy(null)} className="p-1 text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-2.5 max-h-72 overflow-y-auto pr-1 leading-relaxed">
              {modalPolicy === 'privacy' && (
                <>
                  <p>ELON MUSK SPACE respects your privacy. All user profile data and 1-on-1 private messaging records are secured using Cloud Firestore access control rules.</p>
                  <p>We do not sell personal data, passwords, or transaction histories. Authentication is handled by Firebase Auth, and sessions are encrypted over TLS 1.3.</p>
                </>
              )}
              {modalPolicy === 'terms' && (
                <>
                  <p>By using ELON MUSK SPACE, you agree not to submit fraudulent content, harass operators, or attempt unauthorized privilege escalation.</p>
                  <p>Content published is for informational and educational purposes. Vehicle orders, ticket bookings, or official subscriptions must be completed through official providers.</p>
                </>
              )}
              {modalPolicy === 'disclaimer' && (
                <>
                  <p>No material on this platform constitutes an offer to buy or sell securities, private shares, or derivatives. NASDAQ: TSLA performance data is sourced from verified market exchanges.</p>
                  <p>Private entities such as SpaceX and xAI are not publicly traded. Secondary market shares require qualified accredited investor verification through regulated US brokers.</p>
                </>
              )}
            </div>

            <button
              onClick={() => setModalPolicy(null)}
              className="w-full py-2 bg-[#111111] text-white text-xs font-bold rounded-xl"
            >
              Close Notice
            </button>
          </div>
        </div>
      )}

    </footer>
  );
};
