import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Volume2,
  VolumeX,
  Brain,
  Sparkles,
  Maximize2,
  Minimize2,
  ListPlus,
} from 'lucide-react';
import { Subject, StudySession, SessionType } from '../types';
import { sound } from '../utils/audio';
import { getTodayDateString } from '../utils/date';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialSubjectId?: string | null;
  initialModuleId?: string | null;
  soundEnabled: boolean;
  onSessionComplete: (session: Omit<StudySession, 'id'>) => void;
}

type TimerPreset = 25 | 50 | 5 | 10 | 'stopwatch';

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialSubjectId,
  initialModuleId,
  soundEnabled,
  onSessionComplete,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || (subjects.length > 0 ? subjects[0].id : '')
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModuleId || '');
  const [preset, setPreset] = useState<TimerPreset>(25);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [initialDuration, setInitialDuration] = useState<number>(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(!soundEnabled);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Distraction brain dump
  const [distractionNotes, setDistractionNotes] = useState<string[]>([]);
  const [currentDistractionInput, setCurrentDistractionInput] = useState<string>('');

  // Completion modal state
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [completedMinutes, setCompletedMinutes] = useState<number>(25);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [moodRating, setMoodRating] = useState<1 | 2 | 3 | 4 | 5>(5);

  const containerRef = useRef<HTMLDivElement>(null);

  // Update selected subject when initialSubjectId prop changes
  useEffect(() => {
    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId);
    } else if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [initialSubjectId, subjects]);

  // Update modules based on selected subject
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Timer interval effect
  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      return;
    }

    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (preset === 'stopwatch') {
          setStopwatchSeconds((prev) => prev + 1);
        } else {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              // Timer finished!
              clearInterval(interval!);
              setIsRunning(false);
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isOpen, preset, initialDuration, isBreak]);

  const handleTimerComplete = () => {
    if (!isMuted) {
      if (isBreak) {
        sound.playBreakAlert();
      } else {
        sound.playSessionComplete();
      }
    }

    if (!isBreak) {
      const minutesSpent = Math.max(1, Math.round(initialDuration / 60));
      setCompletedMinutes(minutesSpent);
      setShowSummaryModal(true);
    } else {
      // Break is over, switch back to work
      setIsBreak(false);
      switchPreset(25);
    }
  };

  const switchPreset = (newPreset: TimerPreset) => {
    setIsRunning(false);
    setPreset(newPreset);

    if (newPreset === 'stopwatch') {
      setStopwatchSeconds(0);
      setIsBreak(false);
    } else if (newPreset === 5 || newPreset === 10) {
      setIsBreak(true);
      const totalSec = newPreset * 60;
      setSecondsRemaining(totalSec);
      setInitialDuration(totalSec);
    } else {
      setIsBreak(false);
      const totalSec = newPreset * 60;
      setSecondsRemaining(totalSec);
      setInitialDuration(totalSec);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (preset === 'stopwatch') {
      setStopwatchSeconds(0);
    } else {
      setSecondsRemaining(initialDuration);
    }
  };

  const handleFinishEarly = () => {
    setIsRunning(false);
    let minutesSpent = 0;
    if (preset === 'stopwatch') {
      minutesSpent = Math.max(1, Math.round(stopwatchSeconds / 60));
    } else {
      const elapsedSec = initialDuration - secondsRemaining;
      minutesSpent = Math.max(1, Math.round(elapsedSec / 60));
    }
    setCompletedMinutes(minutesSpent);
    setShowSummaryModal(true);
  };

  const handleSaveSession = () => {
    const sessionType: SessionType =
      preset === 25 ? 'pomodoro' : preset === 50 ? 'deep_work' : 'practice';

    onSessionComplete({
      subjectId: selectedSubjectId,
      moduleId: selectedModuleId || undefined,
      durationMinutes: completedMinutes,
      date: getTodayDateString(),
      timestamp: new Date().toISOString(),
      notes: sessionNotes || (distractionNotes.length > 0 ? `Captured: ${distractionNotes.join('; ')}` : ''),
      moodRating,
      sessionType,
      distractionsLogged: distractionNotes.length,
    });

    setShowSummaryModal(false);
    onClose();
  };

  const addDistraction = () => {
    if (!currentDistractionInput.trim()) return;
    setDistractionNotes((prev) => [...prev, currentDistractionInput.trim()]);
    setCurrentDistractionInput('');
    sound.playCheckmarkTick();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  // Format display time
  const currentSeconds = preset === 'stopwatch' ? stopwatchSeconds : secondsRemaining;
  const minutes = Math.floor(currentSeconds / 60);
  const seconds = currentSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG circular progress calculation
  const progressPercent =
    preset === 'stopwatch'
      ? Math.min(100, (stopwatchSeconds / 3600) * 100)
      : Math.max(0, Math.min(100, ((initialDuration - secondsRemaining) / initialDuration) * 100));

  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">
              {isBreak ? 'Rest & Recharge Break' : 'Deep Study Studio'}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">
              {currentSubject ? currentSubject.title : 'Unassigned'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-medium text-slate-600">
            <button
              onClick={() => switchPreset(25)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                preset === 25 && !isBreak
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Pomodoro (25m)
            </button>
            <button
              onClick={() => switchPreset(50)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                preset === 50 && !isBreak
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Deep Work (50m)
            </button>
            <button
              onClick={() => switchPreset(5)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                preset === 5 && isBreak
                  ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Break (5m)
            </button>
            <button
              onClick={() => switchPreset(10)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                preset === 10 && isBreak
                  ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Break (10m)
            </button>
            <button
              onClick={() => switchPreset('stopwatch')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                preset === 'stopwatch'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Stopwatch
            </button>
          </div>

          {/* Subject & Module Pickers */}
          <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Target Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedModuleId('');
                }}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Module / Milestone
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">General Subject Study</option>
                {currentSubject?.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SVG Circular Progress & Numeric Display */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-64 h-64 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="128"
                cy="128"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress stroke */}
              <circle
                cx="128"
                cy="128"
                r={radius}
                className={`transition-all duration-500 ease-out ${
                  isBreak ? 'stroke-emerald-500' : 'stroke-indigo-600'
                }`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Centered Time readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-mono font-bold tracking-tight text-slate-900 tabular-nums">
                {timeFormatted}
              </span>
              <span className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
                {isBreak ? 'Resting' : isRunning ? 'In Session' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Primary Controls */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={handleReset}
              className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-full font-semibold text-sm shadow-md transition-all flex items-center gap-2 text-white ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : isBreak
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={handleFinishEarly}
              className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Log Session Now"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>

          {/* Distraction Pad / Brain Dump Accordion */}
          <div className="w-full max-w-md mt-8 border border-slate-200 rounded-xl p-4 bg-slate-50/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                <span>Distraction Pad ("Brain Dump")</span>
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {distractionNotes.length} parked
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Don't switch tabs or break flow! Jot quick thoughts here to review after your session.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={currentDistractionInput}
                onChange={(e) => setCurrentDistractionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDistraction()}
                placeholder="e.g. Check electric bill, look up article..."
                className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={addDistraction}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Park
              </button>
            </div>

            {distractionNotes.length > 0 && (
              <ul className="mt-3 space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {distractionNotes.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200 flex items-center justify-between"
                  >
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Session Completion & Review Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Session Complete!</h3>
                  <p className="text-xs text-slate-500">Record your progress and focus state</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Time Studied (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={completedMinutes}
                  onChange={(e) => setCompletedMinutes(parseInt(e.target.value) || 1)}
                  className="w-full text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Focus & Energy State
                </label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((rating) => {
                    const labels = ['Drained', 'Sluggish', 'Neutral', 'Focused', 'Flow State'];
                    return (
                      <button
                        key={rating}
                        onClick={() => setMoodRating(rating)}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                          moodRating === rating
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-semibold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={labels[rating - 1]}
                      >
                        {rating}★
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Session Log / Key Takeaways
                </label>
                <textarea
                  rows={3}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="What concepts clicked? What problems did you solve?"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {distractionNotes.length > 0 && (
                <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">Distractions logged:</span>{' '}
                  {distractionNotes.join(', ')}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Continue Timer
              </button>
              <button
                onClick={handleSaveSession}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                Save &amp; Log Study
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
