import { Wallet, Users, DollarSign, HandCoins, UserCheck, Lock, Coins, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatedNumber } from './components/AnimatedNumber';
import { Swap } from './components/Swap';
import { MyPosition } from './components/MyPosition';
import { Auction } from './components/Auction';
import { MyBid } from './components/MyBid';
import { AnimatedSection } from './components/AnimatedSection';
import { TiltCard } from './components/TiltCard';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { StateSlider } from './components/StateSlider';
import { TypewriterText } from './components/TypewriterText';
import { ThemeToggle } from './components/ThemeToggle';
import { useThemeClasses } from './hooks/useThemeClasses';

function App() {
  const themeClasses = useThemeClasses();
  const [countdown1, setCountdown1] = useState({ hours: 2, minutes: 15, seconds: 34 });
  const [countdown2, setCountdown2] = useState({ hours: 4, minutes: 45, seconds: 22 });
  const [auctionState, setAuctionState] = useState<'pre-auction' | 'auction-live' | 'post-auction'>('auction-live');
  const [titleComplete, setTitleComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);
  
  // Summary section data - to be fetched from data source
  const [summaryData, _setSummaryData] = useState({
    tokensAvailable: '5M',
    tokensAvailablePercentage: '5%',
    auctionLengthBlocks: 5,
    totalBids: 1427,
    activeBidders: 892,
    totalValueLocked: 14250000,
  });
  
  // My Position data - to be fetched from data source
  const [myPositionData, _setMyPositionData] = useState({
    tokenBalance: 25.4,
    averageEntryPrice: 562.89,
    estimatedValue: 14297.41,
  });
  
  // Auction data - to be fetched from data source
  const [auctionData, _setAuctionData] = useState({
    currentBlock: 12547,
    totalBlocks: 12600,
    lastClearingPrice: 589.42,
    allocatedTokens: 2500000,
    totalTokens: 5000000,
    allocatedPercentage: 50,
  });
  
  // Swap data - to be fetched from data source
  const [swapData, _setSwapData] = useState({
    poolDepth: 8542000,
    maximumPrice: 87.32,
    slippage: 0.3,
    volume24h: 1254000,
  });
  
  
  // TODO: Fetch data from API/data source
  // useEffect(() => {
  //   Promise.all([
  //     fetchSummaryData().then(data => _setSummaryData(data)),
  //     fetchMyPositionData().then(data => _setMyPositionData(data)),
  //     fetchAuctionData().then(data => _setAuctionData(data)),
  //     fetchSwapData().then(data => _setSwapData(data)),
  //   ]);
  // }, []);

  useEffect(() => {
    // Start showing content shortly after title starts animating
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 500); // Start after 500ms

    return () => clearTimeout(contentTimer);
  }, []);

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

  // Simulate new transactions - increment values periodically
  useEffect(() => {
    if (auctionState === 'pre-auction') return;
    
    const transactionInterval = setInterval(() => {
      _setSummaryData(prev => ({
        ...prev,
        totalBids: prev.totalBids + Math.floor(Math.random() * 3) + 1, // Increment by 1-3
        activeBidders: prev.activeBidders + (Math.random() > 0.7 ? 1 : 0), // Occasionally increment
        totalValueLocked: prev.totalValueLocked + Math.floor(Math.random() * 50000) + 10000, // Increment by 10k-60k
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(transactionInterval);
  }, [auctionState]);

  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen ${themeClasses.mainBackground} text-white`}>
      <header className={`border-b border-gray-800 ${themeClasses.headerBackground}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/twilight-logo.png" alt="Twilight Logo" style={{ minWidth: '108px', height: 'auto' }} />
            <span className="text-base sm:text-xl font-semibold">ICO</span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-8">
            <ThemeToggle />
            <a href="#" className="hidden sm:block text-gray-300 hover:text-white transition-colors text-sm sm:text-base">How to ICO</a>
            <a href="#" className="hidden sm:block text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Twilight Docs</a>
            <button className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border ${themeClasses.borderAccent} ${themeClasses.textAccent} rounded ${themeClasses.hoverBgAccent} ${themeClasses.textAccentHover} transition-colors text-sm sm:text-base`}>
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </button>
          </nav>
        </div>
      </header>

      <AnnouncementBanner state={auctionState} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 id="title" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 sm:mb-4 font-mono tracking-tight">
            <TypewriterText 
              text={[
                "Twilight Token Auction",
                "Zero Margin",
                "Zero Knowledge PnL",
                "Zero Knowledge Leverage"
              ]}
              speed={80}
              delayBetweenTexts={3000}
              onComplete={() => setTitleComplete(true)}
            />
          </h1>
          <p 
            id="subtitle" 
            className={`text-base sm:text-lg md:text-xl text-gray-400 transition-all duration-[2000ms] ease-out ${
              titleComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
                  Untraceable Bitcoin on a Privacy DEX
          </p>
        </div>

        <div className={`transition-opacity duration-1000 ease-out ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <AnimatedSection delay={100} animation="fade-in-up">
            {auctionState === 'pre-auction' ? (
              <div className="flex justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div className="w-1/3">
                  <AnimatedSection delay={0}>
                    <TiltCard maxTilt={3} scale={1.01}>
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <Coins className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`} />
                          <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Tokens Available</div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${themeClasses.textAccent}`}>{summaryData.tokensAvailable}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{summaryData.tokensAvailablePercentage} of total supply</div>
                        </div>
                      </div>
                    </TiltCard>
                  </AnimatedSection>
                </div>
                <div className="w-1/3">
                  <AnimatedSection delay={100}>
                    <TiltCard maxTilt={3} scale={1.01}>
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`} />
                          <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Auction Length</div>
                        </div>
                        <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${themeClasses.textAccent}`}>{summaryData.auctionLengthBlocks} blocks</div>
                      </div>
                    </TiltCard>
                  </AnimatedSection>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <AnimatedSection delay={0}>
                  <TiltCard maxTilt={3} scale={1.01}>
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <HandCoins className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`} />
                        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Total Bids</div>
                      </div>
                      <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${themeClasses.textAccent}`}>
                        <AnimatedNumber 
                          value={summaryData.totalBids} 
                          duration={1500}
                          enabled={true}
                        />
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
                <AnimatedSection delay={100}>
                  <TiltCard maxTilt={3} scale={1.01}>
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`} />
                        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Active Bidders</div>
                      </div>
                      <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${themeClasses.textAccent}`}>
                        <AnimatedNumber 
                          value={summaryData.activeBidders} 
                          duration={1500}
                          enabled={true}
                        />
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
                <AnimatedSection delay={200}>
                  <TiltCard maxTilt={3} scale={1.01}>
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`} />
                        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Total Value Locked</div>
                      </div>
                      <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${themeClasses.textAccent}`}>
                        <AnimatedNumber 
                          value={summaryData.totalValueLocked} 
                          duration={1500}
                          enabled={true}
                          formatter={(v) => `$${v.toLocaleString()}`}
                        />
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
              </div>
            )}
          </AnimatedSection>

          <AnimatedSection delay={200} animation="fade-in-up">
            <div className="flex items-center justify-center sm:justify-start mb-4 sm:mb-6">
              <StateSlider value={auctionState} onChange={setAuctionState} />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={300} animation="fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          <AnimatedSection delay={0} animation="fade-in">
            <div className="flex flex-col h-full">
              {auctionState === 'post-auction' ? (
                <Swap 
                  poolDepth={swapData.poolDepth}
                  maximumPrice={swapData.maximumPrice}
                  slippage={swapData.slippage}
                  volume24h={swapData.volume24h}
                />
                    ) : auctionState === 'auction-live' ? (
                      <Auction 
                        countdown1={countdown1} 
                        countdown2={countdown2} 
                        formatTime={formatTime}
                        currentBlock={auctionData.currentBlock}
                        totalBlocks={auctionData.totalBlocks}
                        lastClearingPrice={auctionData.lastClearingPrice}
                        allocatedTokens={auctionData.allocatedTokens}
                        totalTokens={auctionData.totalTokens}
                        allocatedPercentage={auctionData.allocatedPercentage}
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 h-full flex items-center justify-center">
                        <div className="text-center">
                          <h2 className="text-xl sm:text-2xl font-semibold mb-2">Auction Starting Soon</h2>
                          <p className="text-sm sm:text-base text-gray-400 mb-2">Get ready to participate in the Twilight Token Auction</p>
                          <p className={`text-sm sm:text-base ${themeClasses.textAccent} font-medium`}>December 23, 2005</p>
                        </div>
                      </div>
                    )}
            </div>
          </AnimatedSection>
          <AnimatedSection delay={150} animation="fade-in">
            <div className="flex flex-col gap-4 sm:gap-6 h-full">
              {auctionState === 'auction-live' && <MyBid />}
                    <MyPosition 
                      auctionState={auctionState}
                      tokenBalance={myPositionData.tokenBalance}
                      averageEntryPrice={myPositionData.averageEntryPrice}
                      estimatedValue={myPositionData.estimatedValue}
                    />
            </div>
          </AnimatedSection>
          </div>
        </AnimatedSection>
        </div>
      </main>

      <footer className="border-t border-gray-800 mt-8 sm:mt-12 py-4 sm:py-6 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">© 2024 Twilight Protocol. All rights reserved.</p>
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center">
              <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Governance</a>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
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
