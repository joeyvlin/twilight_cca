import { Circle } from 'lucide-react';

interface AuctionProps {
  countdown1: { hours: number; minutes: number; seconds: number };
  countdown2: { hours: number; minutes: number; seconds: number };
  formatTime: (time: { hours: number; minutes: number; seconds: number }) => string;
}

export function Auction({ countdown1, countdown2, formatTime }: AuctionProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Circle className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-semibold">Twilight Real-Time Auction</h2>
        </div>
        <span className="px-2 py-0.5 bg-green-500 text-xs font-semibold rounded-full uppercase">Live</span>
      </div>

      <div className="flex flex-col flex-1 gap-0">
        <div className="flex-1 flex items-center">
          <div className="grid grid-cols-2 gap-6 w-full">
            <div className="border border-gray-700 rounded-lg px-2.5 py-8 bg-gradient-to-r from-gray-800/50 to-transparent hover:border-cyan-400 transition-colors flex flex-col items-center text-center">
              <div className="text-sm text-gray-400 mb-0">Current Block</div>
              <div className="text-2xl font-bold">#12547</div>
            </div>
            <div className="border border-gray-700 rounded-lg px-2.5 py-8 bg-gradient-to-r from-gray-800/50 to-transparent hover:border-cyan-400 transition-colors flex flex-col items-center text-center">
              <div className="text-sm text-gray-400 mb-0">Last Clearing Price</div>
              <div className="text-2xl font-bold text-cyan-400">$589.42</div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center">
          <div className="grid grid-cols-2 gap-6 w-full">
            <div className="border border-gray-700 rounded-lg px-2.5 py-8 bg-gradient-to-r from-gray-800/50 to-transparent hover:border-cyan-400 transition-colors flex flex-col items-center text-center">
              <div className="text-sm text-gray-400 mb-0">Block Ends In</div>
              <div className="text-2xl font-bold text-cyan-400">{formatTime(countdown1)}</div>
            </div>
            <div className="border border-gray-700 rounded-lg px-2.5 py-8 bg-gradient-to-r from-gray-800/50 to-transparent hover:border-cyan-400 transition-colors flex flex-col items-center text-center">
              <div className="text-sm text-gray-400 mb-0">Auction Ends In</div>
              <div className="text-2xl font-bold text-cyan-400">{formatTime(countdown2)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

