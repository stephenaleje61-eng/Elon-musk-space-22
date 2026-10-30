import React, { useState } from 'react';
import { Search, X, ArrowRight, Zap, ExternalLink } from 'lucide-react';
import { ContentItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
  onSelectItem: (item: ContentItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = items.filter(it => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      it.title.toLowerCase().includes(q) ||
      it.category.toLowerCase().includes(q) ||
      it.description.toLowerCase().includes(q) ||
      it.sectionId.toLowerCase().includes(q) ||
      Object.entries(it.specifications || {}).some(([k, v]) => 
        k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
      )
    );
  }).slice(0, 15);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search Tesla models, Falcon rockets, Grok, Optimus, Starlink, SEC filings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm sm:text-base border-none focus:outline-hidden text-gray-900 placeholder:text-gray-400"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tag Recommendations */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto text-[11px] text-gray-500">
          <span className="font-semibold text-gray-400">Popular:</span>
          {['Cybertruck', 'Optimus', 'Starship', 'Grok 3', 'Starlink Mini', 'Powerwall', 'TSLA'].map(tag => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2.5 py-0.5 rounded-full bg-white border border-gray-200 hover:border-blue-400 hover:text-[#1677FF] transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              No matching products, vehicles, or articles found for "{query}".
            </div>
          ) : (
            results.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectItem(item);
                  onClose();
                }}
                className="p-3 bg-white hover:bg-blue-50/60 border border-gray-100 hover:border-blue-200 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 truncate">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                  />
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#1677FF]">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        &bull; {item.sectionId}
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#1677FF] truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-gray-500 line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.price && (
                    <span className="text-xs font-bold font-tech text-gray-900 hidden sm:inline">
                      {item.price}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1677FF] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
