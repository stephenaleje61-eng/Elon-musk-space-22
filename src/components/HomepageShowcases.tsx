import React from 'react';
import { 
  ContentItem, 
  SectionId, 
  SavedItem 
} from '../types';
import { 
  Zap, 
  ArrowRight, 
  Bot, 
  Rocket, 
  Wifi, 
  Cpu, 
  Brain, 
  TrendingUp, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { VEHICLE_COMPARISONS } from '../data/seedData';

interface HomepageShowcasesProps {
  items: ContentItem[];
  onSelectSection: (id: SectionId) => void;
  onSelectItem: (item: ContentItem) => void;
  savedItems: SavedItem[];
  onToggleSave: (item: ContentItem) => void;
  onOpenChat: () => void;
  onOpenVehicleComparison: () => void;
}

export const HomepageShowcases: React.FC<HomepageShowcasesProps> = ({
  items,
  onSelectSection,
  onSelectItem,
  savedItems,
  onToggleSave,
  onOpenChat,
  onOpenVehicleComparison
}) => {
  const featuredVehicles = items.filter(i => i.sectionId === 'tesla-clean-energy' && i.isFeatured);
  const featuredRobotics = items.filter(i => i.sectionId === 'robots-robotics');
  const featuredSpace = items.filter(i => i.sectionId === 'space-rockets');
  const featuredStarlink = items.filter(i => i.sectionId === 'starlink-internet');
  const featuredAI = items.filter(i => i.sectionId === 'artificial-intelligence');

  return (
    <div className="space-y-16 py-12">
      
      {/* 1. FEATURED ELECTRIC VEHICLES & CLEAN ENERGY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#E82127] flex items-center gap-1.5 mb-1">
              <Zap className="w-4 h-4" />
              <span>PASSENGER, COMMERCIAL &amp; ENERGY STORAGE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-tech text-[#111111]">
              Tesla Vehicle Fleet &amp; Energy Architecture
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
              From the 1.99s Model S Plaid and Cybertruck Cyberbeast to the 500-mile Semi tractor and Powerwall 3.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenVehicleComparison}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Compare Models</span>
            </button>
            <button
              onClick={() => onSelectSection('tesla-clean-energy')}
              className="px-4 py-2 bg-[#1677FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore All Vehicles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredVehicles.slice(0, 3).map(vehicle => {
            const isSaved = savedItems.some(s => s.itemId === vehicle.id);
            return (
              <div
                key={vehicle.id}
                onClick={() => onSelectItem(vehicle)}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
              >
                <div>
                  <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-900">
                    <img
                      src={vehicle.images[0]}
                      alt={vehicle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded">
                      {vehicle.category}
                    </div>
                    {vehicle.price && (
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-gray-900 font-tech font-extrabold text-xs px-2.5 py-1 rounded-md shadow-xs">
                        {vehicle.price}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(vehicle);
                      }}
                      className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                        isSaved ? 'bg-[#1677FF] text-white' : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="font-extrabold text-base text-[#111111] font-tech group-hover:text-[#1677FF] transition-colors">
                      {vehicle.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                      {vehicle.description}
                    </p>

                    {/* Specs highlight */}
                    {vehicle.specifications && (
                      <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px]">
                        {Object.entries(vehicle.specifications).slice(0, 2).map(([k, v]) => (
                          <div key={k} className="bg-gray-50 p-2 rounded-lg truncate">
                            <span className="text-gray-400 block text-[9px] uppercase font-mono">{k}</span>
                            <span className="font-semibold text-gray-800 truncate block">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between text-xs text-[#1677FF] font-bold">
                  <span>View Specifications &rarr;</span>
                  <span className="text-[10px] text-gray-400 font-normal">Verified Specs</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. ROBOTICS & HUMANOID SHOWCASE (Optimus Highlight) */}
      <section className="bg-[#05070B] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#1677FF] text-xs font-mono font-bold">
                <Bot className="w-4 h-4 text-blue-400" />
                <span>SECTION 02 &bull; AUTONOMOUS BIPEDAL HARDWARE</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-tech text-white leading-tight">
                Tesla Optimus Gen 2 Humanoid Robotics
              </h2>

              <p className="text-xs sm:text-base text-gray-300 leading-relaxed">
                Engineered with 100% custom Tesla-designed actuators, high-bandwidth force sensors, 22-degree-of-freedom hands with tactile fingers, and vision neural networks trained on end-to-end autonomy.
              </p>

              {/* Technical specs highlight list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] text-gray-400 font-mono">WEIGHT</div>
                  <div className="font-bold text-white text-sm mt-0.5">125 lbs (57 kg)</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] text-gray-400 font-mono">WALKING SPEED</div>
                  <div className="font-bold text-white text-sm mt-0.5">5 mph (+30%)</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                  <div className="text-[10px] text-gray-400 font-mono">HAND FREEDOM</div>
                  <div className="font-bold text-white text-sm mt-0.5">11 DOF Tactile</div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => onSelectSection('robots-robotics')}
                  className="px-5 py-2.5 bg-[#1677FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  <span>Explore Robotics Section</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenChat}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/15"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Ask Operations About Optimus</span>
                </button>
              </div>
            </div>

            {/* Visual Box */}
            <div className="relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 border border-white/15 shadow-2xl bg-gray-900">
              <img
                src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80"
                alt="Optimus Humanoid Robot"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20"></div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-300 font-bold bg-black/60 px-2.5 py-1 rounded backdrop-blur-md">
                  Status: Prototype Phase / Factory Pilot
                </span>
                <span className="text-gray-300 font-mono text-[11px]">
                  FSD Hardware 4 Neural Core
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SPACE & SATELLITE CONSTELLATIONS DUO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Space Card */}
          <div 
            onClick={() => onSelectSection('space-rockets')}
            className="group relative rounded-2xl overflow-hidden bg-[#05070B] text-white p-6 sm:p-8 flex flex-col justify-between border border-gray-800 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer min-h-[360px]"
          >
            <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity">
              <img
                src="https://images.unsplash.com/photo-1517976487507-5b3b11329241?auto=format&fit=crop&w=1200&q=80"
                alt="SpaceX Starship Super Heavy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-[#05070B] via-[#05070B]/70 to-transparent"></div>

            <div className="relative z-10 space-y-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 font-mono text-xs font-bold border border-blue-400/20">
                SECTION 03 &bull; RAPID REUSABILITY
              </span>
              <h3 className="text-2xl font-bold font-tech text-white pt-2">
                Starship &amp; Falcon 9 Space Architecture
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
                Tracking orbital test flights, Mechazilla tower catch arms, Raptor 3 methane propulsion, and Commercial Crew rotations.
              </p>
            </div>

            <div className="relative z-10 pt-6 flex items-center justify-between text-xs font-bold text-cyan-300">
              <span className="flex items-center gap-1.5 group-hover:underline">
                Explore Rockets &amp; Missions <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-[10px] text-gray-400 font-mono">16.7M lbf Thrust</span>
            </div>
          </div>

          {/* Starlink Card */}
          <div 
            onClick={() => onSelectSection('starlink-internet')}
            className="group relative rounded-2xl overflow-hidden bg-[#05070B] text-white p-6 sm:p-8 flex flex-col justify-between border border-gray-800 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer min-h-[360px]"
          >
            <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
                alt="Starlink satellite internet"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-[#05070B] via-[#05070B]/70 to-transparent"></div>

            <div className="relative z-10 space-y-2">
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold border border-cyan-400/20">
                SECTION 04 &bull; LOW EARTH ORBIT BROADBAND
              </span>
              <h3 className="text-2xl font-bold font-tech text-white pt-2">
                Starlink Residential, Mini &amp; Mobility
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
                Verified country availability checker, phased-array terminals, latency benchmarks, and direct-to-cell optical satellite networks.
              </p>
            </div>

            <div className="relative z-10 pt-6 flex items-center justify-between text-xs font-bold text-cyan-300">
              <span className="flex items-center gap-1.5 group-hover:underline">
                Check Country Coverage <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-[10px] text-gray-400 font-mono">60+ Countries Live</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. AI & INVESTMENT CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold font-mono">
                SEC COMPLIANT INTELLIGENCE
              </span>
              <span className="text-xs text-gray-400">&bull; Section 09</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold font-tech text-[#111111]">
              Tesla Equity Analysis, SEC Reports &amp; Watchlist Tracker
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Live NASDAQ: TSLA price trends, 10-K/10-Q regulatory filings, private SpaceX/xAI secondary market rules, and personal investment watchlists.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectSection('investment-finance')}
              className="px-5 py-3 bg-[#111111] hover:bg-black text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Open Investment Center</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
