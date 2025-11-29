import { useThemeClasses } from '../hooks/useThemeClasses';

interface AnnouncementBannerProps {
  state: 'pre-auction' | 'auction-live' | 'post-auction';
}

const messages = {
  'pre-auction': "Don't miss the only chance to get allocation for untraceable bitcoin privacy token",
  'auction-live': 'Twilight Token Auction is Live!',
  'post-auction': 'Auction has ended. Twilight tokens are now tradeable!',
};

export function AnnouncementBanner({ state }: AnnouncementBannerProps) {
  const themeClasses = useThemeClasses();
  const message = messages[state];
  const messageWithSpacing = `${message}                    •                    `;

  return (
    <div className={`relative ${themeClasses.bgGradient} overflow-hidden py-2 z-10`}>
      <div className="relative w-full">
        <div className="flex animate-marquee whitespace-nowrap">
          {/* Single message instance */}
          <span className={`text-sm sm:text-base ${themeClasses.textAccent} font-medium inline-block`}>
            {messageWithSpacing}
          </span>
        </div>
      </div>
    </div>
  );
}

