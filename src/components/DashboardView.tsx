import React, { useMemo } from 'react';
import {
  Timer,
  Flame,
  Clock,
  BookOpen,
  Layers,
  Plus,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Subject, StudySession, UserPreferences, Flashcard } from '../types';
import { HeatmapGrid } from './HeatmapGrid';
import { calculateStreak, formatDate, formatTimeAgo, getTodayDateString } from '../utils/date';

interface DashboardViewProps {
  subjects: Subject[];
  sessions: StudySession[];
  preferences: UserPreferences;
  onOpenSubject: (subjectId: string) => void;
  onOpenAddSubject: () => void;
  onStartFocus: (subjectId?: string) => void;
  onStartFlashcards: (cards: Flashcard[], title: string) => void;
  onViewAllFlashcards: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subjects,
  sessions,
  preferences,
  onOpenSubject,
  onOpenAddSubject,
  onStartFocus,
  onStartFlashcards,
  onViewAllFlashcards,
}) => {
  const todayStr = getTodayDateString();

  // Calculate streak
  const { currentStreak, longestStreak } = useMemo(() => calculateStreak(sessions), [sessions]);

  // Calculate today's study minutes
  const todayMinutes = useMemo(() => {
    return sessions
      .filter((s) => s.date === todayStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [sessions, todayStr]);

  const dailyGoalPercent = Math.min(
    100,
    Math.round((todayMinutes / (preferences.dailyTargetMinutes || 60)) * 100)
  );

  // Total study hours
  const totalStudyMinutes = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [sessions]);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // All cards due today across all subjects
  const allDueCards = useMemo(() => {
    const list: Flashcard[] = [];
    subjects.forEach((sub) => {
      sub.flashcards.forEach((c) => {
        if (c.nextReviewDate <= todayStr) {
          list.push(c);
        }
      });
    });
    return list;
  }, [subjects, todayStr]);

  // Recent sessions
  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [sessions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome & Daily Goal Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Active Learning Command Center
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {preferences.userName}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Consistency is the key to deep skill mastery. Keep your daily momentum alive.
            </p>
          </div>

          {/* Daily Goal Gauge Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 min-w-[280px]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700">Today's Study Goal</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {todayMinutes} / {preferences.dailyTargetMinutes}m
              </span>
            </div>

            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 ${
                  dailyGoalPercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${dailyGoalPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>
                {dailyGoalPercent >= 100
                  ? 'Daily target completed!'
                  : `${preferences.dailyTargetMinutes - todayMinutes} mins remaining`}
              </span>
              <span className="font-semibold">{dailyGoalPercent}%</span>
            </div>
          </div>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Current Streak</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums font-mono">
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
              </div>
              <div className="text-[11px] text-slate-400">Best: {longestStreak} days</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Hours</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums font-mono">
                {totalStudyHours} hrs
              </div>
              <div className="text-[11px] text-slate-400">{sessions.length} sessions logged</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Skills In Flight</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums font-mono">
                {subjects.length} active
              </div>
              <div className="text-[11px] text-slate-400">Roadmaps tracked</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Reviews Due Today</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums font-mono">
                {allDueCards.length} cards
              </div>
              <div className="text-[11px] text-slate-400">Spaced recall</div>
            </div>
          </div>
        </div>
      </div>

      {/* Due Flashcards Callout Banner (if any due) */}
      {allDueCards.length > 0 && (
        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-indigo-950">
                Active Recall Interval Reached: {allDueCards.length} Flashcards Due
              </h2>
              <p className="text-[11px] text-indigo-700">
                Solidify mental recall before memory decay occurs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onStartFlashcards(allDueCards, 'Daily Due Deck')}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              Start Recall Session ({allDueCards.length})
            </button>
            <button
              onClick={onViewAllFlashcards}
              className="px-3 py-1.5 text-xs text-indigo-700 hover:text-indigo-900 font-medium transition-colors"
            >
              View Deck
            </button>
          </div>
        </div>
      )}

      {/* Activity Heatmap Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Study Rhythm &amp; Consistency</h2>
        <HeatmapGrid sessions={sessions} />
      </div>

      {/* Active Learning Subjects Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Learning Roadmaps</h2>
            <p className="text-xs text-slate-500">Track structured milestones and syllabus progress</p>
          </div>
          <button
            onClick={onOpenAddSubject}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Subject</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => {
            const totalTasks = sub.modules.reduce((acc, m) => acc + m.items.length, 0);
            const doneTasks = sub.modules.reduce(
              (acc, m) => acc + m.items.filter((i) => i.isCompleted).length,
              0
            );
            const percent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

            const subSessions = sessions.filter((s) => s.subjectId === sub.id);
            const totalHours = (
              subSessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60
            ).toFixed(1);

            return (
              <div
                key={sub.id}
                onClick={() => onOpenSubject(sub.id)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
              >
                {/* Visual Cover or Colored Bar */}
                {sub.coverImage ? (
                  <div className="h-32 w-full overflow-hidden relative bg-slate-900">
                    <img
                      src={sub.coverImage}
                      alt={sub.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-300">
                        {sub.category} · {sub.level}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="h-2.5 w-full"
                    style={{ backgroundColor: sub.color || '#6366f1' }}
                  />
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {!sub.coverImage && (
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                        {sub.category} · {sub.level}
                      </div>
                    )}

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {sub.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    {/* Progress bar */}
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Milestones</span>
                      <span className="font-mono font-bold text-slate-800 tabular-nums">
                        {doneTasks}/{totalTasks} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{totalHours} hrs studied</span>
                      <div className="flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                        <span>Roadmap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Create Card */}
          <div
            onClick={onOpenAddSubject}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[260px] group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center mb-3 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
              Learn a New Subject
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Select from curated roadmaps (Languages, Rust, ML, UX) or craft your own syllabus.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Study Sessions</h2>
            <p className="text-xs text-slate-500">Live ledger of deep work and active practice</p>
          </div>
        </div>

        {recentSessions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No study sessions recorded yet. Start a focus session above!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentSessions.map((s) => {
              const sub = subjects.find((subj) => subj.id === s.subjectId);
              return (
                <div
                  key={s.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {sub?.title || 'General Study'}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="capitalize text-slate-500">
                          {s.sessionType.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-amber-600">{'★'.repeat(s.moodRating)}</span>
                      </div>
                      {s.notes && (
                        <p className="text-slate-600 text-xs mt-0.5 max-w-xl">{s.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 text-xs sm:self-center">
                    <span className="font-mono font-semibold text-slate-800 tabular-nums">
                      {s.durationMinutes} mins
                    </span>
                    <span>{formatTimeAgo(s.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
