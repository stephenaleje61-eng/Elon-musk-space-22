import React, { useState } from 'react';
import { X, Check, ExternalLink, Zap, ShieldAlert } from 'lucide-react';
import { VEHICLE_COMPARISONS } from '../data/seedData';
import { VehicleComparisonSpec } from '../types';

interface VehicleComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleComparisonModal: React.FC<VehicleComparisonModalProps> = ({ isOpen, onClose }) => {
  const [selectedModels, setSelectedModels] = useState<string[]>([
    'Model S Plaid',
    'Model 3 Long Range',
    'Cybertruck Cyberbeast'
  ]);

  if (!isOpen) return null;

  const toggleModel = (name: string) => {
    if (selectedModels.includes(name)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(m => m !== name));
      }
    } else {
      if (selectedModels.length < 4) {
        setSelectedModels([...selectedModels, name]);
      }
    }
  };

  const displayedVehicles = VEHICLE_COMPARISONS.filter(v => selectedModels.includes(v.model));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#E82127]" />
              <h3 className="text-xl font-bold font-tech text-[#111111]">
                Tesla Electric Vehicle Comparison Engine
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Compare powertrain specifications, acceleration, range, and pricing across the lineup.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Selection Chips */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 mr-2">Select (up to 4):</span>
          {VEHICLE_COMPARISONS.map(v => {
            const isSelected = selectedModels.includes(v.model);
            return (
              <button
                key={v.model}
                onClick={() => toggleModel(v.model)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected 
                    ? 'bg-[#111111] text-white shadow-xs' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{v.model}</span>
              </button>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-x-auto p-6">
          <div className="min-w-[650px] grid grid-cols-4 gap-4 divide-x divide-gray-100">
            {/* Specs Labels column */}
            <div className="space-y-4 pr-4 pt-44 font-semibold text-xs text-gray-500 uppercase tracking-wider">
              <div className="h-9 flex items-center">Acceleration (0-60)</div>
              <div className="h-9 flex items-center">EPA Estimated Range</div>
              <div className="h-9 flex items-center">Top Speed</div>
              <div className="h-9 flex items-center">Peak Horsepower</div>
              <div className="h-9 flex items-center">Drive Configuration</div>
              <div className="h-9 flex items-center">Starting MSRP</div>
              <div className="h-9 flex items-center">Cargo Capacity</div>
              <div className="h-10 flex items-center">Official Configurator</div>
            </div>

            {/* Vehicle columns */}
            {displayedVehicles.map(v => (
              <div key={v.model} className="pl-4 space-y-4">
                {/* Vehicle Card Header */}
                <div className="h-44 flex flex-col justify-between pb-2">
                  <div className="h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={v.image} alt={v.model} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-sm text-[#111111] font-tech truncate">
                    {v.model}
                  </h4>
                </div>

                {/* Values */}
                <div className="h-9 flex items-center text-sm font-bold text-blue-600">
                  {v.acceleration}
                </div>
                <div className="h-9 flex items-center text-sm font-semibold text-gray-800">
                  {v.range}
                </div>
                <div className="h-9 flex items-center text-sm font-medium text-gray-700">
                  {v.topSpeed}
                </div>
                <div className="h-9 flex items-center text-sm font-medium text-gray-700">
                  {v.peakPower}
                </div>
                <div className="h-9 flex items-center text-xs font-medium text-gray-700">
                  {v.drive}
                </div>
                <div className="h-9 flex items-center text-sm font-extrabold text-[#111111]">
                  {v.startingPrice}
                </div>
                <div className="h-9 flex items-center text-xs text-gray-600">
                  {v.cargo}
                </div>
                <div className="h-10 flex items-center">
                  <a
                    href="https://www.tesla.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 px-2.5 bg-[#111111] hover:bg-gray-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <span>Design on Tesla</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-2 text-[11px] text-gray-500">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Specifications reflect latest published manufacturer engineering data. ELON MUSK SPACE does not process vehicle purchases directly; all orders route to official authorized channels.
          </span>
        </div>

      </div>
    </div>
  );
};
