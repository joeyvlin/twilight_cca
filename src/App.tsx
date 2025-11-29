import { Wallet, HandCoins, UserCheck, Lock, Coins, Clock, Menu, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { AnimatedNumber } from './components/AnimatedNumber';
import { Swap } from './components/Swap';
import { MyPosition } from './components/MyPosition';
import { Auction } from './components/Auction';
import { MyBid } from './components/MyBid';
import { FAQ } from './components/FAQ';
import { BitcoinShield } from './components/BitcoinShield';
import { AnimatedSection } from './components/AnimatedSection';
import { TiltCard } from './components/TiltCard';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { StateSlider } from './components/StateSlider';
import { TypewriterText } from './components/TypewriterText';
import { ThemeToggle } from './components/ThemeToggle';
import Lightning from './components/Lightning';
import ElectricBorder from './components/ElectricBorder';
import { useThemeClasses } from './hooks/useThemeClasses';
import { useTilt } from './hooks/useTilt';

function App() {
  const themeClasses = useThemeClasses();
  const navThemeToggleTilt = useTilt<HTMLDivElement>({ maxTilt: 3, scale: 1.02 });
  const navLink1Tilt = useTilt<HTMLAnchorElement>({ maxTilt: 3, scale: 1.02 });
  const navLink2Tilt = useTilt<HTMLAnchorElement>({ maxTilt: 3, scale: 1.02 });
  const navButtonTilt = useTilt<HTMLButtonElement>({ maxTilt: 3, scale: 1.02 });
  const [countdown1, setCountdown1] = useState({ hours: 2, minutes: 15, seconds: 34 });
  const [countdown2, setCountdown2] = useState({ hours: 4, minutes: 45, seconds: 22 });
  const [auctionState, setAuctionState] = useState<'pre-auction' | 'auction-live' | 'post-auction'>('auction-live');
  const [auctionStartDate] = useState(new Date('2025-12-23T00:00:00'));
  const [timeUntilAuction, setTimeUntilAuction] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [titleComplete, setTitleComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'faq'>(() => {
    // Initialize from URL
    const path = window.location.pathname;
    return path === '/faq' || path === '/how-to-ico' ? 'faq' : 'home';
  });
  
  // Summary section data - to be fetched from data source
  const [summaryData, _setSummaryData] = useState({
    tokensAvailable: '5M',
    tokensAvailablePercentage: '5%',
    auctionLengthBlocks: 10000,
    epochs: '5 epochs',
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
    currentBlock: 4533,
    totalBlocks: 10000,
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
  
  // My Bid data - to be fetched from data source
  const [myBidData, _setMyBidData] = useState<Array<{ id: string; budget: number; maxPrice: number }>>([
    // Example bids - remove when connecting to real data source
    // { id: '1', budget: 5000, maxPrice: 600 },
    // { id: '2', budget: 3000, maxPrice: 550 },
  ]);
  
  
  // TODO: Fetch data from API/data source
  // useEffect(() => {
  //   Promise.all([
  //     fetchSummaryData().then(data => _setSummaryData(data)),
  //     fetchMyPositionData().then(data => _setMyPositionData(data)),
  //     fetchAuctionData().then(data => _setAuctionData(data)),
  //     fetchSwapData().then(data => _setSwapData(data)),
  //   ]);
  // }, []);

  // Handle browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPage(path === '/faq' || path === '/how-to-ico' ? 'faq' : 'home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when page changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPage === 'faq' && currentPath !== '/faq' && currentPath !== '/how-to-ico') {
      window.history.pushState({ page: 'faq' }, '', '/faq');
    } else if (currentPage === 'home' && (currentPath === '/faq' || currentPath === '/how-to-ico')) {
      window.history.pushState({ page: 'home' }, '', '/');
    }
  }, [currentPage]);

  useEffect(() => {
    // Start showing content shortly after title starts animating
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 500); // Start after 500ms

    return () => clearTimeout(contentTimer);
  }, []);

  useEffect(() => {
    // Only run countdown if in auction-live state
    if (auctionState !== 'auction-live') return;

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
  }, [auctionState]);

  // Countdown to auction start date
  useEffect(() => {
    if (auctionState !== 'pre-auction') return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = auctionStartDate.getTime() - now;

      if (distance < 0) {
        setTimeUntilAuction({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeUntilAuction({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [auctionState, auctionStartDate]);

  // Simulate new transactions - increment values periodically
  useEffect(() => {
    if (auctionState !== 'auction-live') return;
    
    const transactionInterval = setInterval(() => {
      _setSummaryData(prev => ({
        ...prev,
        totalBids: prev.totalBids + Math.floor(Math.random() * 3) + 1, // Increment by 1-3
        activeBidders: prev.activeBidders + (Math.random() > 0.7 ? 1 : 0), // Occasionally increment
        totalValueLocked: prev.totalValueLocked + Math.floor(Math.random() * 50000) + 10000, // Increment by 10k-60k
      }));
    }, 5000); // Update every 5 seconds (reduced frequency)

    return () => clearInterval(transactionInterval);
  }, [auctionState]);

  const formatTime = useCallback((time: { hours: number; minutes: number; seconds: number }) => {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  }, []);

  return (
    <div className={`min-h-screen ${themeClasses.mainBackground} text-white`}>
      {/* Lightning Background - with transparency */}
      {currentPage === 'home' && auctionState !== 'post-auction' && (
        <div className="absolute top-0 left-0 right-0 z-0 pointer-events-none" style={{ height: '100vh' }}>
          <Lightning 
            hue={186}
            xOffset={0}
            speed={0.5}
            intensity={0.8}
            size={1.2}
          />
        </div>
      )}
        
      <header className={`relative border-b border-gray-800 ${themeClasses.headerBackground} bg-opacity-80 backdrop-blur-sm z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Hamburger menu button - visible on mobile/tablet */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-6 sm:gap-8 md:gap-12">
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('home');
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src="/assets/twilight-logo.png" alt="Twilight Logo" style={{ minWidth: '108px', height: 'auto' }} />
              <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold whitespace-nowrap">Token Lightning Sale</span>
            </a>
            <div ref={navThemeToggleTilt} style={{ transformStyle: 'preserve-3d' }}>
              <ThemeToggle />
            </div>
            </div>
          </div>
          <nav className="flex items-center gap-4 sm:gap-8">
            {/* Desktop menu items */}
            <a 
              href="/faq" 
              ref={navLink1Tilt} 
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(currentPage === 'faq' ? 'home' : 'faq');
              }}
              className={`hidden md:block transition-colors text-sm sm:text-base ${currentPage === 'faq' ? themeClasses.textAccent : 'text-gray-300 hover:text-white'}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              How to ICO
            </a>
            <a href="https://quasar-8.gitbook.io/twilight-docs" target="_blank" rel="noopener noreferrer" ref={navLink2Tilt} className="hidden md:block text-gray-300 hover:text-white transition-colors text-sm sm:text-base" style={{ transformStyle: 'preserve-3d' }}>Twilight Docs</a>
            
            <button ref={navButtonTilt} className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border ${themeClasses.borderAccent} ${themeClasses.textAccent} rounded ${themeClasses.hoverBgAccent} ${themeClasses.textAccentHover} transition-colors text-sm sm:text-base`} style={{ transformStyle: 'preserve-3d' }}>
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </button>
          </nav>
        </div>
        
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3">
              <a 
                href="/faq" 
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(currentPage === 'faq' ? 'home' : 'faq');
                  setMobileMenuOpen(false);
                }}
                className={`transition-colors text-sm ${currentPage === 'faq' ? themeClasses.textAccent : 'text-gray-300 hover:text-white'}`}
              >
                How to ICO
              </a>
              <a 
                href="https://quasar-8.gitbook.io/twilight-docs" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Twilight Docs
              </a>
            </div>
          </div>
        )}
      </header>

      <AnnouncementBanner state={auctionState} />

      {currentPage === 'home' && (
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 z-10">
        <div className="mb-4 sm:mb-6 overflow-visible pt-0 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2 md:gap-3 overflow-visible pt-0">
            {/* Title Container */}
            <div className="text-center sm:text-left flex flex-col justify-center pt-0">
              <h1 id="title" className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 font-mono tracking-tight whitespace-nowrap pt-0 mt-0">
                <TypewriterText 
                  text={[
                    "Twilight Token Auction",
                    "Zero Margin",
                    "Private Leverage",
                    "Private PnL"
                  ]}
                  speed={80}
                  delayBetweenTexts={3000}
                  onComplete={() => setTitleComplete(true)}
                />
              </h1>
              <p 
                id="subtitle" 
                className={`text-xs sm:text-sm md:text-base lg:text-lg text-gray-400 transition-all duration-[2000ms] ease-out ${
                  titleComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Untraceable Bitcoin on Privacy DEX
              </p>
            </div>
            <div className="flex-shrink-0 overflow-visible mt-4 sm:mt-6">
              <AnimatedSection delay={0} animation="fade-in-up">
                <BitcoinShield className="h-[196px] sm:h-[224px] md:h-[252px] lg:h-[280px]" />
              </AnimatedSection>
            </div>
          </div>
        </div>

        <div className={`transition-opacity duration-1000 ease-out ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <AnimatedSection delay={100} animation="fade-in-up">
            {auctionState === 'pre-auction' ? (
              <div className="flex justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-1/3">
                  <AnimatedSection delay={0}>
                    <TiltCard maxTilt={5} scale={1.02}>
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
                    <TiltCard maxTilt={5} scale={1.02}>
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`} />
                          <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Auction Length</div>
                        </div>
                        <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${themeClasses.textAccent}`}>
                          {summaryData.auctionLengthBlocks.toLocaleString()} blocks{' '}
                          <span className="text-xs sm:text-sm text-gray-500">{summaryData.epochs}</span>
                        </div>
                      </div>
                    </TiltCard>
                  </AnimatedSection>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
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
        </div>
      </div>
      )}
      {/* End of Hero and Summary Section */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-4">
        {currentPage === 'faq' ? (
          <FAQ />
        ) : (
          <>
        <div className={`transition-opacity duration-1000 ease-out ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <AnimatedSection delay={200} animation="fade-in-up">
            <div className="flex items-center justify-center sm:justify-start mb-3 sm:mb-4">
              <StateSlider value={auctionState} onChange={setAuctionState} />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={300} animation="fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 items-stretch">
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
                      <ElectricBorder color="#7df9ff" speed={0.75} chaos={0.375} thickness={1.5} className="h-full" style={{ borderRadius: '16px' }}>
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
                          <div className="text-center">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Auction Starts In</h2>
                            
                            {/* Countdown Timer */}
                            <div className="flex justify-center gap-2 sm:gap-4 mb-4">
                              <div className="flex flex-col items-center">
                                <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${themeClasses.textAccent}`}>
                                  {String(timeUntilAuction.days).padStart(2, '0')}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 uppercase">Days</div>
                              </div>
                              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-600">:</div>
                              <div className="flex flex-col items-center">
                                <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${themeClasses.textAccent}`}>
                                  {String(timeUntilAuction.hours).padStart(2, '0')}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 uppercase">Hours</div>
                              </div>
                              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-600">:</div>
                              <div className="flex flex-col items-center">
                                <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${themeClasses.textAccent}`}>
                                  {String(timeUntilAuction.minutes).padStart(2, '0')}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 uppercase">Mins</div>
                              </div>
                              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-600">:</div>
                              <div className="flex flex-col items-center">
                                <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${themeClasses.textAccent}`}>
                                  {String(timeUntilAuction.seconds).padStart(2, '0')}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 uppercase">Secs</div>
                              </div>
                            </div>
                            
                            <p className="text-sm sm:text-base text-gray-400 mb-2">Get ready to participate in the Twilight Token Auction</p>
                            <p className={`text-sm sm:text-base ${themeClasses.textAccent} font-medium`}>
                              {auctionStartDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </ElectricBorder>
                    )}
            </div>
          </AnimatedSection>
          <AnimatedSection delay={150} animation="fade-in">
            <div className="flex flex-col gap-3 sm:gap-4 h-full">
              {auctionState === 'auction-live' && (
                <MyBid 
                  activeBids={myBidData}
                />
              )}
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
          </>
        )}
      </main>

      <footer className="border-t border-gray-800 mt-4 sm:mt-6 py-4 sm:py-6 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">© 2024 Twilight Protocol. All rights reserved.</p>
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center">
              <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
