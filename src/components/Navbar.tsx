import React, { useState } from 'react';
import { 
  Rocket, 
  Search, 
  MessageSquare, 
  Bookmark, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SectionId } from '../types';
import { SECTIONS } from '../data/seedData';

interface NavbarProps {
  currentSection: SectionId | 'home';
  onSelectSection: (id: SectionId | 'home') => void;
  onOpenChat: () => void;
  onOpenAdminBoard: () => void;
  onOpenSaved: () => void;
  onOpenSearch: () => void;
  savedCount: number;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  onSelectSection,
  onOpenChat,
  onOpenAdminBoard,
  onOpenSaved,
  onOpenSearch,
  savedCount,
  unreadCount = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sectionsDropdownOpen, setSectionsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs font-sans">
      {/* Top micro-announcement banner */}
      <div className="bg-[#05070B] text-gray-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-medium text-white">ELON MUSK SPACE:</span>
            <span className="truncate hidden sm:inline">Open Global Technology &amp; Innovation Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] shrink-0 font-mono">
            <button
              onClick={onOpenAdminBoard}
              className="text-[#33ddff] hover:text-white flex items-center gap-1 font-bold underline cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#33ddff]" />
              <span>ELON MUSK ADMIN DESK (?admin=true)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Brand Name */}
          <button 
            onClick={() => onSelectSection('home')}
            className="flex items-center gap-3 text-left focus:outline-hidden group shrink-0 cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-br from-[#05070B] via-[#111827] to-[#1677FF] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="font-extrabold tracking-wider text-base sm:text-xl text-[#111111] font-tech flex items-center gap-1.5">
                ELON MUSK SPACE
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 font-medium tracking-tight">
                INNOVATION &bull; TECHNOLOGY &bull; FUTURE
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => onSelectSection('home')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                currentSection === 'home'
                  ? 'bg-gray-100 text-[#1677FF]'
                  : 'text-gray-700 hover:text-black hover:bg-gray-50'
              }`}
            >
              Home
            </button>

            {/* 9 Sections Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSectionsDropdownOpen(!sectionsDropdownOpen)}
                onBlur={() => setTimeout(() => setSectionsDropdownOpen(false), 200)}
                className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                  currentSection !== 'home' && currentSection !== 'investment-finance'
                    ? 'bg-blue-50 text-[#1677FF]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-50'
                }`}
              >
                <span>Nine Sections</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${sectionsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {sectionsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 grid grid-cols-1 gap-1 divide-y divide-gray-50 animate-in fade-in duration-150">
                  <div className="px-3 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Core Technology Ecosystem
                  </div>
                  <div className="pt-1 max-h-[70vh] overflow-y-auto">
                    {SECTIONS.map((sec, idx) => (
                      <button
                        key={sec.id}
                        onClick={() => {
                          onSelectSection(sec.id);
                          setSectionsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors text-xs hover:bg-gray-50 cursor-pointer ${
                          currentSection === sec.id ? 'bg-blue-50/80 font-bold text-[#1677FF]' : 'text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">
                            0{idx + 1}
                          </span>
                          <span className="truncate">{sec.shortTitle}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 group-hover:text-gray-600 shrink-0">Explore &rarr;</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectSection('investment-finance')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentSection === 'investment-finance'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:text-black hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Investment</span>
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 sm:px-3 sm:py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl flex items-center gap-2 text-sm transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
              title="Search all 9 sections, articles and vehicles"
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="hidden xl:inline text-xs text-gray-500 font-medium">Search catalogue...</span>
              <kbd className="hidden xl:inline bg-gray-100 text-gray-400 text-[10px] px-1.5 py-0.5 rounded border border-gray-200">⌘K</kbd>
            </button>

            {/* Saved Items */}
            <button
              onClick={onOpenSaved}
              className="relative p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              title="Saved Items"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1677FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* PROMINENT "CHAT ELON MUSK" VISITOR BUTTON */}
            <button
              onClick={onOpenChat}
              className="relative inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-linear-to-r from-[#111111] via-[#1677FF] to-[#005288] text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:brightness-110 active:scale-98 transition-all shrink-0 cursor-pointer"
              title="Open private 1-on-1 space chat"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
              </span>
              <MessageSquare className="w-4 h-4" />
              <span className="tracking-wide uppercase font-tech">CHAT ELON MUSK</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* DIRECT ELON MUSK ADMIN BOARD BUTTON - BROUGHT RIGHT OUT */}
            <button
              onClick={onOpenAdminBoard}
              className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#050a14] hover:bg-[#0a152a] text-[#33ddff] hover:text-white border border-[#33ddff]/50 rounded-xl font-extrabold text-xs sm:text-sm tracking-wider font-mono shadow-md hover:shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
              title="Open Admin Board to reply to messages as Elon Musk"
            >
              <ShieldCheck className="w-4 h-4 text-[#33ddff]" />
              <span className="hidden sm:inline">ELON MUSK ADMIN BOARD</span>
              <span className="sm:hidden">ADMIN</span>
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 lg:hidden rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                onSelectSection('home');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-gray-50 text-gray-900 rounded-xl text-xs font-bold text-left cursor-pointer"
            >
              🏠 Home Portal
            </button>
            <button
              onClick={() => {
                onSelectSection('investment-finance');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-left cursor-pointer"
            >
              📈 Investment Center
            </button>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              All 9 Technology Sections
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {SECTIONS.map((sec, idx) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    onSelectSection(sec.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left p-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer ${
                    currentSection === sec.id ? 'bg-blue-50 text-[#1677FF] font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[10px] font-mono text-gray-400">0{idx + 1}</span>
                  <span className="truncate">{sec.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                onOpenAdminBoard();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-[#050a14] text-[#33ddff] border border-[#33ddff]/50 text-xs font-extrabold font-mono rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#33ddff]" />
              <span>OPEN ELON MUSK ADMIN BOARD</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
