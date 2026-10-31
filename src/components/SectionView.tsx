import React, { useState } from 'react';
import { 
  SectionId, 
  ContentItem, 
  SavedItem, 
  WatchlistRecord 
} from '../types';
import { SECTIONS, SPACE_LAUNCHES } from '../data/seedData';
import { 
  ExternalLink, 
  MessageSquare, 
  Bookmark, 
  BookmarkCheck, 
  Search, 
  Zap, 
  SlidersHorizontal, 
  ArrowLeft,
  ShieldCheck,
  Rocket,
  Cpu,
  Layers,
  Info
} from 'lucide-react';
import { User } from 'firebase/auth';
import { VehicleComparisonModal } from './VehicleComparisonModal';
import { StarlinkCountryChecker } from './StarlinkCountryChecker';
import { StockChart } from './StockChart';

interface SectionViewProps {
  sectionId: SectionId;
  items: ContentItem[];
  onBackToHome: () => void;
  onSelectItem: (item: ContentItem) => void;
  onOpenChat: () => void;
  onOpenChatWithSubject: (subject: string) => void;
  savedItems: SavedItem[];
  onToggleSave: (item: ContentItem) => void;
  watchlist: WatchlistRecord[];
  onAddToWatchlist: (ticker: string, company: string) => void;
  onRemoveFromWatchlist: (id: string) => void;
}

