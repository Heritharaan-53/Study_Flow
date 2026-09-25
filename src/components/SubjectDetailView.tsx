import React, { useState } from 'react';
import {
  ArrowLeft,
  Timer,
  Plus,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Trash2,
  Calendar,
  ExternalLink,
  X,
} from 'lucide-react';
import { Subject, StudyModule, ChecklistItem, Flashcard, StudyNote, StudySession } from '../types';
import { formatDate, formatTimeAgo, getTodayDateString } from '../utils/date';
import { sound } from '../utils/audio';

interface SubjectDetailViewProps {
  subject: Subject;
  sessions: StudySession[];
  onBack: () => void;
  onStartFocus: (subjectId: string, moduleId?: string) => void;
  onStartFlashcardReview: (cards: Flashcard[], title: string) => void;
  onUpdateSubject: (updated: Subject) => void;
}

export const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({
  subject,
  sessions,
  onBack,
  onStartFocus,
  onStartFlashcardReview,
  onUpdateSubject,
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'flashcards' | 'notes' | 'sessions'>('roadmap');

  // Expanded modules state
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    subject.modules.forEach((m) => {
      init[m.id] = true;
    });
    return init;
  });

  // Adding new item/module state
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [newModuleEstHours, setNewModuleEstHours] = useState(8);

  const [addingTaskForModuleId, setAddingTaskForModuleId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Flashcard form state
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');

  // Note form state
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteKeyTakeaway, setNewNoteKeyTakeaway] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');

  // Calculate stats
  const totalTasks = subject.modules.reduce((acc, m) => acc + m.items.length, 0);
  const completedTasks = subject.modules.reduce(
    (acc, m) => acc + m.items.filter((i) => i.isCompleted).length,
    0
  );
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const subjectSessions = sessions.filter((s) => s.subjectId === subject.id);
  const totalMinutesStudied = subjectSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHoursStudied = (totalMinutesStudied / 60).toFixed(1);

  const todayStr = getTodayDateString();
  const dueCards = subject.flashcards.filter((f) => f.nextReviewDate <= todayStr);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleTask = (moduleId: string, taskId: string) => {
    sound.playCheckmarkTick();
    const updatedModules = subject.modules.map((m) => {
      if (m.id !== moduleId) return m;
      const updatedItems = m.items.map((it) => {
        if (it.id !== taskId) return it;
        return { ...it, isCompleted: !it.isCompleted };
      });

      const allDone = updatedItems.length > 0 && updatedItems.every((i) => i.isCompleted);
      const anyDone = updatedItems.some((i) => i.isCompleted);

      return {
        ...m,
        items: updatedItems,
        status: allDone ? ('completed' as const) : anyDone ? ('in_progress' as const) : ('not_started' as const),
      };
    });

    onUpdateSubject({ ...subject, modules: updatedModules });
  };

  const handleAddTask = (moduleId: string) => {
    if (!newTaskTitle.trim()) return;
    const newTask: ChecklistItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      isCompleted: false,
    };

    const updatedModules = subject.modules.map((m) => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        items: [...m.items, newTask],
      };
    });

    onUpdateSubject({ ...subject, modules: updatedModules });
    setNewTaskTitle('');
    setAddingTaskForModuleId(null);
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    const newModule: StudyModule = {
      id: `mod-${Date.now()}`,
      title: newModuleTitle.trim(),
      description: newModuleDescription.trim(),
      estimatedHours: Number(newModuleEstHours) || 6,
      status: 'not_started',
      items: [],
    };

    onUpdateSubject({
      ...subject,
      modules: [...subject.modules, newModule],
    });

    setNewModuleTitle('');
    setNewModuleDescription('');
    setShowAddModule(false);
  };

  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardFront.trim() || !newCardBack.trim()) return;

    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      subjectId: subject.id,
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      difficulty: 'new',
      nextReviewDate: todayStr,
      intervalDays: 1,
      reviewCount: 0,
      lastReviewed: null,
    };

    onUpdateSubject({
      ...subject,
      flashcards: [...subject.flashcards, newCard],
    });

    setNewCardFront('');
    setNewCardBack('');
    setShowAddCard(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const tags = newNoteTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newNote: StudyNote = {
      id: `note-${Date.now()}`,
      subjectId: subject.id,
      title: newNoteTitle.trim(),
      keyTakeaway: newNoteKeyTakeaway.trim(),
      content: newNoteContent.trim(),
      tags,
      createdAt: todayStr,
      updatedAt: todayStr,
    };

    onUpdateSubject({
      ...subject,
      notes: [newNote, ...subject.notes],
    });

    setNewNoteTitle('');
    setNewNoteKeyTakeaway('');
    setNewNoteContent('');
    setNewNoteTags('');
    setShowAddNote(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Roadmaps</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onStartFocus(subject.id)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Study This Now</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {subject.coverImage && (
          <div className="h-44 w-full overflow-hidden relative bg-slate-900">
            <img
              src={subject.coverImage}
              alt={subject.title}
              className="w-full h-full object-cover opacity-85"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                  {subject.category} · {subject.level}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
                  {subject.title}
                </h1>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {!subject.coverImage && (
            <div className="mb-4">
              <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                {subject.category} · {subject.level}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                {subject.title}
              </h1>
            </div>
          )}

          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed mb-6">
            {subject.description}
          </p>

          {/* Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Syllabus Completion</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {completionPercentage}%
              </span>
              <span className="text-slate-400 text-[11px] ml-1">
                ({completedTasks}/{totalTasks} tasks)
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Time Invested</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {totalHoursStudied} hrs
              </span>
              <span className="text-slate-400 text-[11px] ml-1">
                (target: {subject.targetWeeklyHours}h/wk)
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Spaced Recall Cards</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {subject.flashcards.length} cards
              </span>
              {dueCards.length > 0 && (
                <span className="text-amber-600 font-semibold text-[11px] ml-1">
                  ({dueCards.length} due today)
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Target Completion</span>
              <span className="text-base font-bold text-slate-900">
                {formatDate(subject.targetEndDate)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="px-6 border-t border-slate-100 flex items-center gap-6 text-xs font-semibold bg-slate-50/50">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`py-3 relative transition-colors ${
              activeTab === 'roadmap' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Curriculum &amp; Milestones ({subject.modules.length})
            {activeTab === 'roadmap' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`py-3 relative transition-colors flex items-center gap-1.5 ${
              activeTab === 'flashcards' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Flashcards ({subject.flashcards.length})
            {dueCards.length > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                {dueCards.length} due
              </span>
            )}
            {activeTab === 'flashcards' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 relative transition-colors ${
              activeTab === 'notes' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Study Journal &amp; Notes ({subject.notes.length})
            {activeTab === 'notes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 relative transition-colors ${
              activeTab === 'sessions' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Session History ({subjectSessions.length})
            {activeTab === 'sessions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Curriculum & Milestones */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Learning Pathway &amp; Modules</h2>
            <button
              onClick={() => setShowAddModule(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </button>
          </div>

          {/* Module List */}
          <div className="space-y-3">
            {subject.modules.map((mod, modIdx) => {
              const isExpanded = !!expandedModules[mod.id];
              const completedCount = mod.items.filter((i) => i.isCompleted).length;
              const allDone = mod.items.length > 0 && completedCount === mod.items.length;

              return (
                <div
                  key={mod.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all shadow-xs"
                >
                  {/* Module Accordion Header */}
                  <div
                    onClick={() => toggleModule(mod.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{mod.title}</h3>
                          {allDone && (
                            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                              Completed
                            </span>
                          )}
                        </div>
                        {mod.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        {completedCount}/{mod.items.length} tasks
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartFocus(subject.id, mod.id);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors flex items-center gap-1"
                        title="Study this module"
                      >
                        <Timer className="w-3 h-3" />
                        <span className="hidden sm:inline">Focus</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Checklist */}
                  {isExpanded && (
                    <div className="px-6 pb-4 pt-2 border-t border-slate-100 bg-slate-50/30 space-y-2">
                      {mod.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleTask(mod.id, item.id)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className={`transition-colors ${
                                item.isCompleted ? 'text-emerald-600' : 'text-slate-300 group-hover:text-slate-400'
                              }`}
                            >
                              {item.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 fill-emerald-50" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                            <span
                              className={`text-xs ${
                                item.isCompleted
                                  ? 'line-through text-slate-400 font-normal'
                                  : 'text-slate-800 font-medium'
                              }`}
                            >
                              {item.title}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Add task inline */}
                      {addingTaskForModuleId === mod.id ? (
                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask(mod.id)}
                            placeholder="Milestone task title..."
                            className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleAddTask(mod.id)}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setAddingTaskForModuleId(null)}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAddingTaskForModuleId(mod.id);
                            setNewTaskTitle('');
                          }}
                          className="text-xs text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1.5 pt-2"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add milestone task</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Module Modal */}
          {showAddModule && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Add Curriculum Module</h3>
                  <button
                    onClick={() => setShowAddModule(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddModule} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Module Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder="e.g. 04. Advanced Asynchronous Pipelines"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={newModuleDescription}
                      onChange={(e) => setNewModuleDescription(e.target.value)}
                      placeholder="Core concepts and objectives for this module..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newModuleEstHours}
                      onChange={(e) => setNewModuleEstHours(parseInt(e.target.value) || 5)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModule(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                      Create Module
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Spaced Repetition Deck</h2>
              <p className="text-xs text-slate-500">
                {dueCards.length > 0
                  ? `${dueCards.length} cards are ready for review today.`
                  : 'All caught up! Next reviews scheduled according to retention curve.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {subject.flashcards.length > 0 && (
                <button
                  onClick={() =>
                    onStartFlashcardReview(
                      dueCards.length > 0 ? dueCards : subject.flashcards,
                      subject.title
                    )
                  }
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    {dueCards.length > 0
                      ? `Review Due Cards (${dueCards.length})`
                      : 'Review All Cards'}
                  </span>
                </button>
              )}

              <button
                onClick={() => setShowAddCard(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {subject.flashcards.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
              <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No flashcards yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
                Add active recall cards to solidify key formulas, definitions, and mental models.
              </p>
              <button
                onClick={() => setShowAddCard(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Create First Flashcard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subject.flashcards.map((card) => {
                const isDue = card.nextReviewDate <= todayStr;
                return (
                  <div
                    key={card.id}
                    className={`p-4 rounded-xl border bg-white flex flex-col justify-between transition-all ${
                      isDue ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                        <span className="font-semibold text-slate-500">QUESTION</span>
                        {isDue ? (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                            Due Today
                          </span>
                        ) : (
                          <span>Next: {formatDate(card.nextReviewDate)}</span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-800 mb-3 whitespace-pre-wrap">
                        {card.front}
                      </p>

                      <div className="text-[11px] text-slate-400 mb-1 font-semibold">ANSWER</div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg whitespace-pre-wrap font-mono text-[11px]">
                        {card.back}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                      <span>Interval: {card.intervalDays}d</span>
                      <span>Reviewed: {card.reviewCount} times</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Flashcard Modal */}
          {showAddCard && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Add Recall Flashcard</h3>
                  <button
                    onClick={() => setShowAddCard(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddFlashcard} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Front: Prompt / Question *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={newCardFront}
                      onChange={(e) => setNewCardFront(e.target.value)}
                      placeholder="e.g. What is the difference between static and dynamic dispatch in Rust?"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Back: Explanation / Code / Answer *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={newCardBack}
                      onChange={(e) => setNewCardBack(e.target.value)}
                      placeholder="Key takeaway, code snippet, or definition..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddCard(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                      Save Flashcard
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Study Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Cornell Journal &amp; Study Notes</h2>
              <p className="text-xs text-slate-500">Document architectural insights and mental models</p>
            </div>

            <button
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </button>
          </div>

          {subject.notes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No notes written yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
                Keep a running record of breakthroughs, edge cases, and summaries as you study.
              </p>
              <button
                onClick={() => setShowAddNote(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Write First Note
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {subject.notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900">{note.title}</h3>
                    <span className="text-[11px] text-slate-400">{formatDate(note.createdAt)}</span>
                  </div>

                  {note.keyTakeaway && (
                    <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 font-medium mb-3">
                      <span className="font-bold">Core Insight: </span>
                      {note.keyTakeaway}
                    </div>
                  )}

                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>

                  {note.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>Tags:</span>
                      {note.tags.map((tag) => (
                        <span key={tag} className="text-slate-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Note Modal */}
          {showAddNote && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">New Study Note</h3>
                  <button
                    onClick={() => setShowAddNote(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Note Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="e.g. Mental Model: Trait bounds vs Concrete typing"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Key Takeaway (One sentence synthesis)
                    </label>
                    <input
                      type="text"
                      value={newNoteKeyTakeaway}
                      onChange={(e) => setNewNoteKeyTakeaway(e.target.value)}
                      placeholder="The single most important principle to remember"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Detailed Content &amp; Code Notes
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Write your study notes, synthesis, and takeaways..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newNoteTags}
                      onChange={(e) => setNewNoteTags(e.target.value)}
                      placeholder="syntax, memory, borrow-checker"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddNote(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                      Save Note
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Session History */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Study Sessions &amp; Time Log</h2>
              <p className="text-xs text-slate-500">
                Total time: <span className="font-semibold text-slate-700">{totalHoursStudied} hours</span> across{' '}
                <span className="font-semibold text-slate-700">{subjectSessions.length} sessions</span>
              </p>
            </div>
          </div>

          {subjectSessions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No study sessions logged yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
                Launch the timer studio to log your first deep work session.
              </p>
              <button
                onClick={() => onStartFocus(subject.id)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Start Study Session
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {subjectSessions.map((sess) => (
                <div key={sess.id} className="p-4 flex items-start justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 tabular-nums">
                        {sess.durationMinutes} mins
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="capitalize text-slate-600">{sess.sessionType.replace('_', ' ')}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-amber-600 font-medium">{'★'.repeat(sess.moodRating)}</span>
                    </div>

                    {sess.notes && (
                      <p className="text-slate-600 text-xs mt-1">{sess.notes}</p>
                    )}

                    {sess.distractionsLogged > 0 && (
                      <span className="inline-block text-[11px] text-slate-400 mt-1">
                        {sess.distractionsLogged} distractions parked
                      </span>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    <div>{formatDate(sess.date)}</div>
                    <div>{formatTimeAgo(sess.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
