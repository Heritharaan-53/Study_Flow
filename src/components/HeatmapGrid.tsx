import { useMemo, useState } from 'react';
import { StudySession } from '../types';
import { generatePastYearDays, formatDate } from '../utils/date';

interface HeatmapGridProps {
  sessions: StudySession[];
}

export function HeatmapGrid({ sessions }: HeatmapGridProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    minutes: number;
    x: number;
    y: number;
  } | null>(null);

  const days = useMemo(() => generatePastYearDays(sessions), [sessions]);

  // Group into columns of 7 days (weeks)
  const weeks = useMemo(() => {
    const result: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  const getColorClass = (intensity: number) => {
    switch (intensity) {
      case 1:
        return 'bg-indigo-100 hover:ring-2 hover:ring-indigo-300';
      case 2:
        return 'bg-indigo-300 hover:ring-2 hover:ring-indigo-400';
      case 3:
        return 'bg-indigo-500 hover:ring-2 hover:ring-indigo-600';
      case 4:
        return 'bg-indigo-700 hover:ring-2 hover:ring-indigo-800';
      default:
        return 'bg-slate-100 hover:bg-slate-200';
    }
  };

  const totalMinutesInGrid = useMemo(() => {
    return days.reduce((acc, d) => acc + d.minutes, 0);
  }, [days]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-slate-500">
          Last 16 Weeks Activity · <span className="font-semibold text-slate-700 tabular-nums">{(totalMinutesInGrid / 60).toFixed(1)} hrs logged</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-100 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-300 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-700 inline-block"></span>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1.5 min-w-max">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredDay({
                      date: day.date,
                      minutes: day.minutes,
                      x: rect.left + rect.width / 2,
                      y: rect.top - 8,
                    });
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-3.5 h-3.5 rounded-sm cursor-pointer transition-colors duration-150 ${getColorClass(
                    day.intensity
                  )}`}
                  aria-label={`${day.date}: ${day.minutes} minutes`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full px-2.5 py-1 bg-slate-900 text-white text-xs rounded shadow-lg whitespace-nowrap"
          style={{ left: hoveredDay.x, top: hoveredDay.y }}
        >
          <div className="font-semibold tabular-nums">
            {hoveredDay.minutes > 0 ? `${hoveredDay.minutes} mins studied` : 'No study logged'}
          </div>
          <div className="text-[11px] text-slate-300">{formatDate(hoveredDay.date)}</div>
        </div>
      )}
    </div>
  );
}
