import React, { useState } from 'react';
import { 
  X, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  MessageSquare, 
  ShieldCheck, 
  Share2, 
  Check, 
  Send,
  Zap,
  Info
} from 'lucide-react';
import { ContentItem } from '../types';

interface ItemDetailModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChatWithSubject: (subject: string) => void;
  isSaved: boolean;
  onToggleSave: (item: ContentItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onOpenChatWithSubject,
  isSaved,
  onToggleSave
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [enquiryText, setEnquiryText] = useState('');
  const [enquirySent, setEnquirySent] = useState(false);

  if (!isOpen || !item) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryText.trim()) return;
    onOpenChatWithSubject(`Enquiry regarding: ${item.title}\n"${enquiryText}"`);
    setEnquirySent(true);
    setTimeout(() => setEnquirySent(false), 3000);
    setEnquiryText('');
  };

  const statusColors = {
    commercial: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    prototype: 'bg-blue-50 text-blue-700 border-blue-200',
    announced: 'bg-purple-50 text-purple-700 border-purple-200',
    published: 'bg-gray-100 text-gray-700 border-gray-200',
    draft: 'bg-amber-50 text-amber-700 border-amber-200'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2 truncate pr-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1677FF] bg-blue-50 px-2 py-0.5 rounded">
              {item.category}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusColors[item.status] || 'bg-gray-100'}`}>
              {item.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-black rounded-lg hover:bg-gray-200 transition-colors"
              title="Copy share link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Bookmark */}
            <button
              onClick={() => onToggleSave(item)}
              className={`p-2 rounded-lg transition-colors ${
                isSaved ? 'text-[#1677FF] bg-blue-50' : 'text-gray-500 hover:text-black hover:bg-gray-200'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save item'}
            >
              {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Visual & Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-gray-900 border border-gray-200">
                <img
                  src={item.images[activeImageIdx] || item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {item.price && (
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white font-tech font-extrabold px-3 py-1.5 rounded-lg text-sm border border-white/20">
                    {item.price}
                  </div>
                )}
              </div>

              {/* Thumbnails if multiple */}
              {item.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {item.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIdx === idx ? 'border-[#1677FF] ring-2 ring-blue-300' : 'border-gray-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details & Description */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-extrabold font-tech text-[#111111] leading-tight">
                  {item.title}
                </h3>
                {item.price && (
                  <div className="text-xl font-extrabold font-tech text-[#1677FF] mt-1">
                    {item.price} {item.currency || 'USD'}
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                {item.officialUrl && (
                  <a
                    href={item.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-[#111111] hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <span>Official Manufacturer Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* PROMINENT CHAT ELON MUSK BUTTON */}
                <button
                  onClick={() => onOpenChatWithSubject(`Question regarding item: ${item.title}`)}
                  className="px-4 py-2.5 bg-[#1677FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>CHAT ELON MUSK</span>
                </button>
              </div>
            </div>

          </div>

          {/* Technical Specifications Table */}
          {item.specifications && Object.keys(item.specifications).length > 0 && (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h4 className="text-sm font-bold font-tech uppercase tracking-wider text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#1677FF]" />
                Technical Engineering Specifications
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(item.specifications).map(([key, val]) => (
                  <div key={key} className="bg-white p-3 rounded-lg border border-gray-100 flex flex-col justify-between">
                    <span className="text-gray-500 font-medium text-[11px]">{key}</span>
                    <span className="font-semibold text-gray-900 mt-0.5">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Source URL if available */}
          {item.sourceUrl && (
            <div className="flex items-center justify-between text-xs p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 text-gray-700 truncate pr-2">
                <ShieldCheck className="w-4 h-4 text-[#1677FF] shrink-0" />
                <span className="truncate">Source Reference: {item.sourceUrl}</span>
              </div>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1677FF] font-bold hover:underline shrink-0"
              >
                Inspect
              </a>
            </div>
          )}

          {/* Quick Contact & Enquiry Form */}
          <div className="p-5 rounded-xl border border-gray-200 bg-white">
            <h4 className="text-sm font-bold font-tech text-[#111111] mb-1">
              Direct Enquiry / Questions Regarding This Entry
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Send a direct query to the operations desk regarding availability, configuration, or technical sources.
            </p>

            <form onSubmit={handleEnquirySubmit} className="flex gap-2">
              <input
                type="text"
                placeholder={`Ask a question about ${item.title}...`}
                value={enquiryText}
                onChange={(e) => setEnquiryText(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1677FF]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Query</span>
              </button>
            </form>
            {enquirySent && (
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                ✓ Query routed to your private 1-on-1 chat channel!
              </p>
            )}
          </div>

        </div>

        {/* Modal Footer Disclaimer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-2 text-[11px] text-gray-500">
          <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>
            Independent information portal. Not an authorized point of sale for Tesla vehicles or SpaceX payload services.
          </span>
        </div>

      </div>
    </div>
  );
};
