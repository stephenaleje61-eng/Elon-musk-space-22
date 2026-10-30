import React from 'react';
import { 
  Rocket, 
  Car, 
  Cpu, 
  Bot, 
  Radio, 
  Brain, 
  TrendingUp, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { SectionId } from '../types';

interface WelcomeHeroProps {
  onExploreTechnology: () => void;
  onExploreProducts: () => void;
  onInvestmentInfo: () => void;
  onChatPrivately: () => void;
  onSelectSection: (id: SectionId) => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  onExploreTechnology,
  onExploreProducts,
  onInvestmentInfo,
  onChatPrivately,
  onSelectSection
}) => {
  return (
    <div className="relative overflow-hidden bg-[#05070B] text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12 sm:pb-20 relative z-10">
        
        {/* Independence & Authenticity Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-[#1677FF] animate-pulse"></span>
            <span className="font-semibold tracking-wide text-white">INDEPENDENT PLATFORM</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400 hidden sm:inline">Comprehensive Technology, Vehicles &amp; Frontier Research</span>
          </div>
        </div>

        {/* Welcome Headings */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-tech text-white leading-tight">
            WELCOME TO <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-cyan-300 to-indigo-300">ELON MUSK SPACE</span>
          </h1>

          <p className="text-base sm:text-xl font-medium text-cyan-200 tracking-wide font-tech">
            Explore Innovation. Discover Technology. Connect with the Future.
          </p>

          <p className="text-xs sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Explore electric vehicles, robotics, space exploration, artificial intelligence, satellite internet, emerging technology and investment information in one place.
          </p>

          {/* 4 Required Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onExploreTechnology}
              className="px-5 py-3 sm:px-6 sm:py-3.5 bg-[#1677FF] hover:bg-blue-600 text-white font-bold rounded-xl text-xs sm:text-sm tracking-wide shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>EXPLORE TECHNOLOGY</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreProducts}
              className="px-5 py-3 sm:px-6 sm:py-3.5 bg-white text-[#111111] hover:bg-gray-100 font-bold rounded-xl text-xs sm:text-sm tracking-wide shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Car className="w-4 h-4" />
              <span>EXPLORE PRODUCTS</span>
            </button>

            <button
              onClick={onInvestmentInfo}
              className="px-5 py-3 sm:px-6 sm:py-3.5 bg-white/10 hover:bg-white/15 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-xs sm:text-sm tracking-wide backdrop-blur-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>INVESTMENT INFORMATION</span>
            </button>

            <button
              onClick={onChatPrivately}
              className="px-5 py-3 sm:px-6 sm:py-3.5 bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold rounded-xl text-xs sm:text-sm tracking-wide shadow-xl shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHAT PRIVATELY</span>
            </button>
          </div>
        </div>

        {/* Large Cinematic Hero Showcase Visual Banner */}
        <div className="mt-12 sm:mt-16 rounded-2xl overflow-hidden border border-white/15 bg-linear-to-b from-white/10 to-transparent p-2 sm:p-3 backdrop-blur-xl shadow-2xl">
          <div className="relative rounded-xl overflow-hidden bg-black/60 aspect-16/9 sm:aspect-21/9 min-h-[300px] flex items-end">
            <img 
              src="https://images.unsplash.com/photo-1517976487507-5b3b11329241?auto=format&fit=crop&w=2000&q=85" 
              alt="SpaceX Starship, Cybertruck, and Space Exploration Showcase"
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen scale-102 transition-transform duration-1000 hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#05070B] via-[#05070B]/50 to-transparent"></div>

            {/* In-banner tech badges */}
            <div className="relative z-10 p-4 sm:p-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <span className="inline-block px-2.5 py-1 rounded bg-[#1677FF]/80 backdrop-blur-sm text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase text-white">
                  FRONTIER ECOSYSTEM
                </span>
                <h3 className="text-lg sm:text-2xl font-bold font-tech text-white">
                  Electric Vehicles &bull; Reusable Rockets &bull; Humanoid AI &bull; Orbital Broadband
                </h3>
                <p className="text-xs sm:text-sm text-gray-300">
                  Real-time engineering specifications, verified mission trackers, SEC filings, and hardware catalogues.
                </p>
              </div>

              {/* 5 quick-glance ecosystem pill counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/10">
                  <div className="font-extrabold text-blue-400 text-sm sm:text-base font-tech">9 SECTIONS</div>
                  <div className="text-[10px] text-gray-400">Deep Dives</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/10">
                  <div className="font-extrabold text-emerald-400 text-sm sm:text-base font-tech">NASDAQ: TSLA</div>
                  <div className="text-[10px] text-gray-400">Market Data</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/10">
                  <div className="font-extrabold text-purple-400 text-sm sm:text-base font-tech">OPTIMUS GEN 2</div>
                  <div className="text-[10px] text-gray-400">Robotics</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/10">
                  <div className="font-extrabold text-amber-400 text-sm sm:text-base font-tech">STARLINK</div>
                  <div className="text-[10px] text-gray-400">LEO Constellation</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400 text-center px-4">
          <Info className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span>
            Independent research &amp; technology community platform. Not authorized, sponsored, or officially affiliated with Elon Musk, Tesla, SpaceX, xAI, Neuralink, or X Corp.
          </span>
        </div>

      </div>
    </div>
  );
};
