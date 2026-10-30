/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SectionId, ContentItem, SavedItem, WatchlistRecord } from './types';
import { 
  subscribeToItems, 
  seedInitialContentIfEmpty, 
  subscribeToSavedItems, 
  toggleSaveItem,
  subscribeToWatchlist,
  addWatchlistItem,
  removeWatchlistItem
} from './services/contentService';
import { INITIAL_CONTENT_ITEMS } from './data/seedData';
import { initSilentAuth } from './lib/firebase';

// Components
import { Navbar } from './components/Navbar';
import { WelcomeHero } from './components/WelcomeHero';
import { SectionsOverview } from './components/SectionsOverview';
import { HomepageShowcases } from './components/HomepageShowcases';
import { SectionView } from './components/SectionView';
import { SpaceChatSection } from './components/SpaceChatSection';
import { ItemDetailModal } from './components/ItemDetailModal';
import { PrivateChatModal } from './components/PrivateChatModal';
import { AdminDirectDashboard } from './components/AdminDirectDashboard';
import { SavedItemsModal } from './components/SavedItemsModal';
import { SearchModal } from './components/SearchModal';
import { VehicleComparisonModal } from './components/VehicleComparisonModal';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation
  const [currentSection, setCurrentSection] = useState<SectionId | 'home'>('home');

  // Direct Admin Board State (triggered via ?admin=true or the ELON MUSK ADMIN BOARD button in header)
  const [adminBoardOpen, setAdminBoardOpen] = useState<boolean>(() => {
    return window.location.search.includes('admin=true');
  });

  // Stable Visitor Identity (Zero login barrier, preserved in localStorage)
  const [visitorId] = useState<string>(() => {
    let vid = localStorage.getItem('elon_visitor_id');
    if (!vid) {
      vid = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('elon_visitor_id', vid);
    }
    return vid;
  });

  // Content Items
  const [items, setItems] = useState<ContentItem[]>(INITIAL_CONTENT_ITEMS);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  // User State
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistRecord[]>([]);

  // Modals
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatInitialSubject, setChatInitialSubject] = useState<string>('');
  const [savedOpen, setSavedOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [comparisonOpen, setComparisonOpen] = useState<boolean>(false);

  // Initialize silent anonymous auth quietly in background (no UI, zero login)
  useEffect(() => {
    initSilentAuth();
  }, []);

  // Sync URL changes for ?admin=true
  useEffect(() => {
    const handlePopState = () => {
      setAdminBoardOpen(window.location.search.includes('admin=true'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial Content Catalogue Subscription & Seeding
  useEffect(() => {
    seedInitialContentIfEmpty();
    const unsubscribe = subscribeToItems(true, (fetchedItems) => {
      setItems(fetchedItems);
    });
    return () => unsubscribe();
  }, []);

  // Saved Items & Watchlist Subscriptions (tied to persistent visitorId)
  useEffect(() => {
    const unsubSaved = subscribeToSavedItems(visitorId, (list) => {
      setSavedItems(list);
    });

    const unsubWatchlist = subscribeToWatchlist(visitorId, (list) => {
      setWatchlist(list);
    });

    return () => {
      unsubSaved();
      unsubWatchlist();
    };
  }, [visitorId]);

  // Keyboard shortcut (⌘K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleOpenChat = () => {
    setChatInitialSubject('');
    setChatOpen(true);
  };

  const handleOpenChatWithSubject = (subject: string) => {
    setChatInitialSubject(subject);
    setChatOpen(true);
  };

  const handleToggleSave = async (item: ContentItem) => {
    const isCurrentlySaved = savedItems.some(s => s.itemId === item.id);
    await toggleSaveItem(item, visitorId, isCurrentlySaved);
  };

  const handleAddToWatchlist = async (ticker: string, company: string) => {
    await addWatchlistItem(visitorId, ticker, company);
  };

  const handleRemoveFromWatchlist = async (id: string) => {
    await removeWatchlistItem(id);
  };

  const handleOpenAdminBoard = () => {
    setAdminBoardOpen(true);
    window.history.pushState({}, '', '?admin=true');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitAdminBoard = () => {
    setAdminBoardOpen(false);
    window.history.pushState({}, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ----------------------------------------------------
  // DIRECT ADMIN BOARD RENDER
  // Brought right out where the owner can reply to messages as Elon Musk!
  // ----------------------------------------------------
  if (adminBoardOpen) {
    return (
      <AdminDirectDashboard
        onClose={handleExitAdminBoard}
        items={items}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      
      {/* Universal Navigation Header */}
      <Navbar
        currentSection={currentSection}
        onSelectSection={(sec) => {
          setCurrentSection(sec);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenChat={handleOpenChat}
        onOpenAdminBoard={handleOpenAdminBoard}
        onOpenSaved={() => setSavedOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        savedCount={savedItems.length}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentSection === 'home' ? (
          <div>
            {/* Hero Banner with Welcome Message & 4 Actions */}
            <WelcomeHero
              onExploreTechnology={() => {
                const el = document.getElementById('ecosystem-overview');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreProducts={() => {
                setCurrentSection('tesla-clean-energy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onInvestmentInfo={() => {
                setCurrentSection('investment-finance');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onChatPrivately={handleOpenChat}
              onSelectSection={(sec) => {
                setCurrentSection(sec);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* VISITOR HOMEPAGE REQUEST TO JOIN SPACE CHAT SECTION */}
            <SpaceChatSection />

            {/* Nine Sections Overview Grid */}
            <div id="ecosystem-overview">
              <SectionsOverview
                onSelectSection={(sec) => {
                  setCurrentSection(sec);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>

            {/* Homepage Featured Showcases */}
            <HomepageShowcases
              items={items}
              onSelectSection={(sec) => {
                setCurrentSection(sec);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectItem={(item) => setSelectedItem(item)}
              savedItems={savedItems}
              onToggleSave={handleToggleSave}
              onOpenChat={handleOpenChat}
              onOpenVehicleComparison={() => setComparisonOpen(true)}
            />
          </div>
        ) : (
          /* Dedicated Section Page (One of 9) */
          <SectionView
            sectionId={currentSection}
            items={items}
            onBackToHome={() => {
              setCurrentSection('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenChat={handleOpenChat}
            onOpenChatWithSubject={handleOpenChatWithSubject}
            savedItems={savedItems}
            onToggleSave={handleToggleSave}
            watchlist={watchlist}
            onAddToWatchlist={handleAddToWatchlist}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
          />
        )}
      </main>

      {/* Global Comprehensive Footer with disclaimers */}
      <Footer
        onSelectSection={(sec) => {
          setCurrentSection(sec);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenChat={handleOpenChat}
      />

      {/* MODALS */}

      {/* 1. Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onOpenChatWithSubject={handleOpenChatWithSubject}
        isSaved={selectedItem ? savedItems.some(s => s.itemId === selectedItem.id) : false}
        onToggleSave={handleToggleSave}
      />

      {/* 2. Real 1-on-1 Private Chat Modal ("CHAT ELON MUSK") */}
      <PrivateChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        initialMessageText={chatInitialSubject}
      />

      {/* 3. User Saved Items Drawer */}
      <SavedItemsModal
        isOpen={savedOpen}
        onClose={() => setSavedOpen(false)}
        savedItems={savedItems}
        onSelectItem={(saved) => {
          const item = items.find(i => i.id === saved.itemId);
          if (item) setSelectedItem(item);
          setSavedOpen(false);
        }}
        onRemoveItem={handleToggleSave}
        allItems={items}
      />

      {/* 4. Global Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={items}
        onSelectItem={(item) => setSelectedItem(item)}
      />

      {/* 5. Side-by-Side Vehicle Comparison Modal */}
      <VehicleComparisonModal
        isOpen={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
      />

    </div>
  );
}
