import React, { useMemo } from 'react';
import {
  BarChart3,
  Clock,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  PieChart,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Subject, StudySession, LearningState, UserPreferences } from '../types';
import { exportBackupJSON } from '../utils/storage';
import { INITIAL_STATE } from '../data/initialData';

interface AnalyticsViewProps {
  state: LearningState;
  onRestoreState: (state: LearningState) => void;
  onResetToSample: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  state,
  onRestoreState,
  onResetToSample,
}) => {
  const { subjects, sessions, preferences } = state;

  // Total study time
  const totalMinutes = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [sessions]);

  // Breakdown by subject
  const subjectTimeBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s) => {
      map[s.subjectId] = (map[s.subjectId] || 0) + s.durationMinutes;
    });

    return subjects
      .map((sub) => {
        const mins = map[sub.id] || 0;
        const percent = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
        return {
          id: sub.id,
          title: sub.title,
          color: sub.color || '#6366f1',
          minutes: mins,
          hours: (mins / 60).toFixed(1),
          percent,
        };
      })
      .sort((a, b) => b.minutes - a.minutes);
  }, [subjects, sessions, totalMinutes]);

  // Day of week breakdown (0: Sun ... 6: Sat)
  const dayOfWeekDistribution = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    sessions.forEach((s) => {
      const d = new Date(s.date + 'T00:00:00');
      const dayIdx = d.getDay();
      counts[dayIdx] += s.durationMinutes;
    });

    const maxMins = Math.max(1, ...counts);

    return days.map((day, idx) => ({
      day,
      minutes: counts[idx],
      hours: (counts[idx] / 60).toFixed(1),
      barHeightPercent: Math.round((counts[idx] / maxMins) * 100),
    }));
  }, [sessions]);

  // Average session length and flow state ratio
  const avgSessionMinutes = useMemo(() => {
    if (sessions.length === 0) return 0;
    return Math.round(totalMinutes / sessions.length);
  }, [totalMinutes, sessions]);

  const flowStateCount = useMemo(() => {
    return sessions.filter((s) => s.moodRating >= 4).length;
  }, [sessions]);

  const flowPercent = useMemo(() => {
    if (sessions.length === 0) return 0;
    return Math.round((flowStateCount / sessions.length) * 100);
  }, [flowStateCount, sessions]);

  const handleExport = () => {
    exportBackupJSON(state);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.subjects) && Array.isArray(parsed.sessions)) {
          onRestoreState(parsed);
          alert('Study workspace restored successfully!');
        } else {
          alert('Invalid backup JSON structure.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Learning Analytics &amp; Velocity
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Quantitative feedback loop on your study habits and cognitive energy
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 mb-1">Total Time Invested</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {(totalMinutes / 60).toFixed(1)} hrs
          </div>
          <div className="text-xs text-slate-500 mt-1">{totalMinutes} total minutes</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 mb-1">Average Session Duration</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {avgSessionMinutes} mins
          </div>
          <div className="text-xs text-slate-500 mt-1">across {sessions.length} study sessions</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 mb-1">Flow State Rate</div>
          <div className="text-2xl font-bold text-indigo-600 font-mono tabular-nums">
            {flowPercent}%
          </div>
          <div className="text-xs text-slate-500 mt-1">rated 4★ or 5★ focus energy</div>
        </div>
      </div>

      {/* Subject Time Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Time Distribution by Subject</h2>

        {/* Stacked multi-color progress bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex mb-6">
          {subjectTimeBreakdown.map((item) => (
            <div
              key={item.id}
              style={{
                width: `${item.percent}%`,
                backgroundColor: item.color,
              }}
              title={`${item.title}: ${item.percent}% (${item.hours}h)`}
              className="h-full transition-all duration-300"
            />
          ))}
        </div>

        {/* Subject Rows */}
        <div className="divide-y divide-slate-100">
          {subjectTimeBreakdown.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-800">{item.title}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-slate-600 tabular-nums font-medium">
                  {item.hours} hrs ({item.minutes}m)
                </span>
                <span className="w-10 text-right font-mono font-bold text-slate-900 tabular-nums">
                  {item.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day of Week Distribution Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Study Volume by Day of Week</h2>
            <p className="text-xs text-slate-500">Discover which days produce your deepest work</p>
          </div>
        </div>

        <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
          {dayOfWeekDistribution.map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                {item.minutes > 0 ? `${item.hours}h` : '-'}
              </span>
              <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg h-28 flex items-end p-1">
                <div
                  className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-t transition-all duration-300"
                  style={{ height: `${Math.max(4, item.barHeightPercent)}%` }}
                  title={`${item.day}: ${item.minutes} minutes`}
                />
              </div>
              <span className="text-xs font-semibold text-slate-700">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Backup & Workspace Portability */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Data Storage &amp; Portability</h2>
        <p className="text-xs text-slate-500 mb-6">
          Your study roadmaps, checklists, flashcards, and notes are saved locally in your browser.
          Export backups anytime to keep your learning record safe.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={onResetToSample}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset to Starter Samples</span>
          </button>
        </div>
      </div>
    </div>
  );
};
