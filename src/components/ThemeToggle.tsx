import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs sm:text-sm text-gray-400">I am</span>
      <div className="flex items-center gap-0.5 bg-gray-800 rounded p-1 border border-gray-700">
        <button
          onClick={() => setTheme('ice')}
          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
            theme === 'ice'
              ? 'bg-cyan-400 text-black shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Ice
        </button>
        <button
          onClick={() => setTheme('fire')}
          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-sm transition-all duration-200 ${
            theme === 'fire'
              ? 'bg-red-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Fire
        </button>
      </div>
    </div>
  );
}

