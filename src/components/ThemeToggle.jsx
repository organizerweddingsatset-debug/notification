import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      title={isDark ? 'Mode Gelap Aktif (Klik untuk Mode Terang)' : 'Mode Terang Aktif (Klik untuk Mode Gelap)'}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all duration-300 active:scale-95 select-none ${
        isDark
          ? 'bg-white/5 border-white/10 hover:bg-white/10 text-amber-300 hover:border-amber-400/40'
          : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700 hover:border-slate-300 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          // Moon Icon (Dark Mode Active)
          <svg
            className="w-4 h-4 text-amber-300 transition-transform duration-300 rotate-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          // Sun Icon (Light Mode Active)
          <svg
            className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </div>

      {showLabel && (
        <span className="text-[11px] font-medium font-sans">
          {isDark ? 'Mode Gelap' : 'Mode Terang'}
        </span>
      )}
    </button>
  );
}
