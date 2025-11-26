import { Wallet, Circle, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';

function App() {
  const [countdown1, setCountdown1] = useState({ hours: 2, minutes: 15, seconds: 34 });
  const [countdown2, setCountdown2] = useState({ hours: 4, minutes: 45, seconds: 22 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown1(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });

      setCountdown2(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Circle className="w-6 h-6 text-cyan-400" />
            <span className="text-xl font-semibold">TWILIGHT ICO</span>
          </div>
          <nav className="flex items-center gap-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">How to ICO</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Twilight Docs</a>
            <button className="flex items-center gap-2 px-4 py-2 border border-cyan-400 text-cyan-400 rounded hover:bg-cyan-400 hover:text-black transition-colors">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Twilight Token Auction</h1>
          <p className="text-xl text-gray-400">Privacy Perpetual DEX</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Total Bids</div>
            <div className="text-4xl font-bold text-cyan-400">1,427</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Active Bidders</div>
            <div className="text-4xl font-bold text-cyan-400">892</div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Total Value Locked</div>
            <div className="text-4xl font-bold text-cyan-400">$14,250,000</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-semibold">Twilight Real-Time Auction</h2>
              </div>
              <span className="px-3 py-1 bg-green-500 text-xs font-semibold rounded-full uppercase">Live</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">Current Block</div>
                <div className="text-2xl font-bold">#12547</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Last Clearing Price</div>
                <div className="text-2xl font-bold text-cyan-400">$589.42</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Block Ends In</div>
                <div className="text-2xl font-bold text-cyan-400">{formatTime(countdown1)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Auction Ends In</div>
                <div className="text-2xl font-bold text-cyan-400">{formatTime(countdown2)}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-semibold">My Bid</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Budget Allocation (USDC)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pl-8 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Maximum Price Limit ($mBTC)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="text"
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pl-8 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <button className="w-full bg-cyan-400 text-black font-semibold py-3 rounded-lg hover:bg-cyan-300 transition-colors">
                Place Bid
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Circle className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-semibold">Swap</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="0.0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-4 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-gray-400">
                  <Circle className="w-4 h-4" />
                  USDC
                </span>
              </div>

              <div className="flex justify-center">
                <button className="bg-gray-800 p-2 rounded-lg border border-gray-700 hover:border-cyan-400 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="0.0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-4 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-gray-400">
                  <Circle className="w-4 h-4" />
                  mBTC
                </span>
              </div>

              <button className="w-full bg-cyan-400 text-black font-semibold py-3 rounded-lg hover:bg-cyan-300 transition-colors">
                Connect Wallet to Swap
              </button>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Pool Depth</div>
                  <div className="text-sm font-semibold">$8,542,000</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Maximum Price (USD)</div>
                  <div className="text-sm font-semibold">$87.32</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Slippage</div>
                  <div className="text-sm font-semibold">0.3%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">24h Volume</div>
                  <div className="text-sm font-semibold">$1,254,000</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Circle className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-semibold">My Position</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">Token Balance</div>
                <div className="text-3xl font-bold">
                  <span className="text-cyan-400">25.4</span>
                  <span className="text-xl text-gray-400 ml-2">$mBTC</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Average Entry Price</div>
                <div className="text-2xl font-bold">$562.89</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 mt-12 py-6 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">© 2024 Twilight Protocol. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Governance</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Users className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <DollarSign className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