export const SectionView: React.FC<SectionViewProps> = ({
  sectionId,
  items,
  onBackToHome,
  onSelectItem,
  onOpenChat,
  onOpenChatWithSubject,
  savedItems,
  onToggleSave,
  watchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist
}) => {
  const meta = SECTIONS.find(s => s.id === sectionId) || SECTIONS[0];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Filter items belonging to this section
  const sectionItems = items.filter(it => it.sectionId === sectionId);

  const filteredItems = sectionItems.filter(it => {
    const matchesCategory = selectedCategory === 'all' || (it.category || '').toLowerCase().includes((selectedCategory || '').toLowerCase());
    const matchesSearch = (it.title || '').toLowerCase().includes((searchFilter || '').toLowerCase()) ||
                          (it.description || '').toLowerCase().includes((searchFilter || '').toLowerCase()) ||
                          (it.category || '').toLowerCase().includes((searchFilter || '').toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      
      {/* Section Hero Banner */}
      <div className="relative bg-[#05070B] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src={meta.bannerImage}
            alt={meta.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-[#05070B] via-[#05070B]/70 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pb-16 z-10 space-y-4">
          
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg backdrop-blur-md transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Overview</span>
            </button>

            {/* PROMINENT CHAT ELON MUSK BUTTON REQUIRED IN EVERY SECTION */}
            <button
              onClick={onOpenChat}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-linear-to-r from-[#1677FF] to-cyan-500 hover:brightness-110 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              title="Open private 1-on-1 chat channel"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-tech tracking-wider uppercase">CHAT ELON MUSK</span>
            </button>
          </div>

          {/* Section Titles */}
          <div className="pt-4 max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-[#1677FF] text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                SECTION ARCHIVE
              </span>
              <a
                href={meta.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>{meta.officialName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-tech tracking-tight text-white leading-tight">
              {meta.title}
            </h1>

            <p className="text-sm sm:text-lg text-cyan-200 font-medium font-tech">
              {meta.tagline}
            </p>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
              {meta.description}
            </p>
          </div>

          {/* Interactive Feature Buttons tailored to Section */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            {sectionId === 'tesla-clean-energy' && (
              <button
                onClick={() => setCompareModalOpen(true)}
                className="px-4 py-2 bg-white text-[#111111] hover:bg-gray-100 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Zap className="w-4 h-4 text-[#E82127]" />
                <span>Launch Side-by-Side Vehicle Comparison</span>
              </button>
            )}

            <a
              href={meta.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-colors"
            >
              <span>Visit Official {meta.officialName.split(' ')[0]} Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>

      {/* Main Section Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20 space-y-8">
        
        {/* Filter and Categories Ribbon */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Categories Pill Bar */}
          <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 max-w-3xl">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All Items ({sectionItems.length})
            </button>

            {meta.categories.map(cat => {
              const count = sectionItems.filter(i => i.category.toLowerCase().includes(cat.toLowerCase())).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1677FF] text-white shadow-xs font-bold'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Filter input */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${meta.shortTitle}...`}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1677FF]"
            />
          </div>

        </div>

        {/* SPECIAL SECTION EMBEDS */}

        {/* Section 4: Starlink Interactive Country Checker */}
        {sectionId === 'starlink-internet' && (
          <div className="space-y-4">
            <StarlinkCountryChecker />
          </div>
        )}

        {/* Section 9: Investment TSLA Chart & Financial Intelligence */}
        {sectionId === 'investment-finance' && (
          <div className="space-y-4">
            <StockChart
              watchlist={watchlist}
              onAddToWatchlist={onAddToWatchlist}
              onRemoveFromWatchlist={onRemoveFromWatchlist}
            />
          </div>
        )}

        {/* Section 3: Space Rocket Launches Tracker */}
        {sectionId === 'space-rockets' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#1677FF] uppercase tracking-wider">
                  FLIGHT MANIFEST INTELLIGENCE
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-tech text-[#111111]">
                  Orbital Launch &amp; Reusability Tracker
                </h3>
              </div>
              <a
                href="https://www.spacex.com/launches"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1677FF] font-bold flex items-center gap-1 hover:underline"
              >
                <span>SpaceX Official Launches</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {SPACE_LAUNCHES.map(launch => (
                <div key={launch.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase bg-blue-100 text-[#1677FF] px-2 py-0.5 rounded font-bold">
                        {launch.status}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">{launch.date}</span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 font-tech mt-2">
                      {launch.missionName}
                    </h4>
                    <p className="text-xs text-gray-600 font-medium">{launch.rocket}</p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                      {launch.payloadDescription}
                    </p>
                  </div>
                  <div className="text-[10px] text-gray-400 border-t border-gray-200 pt-2 font-mono">
                    Site: {launch.launchSite}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product & Article Cards Grid for this Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-tech text-[#111111] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1677FF]" />
              <span>Section Catalogue &amp; Verified Entries ({filteredItems.length})</span>
            </h3>
            <span className="text-xs text-gray-500">
              Showing verified entries in {meta.title}
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-800">No matching entries found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No articles or catalogue entries matched "{searchFilter}". Try adjusting your filters or search keywords.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchFilter('');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => {
                const isSaved = savedItems.some(s => s.itemId === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-900">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>

                        {/* Category */}
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded">
                          {item.category}
                        </div>

                        {/* Bookmark Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(item);
                          }}
                          className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                            isSaved ? 'bg-[#1677FF] text-white' : 'bg-black/40 text-white hover:bg-black/60'
                          }`}
                          title={isSaved ? 'Bookmarked' : 'Bookmark item'}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>

                        {/* Price Badge if available */}
                        {item.price && (
                          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-[#111111] font-tech font-extrabold text-xs px-2.5 py-1 rounded-md shadow-xs">
                            {item.price}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h4 className="font-extrabold text-base text-[#111111] font-tech group-hover:text-[#1677FF] transition-colors leading-snug">
                          {item.title}
                        </h4>

                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mt-2">
                          {item.description}
                        </p>

                        {/* Key specifications snippet */}
                        {item.specifications && (
                          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px]">
                            {Object.entries(item.specifications).slice(0, 2).map(([k, v]) => (
                              <div key={k} className="bg-gray-50 p-2 rounded-lg truncate">
                                <span className="text-gray-400 block text-[9px] uppercase font-mono">{k}</span>
                                <span className="font-semibold text-gray-800 truncate block">{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-5 pt-0 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1677FF] group-hover:underline flex items-center gap-1">
                        View Full Specs &rarr;
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChatWithSubject(`Question regarding item: ${item.title}`);
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#1677FF] hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        title="Chat about this item"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium hidden sm:inline">Enquire</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Side-by-side comparison modal if launched */}
      <VehicleComparisonModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
      />

    </div>
  );
};
