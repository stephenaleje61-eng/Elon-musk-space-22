import React from 'react';
import { ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { SECTIONS } from '../data/seedData';
import { SectionId } from '../types';

interface SectionsOverviewProps {
  onSelectSection: (id: SectionId) => void;
}

export const SectionsOverview: React.FC<SectionsOverviewProps> = ({ onSelectSection }) => {
  return (
    <section className="py-12 sm:py-16 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="text-xs font-mono font-bold tracking-widest text-[#1677FF] uppercase mb-1">
              THE COMPLETE ECOSYSTEM
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] font-tech tracking-tight">
              Nine Core Technology Pillars
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl">
              Every section provides comprehensive engineering specifications, catalogues, hardware diagrams, verified announcements, and official links.
            </p>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Click any section card to enter dedicated catalogue
          </div>
        </div>

        {/* 9 Section Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SECTIONS.map((sec, idx) => (
            <div
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-200/80 flex flex-col cursor-pointer hover:-translate-y-1"
            >
              {/* Card Image Banner */}
              <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-900">
                <img
                  src={sec.bannerImage}
                  alt={sec.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Index tag */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white font-mono text-xs font-bold px-2.5 py-1 rounded-md border border-white/20">
                  SECTION 0{idx + 1}
                </div>

                {/* Official Provider Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-800 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#1677FF]" />
                  <span>{sec.officialName.split(' ')[0]}</span>
                </div>

                {/* Title inside banner bottom */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white font-tech leading-snug drop-shadow-md">
                    {sec.title}
                  </h3>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#1677FF] mb-2 font-tech">
                    {sec.tagline}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {sec.description}
                  </p>

                  {/* Sample Categories */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {sec.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                      >
                        {cat}
                      </span>
                    ))}
                    {sec.categories.length > 3 && (
                      <span className="text-[10px] text-gray-400 font-medium px-1 py-0.5">
                        +{sec.categories.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1677FF] group-hover:text-blue-700 flex items-center gap-1">
                    Explore Section <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  
                  <a
                    href={sec.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-gray-700 flex items-center gap-1 text-[11px]"
                    title={`Open ${sec.officialName}`}
                  >
                    <span>Official Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
