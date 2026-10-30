import React from 'react';
import { X, Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { SavedItem, ContentItem } from '../types';

interface SavedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedItem[];
  onSelectItem: (item: SavedItem) => void;
  onRemoveItem: (item: ContentItem) => void;
  allItems: ContentItem[];
}

export const SavedItemsModal: React.FC<SavedItemsModalProps> = ({
  isOpen,
  onClose,
  savedItems,
  onSelectItem,
  onRemoveItem,
  allItems
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#1677FF]" />
            <div>
              <h3 className="font-bold text-base font-tech text-[#111111]">
                Your Saved Catalogue Items ({savedItems.length})
              </h3>
              <p className="text-[11px] text-gray-500">Bookmarked vehicles, robotics, and technology articles</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-black rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {savedItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="text-xs text-gray-500">
                You haven't bookmarked any items yet. Click the bookmark icon on any vehicle or product card to save it for quick review.
              </p>
            </div>
          ) : (
            savedItems.map(saved => {
              const matchedItem = allItems.find(i => i.id === saved.itemId);
              return (
                <div
                  key={saved.id}
                  onClick={() => onSelectItem(saved)}
                  className="p-3 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={saved.imageUrl}
                      alt={saved.title}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-200 border border-gray-200 shrink-0"
                    />
                    <div className="truncate">
                      <div className="text-[10px] font-mono font-bold uppercase text-[#1677FF]">
                        {saved.category}
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                        {saved.title}
                      </div>
                      {saved.price && (
                        <div className="text-[11px] font-semibold text-gray-600 font-tech">
                          {saved.price}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-[#1677FF] font-semibold hidden sm:inline group-hover:translate-x-0.5 transition-transform">
                      View
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1677FF]" />
                    {matchedItem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem(matchedItem);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-md ml-1"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
