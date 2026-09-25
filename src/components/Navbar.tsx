import React from 'react';
import { Timer, Sparkles } from 'lucide-react';
import { UserPreferences } from '../types';

export type ActiveTab = 'dashboard' | 'subjects' | 'flashcards' | 'journal' | 'analytics';

interface NavbarProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onStartFocus: () => void;
  dueCardsCount: number;
  preferences: UserPreferences;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onStartFocus,
  dueCardsCount,
  preferences,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onTabChange('dashboard')}
          className="text-lg font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        >
          OmniStudy
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'dashboard'
                ? 'text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Overview
            {currentTab === 'dashboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('subjects')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'subjects'
                ? 'text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Roadmaps
            {currentTab === 'subjects' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('flashcards')}
            className={`whitespace-nowrap transition-colors relative py-1 flex items-center gap-1.5 ${
              currentTab === 'flashcards'
                ? 'text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Flashcards
            {dueCardsCount > 0 && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded tabular-nums">
                {dueCardsCount}
              </span>
            )}
            {currentTab === 'flashcards' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('journal')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'journal'
                ? 'text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Journal
            {currentTab === 'journal' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`whitespace-nowrap transition-colors relative py-1 ${
              currentTab === 'analytics'
                ? 'text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Analytics
            {currentTab === 'analytics' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onStartFocus}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Focus Session</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            title="Learner Profile & Preferences"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0">
              {preferences.avatarUrl ? (
                <img
                  src={preferences.avatarUrl}
                  alt={preferences.userName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-indigo-700 bg-indigo-50">
                  {preferences.userName.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-slate-700 hidden lg:inline max-w-[90px] truncate">
              {preferences.userName}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 py-2 bg-slate-50 text-xs font-medium text-slate-600">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`px-2 py-1 rounded ${currentTab === 'dashboard' ? 'text-indigo-600 font-semibold' : ''}`}
        >
          Overview
        </button>
        <button
          onClick={() => onTabChange('subjects')}
          className={`px-2 py-1 rounded ${currentTab === 'subjects' ? 'text-indigo-600 font-semibold' : ''}`}
        >
          Roadmaps
        </button>
        <button
          onClick={() => onTabChange('flashcards')}
          className={`px-2 py-1 rounded ${currentTab === 'flashcards' ? 'text-indigo-600 font-semibold' : ''}`}
        >
          Cards ({dueCardsCount})
        </button>
        <button
          onClick={() => onTabChange('journal')}
          className={`px-2 py-1 rounded ${currentTab === 'journal' ? 'text-indigo-600 font-semibold' : ''}`}
        >
          Journal
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-2 py-1 rounded ${currentTab === 'analytics' ? 'text-indigo-600 font-semibold' : ''}`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
};
