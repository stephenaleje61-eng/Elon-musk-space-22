import React, { useState } from 'react';
import { Search, Globe, Signal, ShieldCheck, ExternalLink, AlertCircle, Wifi } from 'lucide-react';
import { STARLINK_COUNTRIES } from '../data/seedData';
import { StarlinkCountry } from '../types';

export const StarlinkCountryChecker: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<StarlinkCountry>(STARLINK_COUNTRIES[0]);

  const filteredCountries = STARLINK_COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.countryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1677FF] uppercase tracking-wider mb-1">
            <Wifi className="w-4 h-4" />
            <span>GLOBAL COVERAGE INTELLIGENCE</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-tech text-[#111111]">
            Starlink Country Availability &amp; Service Metrics
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Select your country or region to view verified orbital service availability, observed speeds, and official subscription pricing.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search country or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1677FF] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Country List Selector */}
        <div className="lg:col-span-1 max-h-80 overflow-y-auto space-y-1.5 pr-2 border-r border-gray-100">
          {filteredCountries.map(c => {
            const isSelected = selectedCountry.countryCode === c.countryCode;
            const isAvailable = c.status === 'Available Now';
            return (
              <button
                key={c.countryCode}
                onClick={() => setSelectedCountry(c)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer ${
                  isSelected 
                    ? 'bg-[#1677FF] text-white shadow-xs font-semibold' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${isAvailable ? (isSelected ? 'bg-emerald-300' : 'bg-emerald-500') : 'bg-amber-400'}`}></span>
                  <span className="font-medium">{c.name}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {c.countryCode}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Country Detailed Report */}
        <div className="lg:col-span-2 bg-[#05070B] text-white rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                  Region: {selectedCountry.region}
                </div>
                <h4 className="text-2xl font-bold font-tech text-white">
                  {selectedCountry.name} ({selectedCountry.countryCode})
                </h4>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide ${
                selectedCountry.status === 'Available Now'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {selectedCountry.status}
              </span>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-[11px] text-gray-400">Typical Download</div>
                <div className="text-sm font-bold text-cyan-300 font-tech mt-1">{selectedCountry.avgDownloadSpeed}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-[11px] text-gray-400">Typical Latency</div>
                <div className="text-sm font-bold text-blue-300 font-tech mt-1">{selectedCountry.avgLatency}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-[11px] text-gray-400">Est. Service Plan</div>
                <div className="text-sm font-bold text-white font-tech mt-1">{selectedCountry.monthlyServiceEst}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-[11px] text-gray-400">Hardware Terminal</div>
                <div className="text-sm font-bold text-white font-tech mt-1">{selectedCountry.hardwarePriceEst}</div>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Starlink delivers high-speed internet through low Earth orbit phased-array inter-satellite optical lasers. Service availability requires local spectrum frequency rights and terminal importation approvals.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Coverage status verified via SpaceX Starlink Global Map</span>
            </div>

            <a
              href={selectedCountry.officialOrderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2 bg-[#1677FF] hover:bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <span>Order via Official Starlink</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
