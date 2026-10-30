import React, { useState } from 'react';
import { 
  TrendingUp, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  ShieldAlert, 
  FileText, 
  DollarSign, 
  PieChart, 
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { TSLA_STOCK_DATA, TSLA_HISTORICAL_CHART_POINTS } from '../data/seedData';
import { WatchlistRecord } from '../types';

interface StockChartProps {
  watchlist: WatchlistRecord[];
  onAddToWatchlist: (ticker: string, company: string) => void;
  onRemoveFromWatchlist: (id: string) => void;
}

export const StockChart: React.FC<StockChartProps> = ({
  watchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist
}) => {
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  const isTslaWatchlisted = watchlist.some(w => w.ticker === 'TSLA');
  const tslaWatchlistEntry = watchlist.find(w => w.ticker === 'TSLA');

  // Chart calculations
  const minPrice = 130;
  const maxPrice = 280;
  const chartHeight = 180;
  const chartWidth = 600;

  const pointsString = TSLA_HISTORICAL_CHART_POINTS.map((pt, i) => {
    const x = (i / (TSLA_HISTORICAL_CHART_POINTS.length - 1)) * chartWidth;
    const y = chartHeight - ((pt.price - minPrice) / (maxPrice - minPrice)) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const handleWatchlistToggle = () => {
    if (isTslaWatchlisted && tslaWatchlistEntry) {
      onRemoveFromWatchlist(tslaWatchlistEntry.id);
    } else {
      onAddToWatchlist('TSLA', 'Tesla, Inc.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Ticker Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-mono font-bold">
                {TSLA_STOCK_DATA.exchange}: {TSLA_STOCK_DATA.symbol}
              </span>
              <span className="text-xs text-gray-500 font-medium">Verified SEC Listed Equity</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-tech text-[#111111] mt-1">
              {TSLA_STOCK_DATA.name}
            </h3>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-tech text-[#111111]">
                ${TSLA_STOCK_DATA.currentPrice.toFixed(2)}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                <TrendingUp className="w-4 h-4" />
                +{TSLA_STOCK_DATA.changePercent}% (1-Year Sourced Trend)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleWatchlistToggle}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isTslaWatchlisted
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {isTslaWatchlisted ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>On Your Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-gray-500" />
                  <span>+ Add to Watchlist</span>
                </>
              )}
            </button>

            <a
              href={TSLA_STOCK_DATA.investorRelationsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#111111] hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <span>Tesla IR Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="py-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2 font-mono">
            <span>Historical 12-Month Price Trend (USD)</span>
            <span>Range: $138.80 - $271.00</span>
          </div>

          <div className="relative bg-gray-50/80 rounded-xl p-4 border border-gray-100 overflow-hidden">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-44 sm:h-52 overflow-visible"
            >
              {/* Grid lines */}
              <line x1="0" y1="0" x2={chartWidth} y2="0" stroke="#E5E7EB" strokeDasharray="3 3" />
              <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#E5E7EB" strokeDasharray="3 3" />
              <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#E5E7EB" />

              {/* Gradient Area under line */}
              <defs>
                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <polygon
                points={`0,${chartHeight} ${pointsString} ${chartWidth},${chartHeight}`}
                fill="url(#stockGradient)"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />

              {/* Interactive Data points */}
              {TSLA_HISTORICAL_CHART_POINTS.map((pt, i) => {
                const cx = (i / (TSLA_HISTORICAL_CHART_POINTS.length - 1)) * chartWidth;
                const cy = chartHeight - ((pt.price - minPrice) / (maxPrice - minPrice)) * chartHeight;
                const isHovered = activePointIndex === i;

                return (
                  <g key={pt.month} onMouseEnter={() => setActivePointIndex(i)} onMouseLeave={() => setActivePointIndex(null)} className="cursor-pointer">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : 3.5}
                      className="fill-emerald-500 stroke-white stroke-2 transition-all duration-150"
                    />
                    {isHovered && (
                      <g>
                        <rect
                          x={cx - 35}
                          y={cy - 30}
                          width="70"
                          height="22"
                          rx="4"
                          className="fill-gray-900"
                        />
                        <text
                          x={cx}
                          y={cy - 15}
                          textAnchor="middle"
                          className="fill-white text-[10px] font-mono font-bold"
                        >
                          ${pt.price.toFixed(1)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Month labels */}
            <div className="flex justify-between text-[11px] text-gray-500 font-mono mt-3 px-1">
              {TSLA_HISTORICAL_CHART_POINTS.map(p => (
                <span key={p.month}>{p.month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Fundamental Financial Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <div className="text-[11px] font-semibold text-gray-500">Market Capitalization</div>
            <div className="text-base font-bold text-gray-900 font-tech mt-1">{TSLA_STOCK_DATA.marketCap}</div>
          </div>
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <div className="text-[11px] font-semibold text-gray-500">Price to Earnings (P/E)</div>
            <div className="text-base font-bold text-gray-900 font-tech mt-1">{TSLA_STOCK_DATA.peRatio}</div>
          </div>
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <div className="text-[11px] font-semibold text-gray-500">Quarterly Revenue</div>
            <div className="text-base font-bold text-gray-900 font-tech mt-1">{TSLA_STOCK_DATA.quarterRevenue}</div>
          </div>
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <div className="text-[11px] font-semibold text-gray-500">Free Cash Flow</div>
            <div className="text-base font-bold text-emerald-600 font-tech mt-1">{TSLA_STOCK_DATA.freeCashFlow}</div>
          </div>
        </div>

        {/* Regulatory Filings */}
        <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-900">
            <FileText className="w-4 h-4 text-[#1677FF]" />
            <span>Official SEC Filings: Form 10-Q &amp; 10-K filed under CIK 0001318605</span>
          </div>
          <a
            href={TSLA_STOCK_DATA.secFilingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#1677FF] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View EDGAR Filings</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Educational Masterclass: Public vs Private vs Customer */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <h4 className="text-xl font-bold font-tech text-[#111111] mb-2 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-[#1677FF]" />
          Financial Education: Public Shares vs. Private Companies vs. Products
        </h4>
        <p className="text-xs sm:text-sm text-gray-600 mb-6">
          Understanding the vital legal and regulatory differences between publicly traded securities and private technology ventures.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <div className="font-bold text-sm text-emerald-900 font-tech mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. Public Shares (Tesla)
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Traded on NASDAQ under ticker <strong>TSLA</strong>. Any investor with an authorized brokerage account can buy or sell fractional or whole shares with instantaneous liquidity and audited quarterly SEC disclosure.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/40">
            <div className="font-bold text-sm text-blue-900 font-tech mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              2. Private Equity (SpaceX, xAI, Boring)
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Privately held companies. Shares are <strong>not publicly traded</strong> on any stock exchange. Secondary transactions require SEC accredited investor status and explicit corporate board approval.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-purple-200 bg-purple-50/40">
            <div className="font-bold text-sm text-purple-900 font-tech mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-purple-600" />
              3. Commercial Hardware Purchases
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Purchasing a Tesla vehicle, Powerwall, or Starlink dish is a <strong>consumer commerce transaction</strong>. It confers no equity ownership, voting rights, or financial dividend in the underlying corporations.
            </p>
          </div>
        </div>

        {/* Directory of Legitimate Regulated Brokers */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
            Authorized &amp; Regulated FINRA / SIPC Brokerage Portals
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Charles Schwab', url: 'https://www.schwab.com' },
              { name: 'Fidelity Investments', url: 'https://www.fidelity.com' },
              { name: 'Interactive Brokers', url: 'https://www.interactivebrokers.com' },
              { name: 'Vanguard', url: 'https://www.vanguard.com' }
            ].map(b => (
              <a
                key={b.name}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>{b.name}</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            ))}
          </div>
        </div>

        {/* Risk Disclosures */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Mandatory Risk &amp; Compliance Disclosure:</span>
            <p className="text-[11px] leading-relaxed text-amber-800">
              ELON MUSK SPACE is not a registered broker-dealer, investment advisor, or financial institution. No content on this platform constitutes an offer to buy or sell securities, nor financial advice. Past performance does not guarantee future results. Never provide bank credentials, private keys, or wallet seed phrases to any unverified site.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
