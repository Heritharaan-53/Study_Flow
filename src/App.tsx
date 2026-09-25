/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SubjectDetailView } from './components/SubjectDetailView';
import { FocusTimerModal } from './components/FocusTimerModal';
import { FlashcardReviewModal } from './components/FlashcardReviewModal';
import { FlashcardsView } from './components/FlashcardsView';
import { StudyJournalView } from './components/StudyJournalView';
import { AnalyticsView } from './components/AnalyticsView';
import { AddSubjectModal } from './components/AddSubjectModal';
import { SettingsModal } from './components/SettingsModal';
import { LearningState, Subject, StudySession, Flashcard, FlashcardRating, StudyNote, UserPreferences } from './types';
import { loadLearningState, saveLearningState } from './utils/storage';
import { INITIAL_STATE } from './data/initialData';
import { getTodayDateString } from './utils/date';
import { Plus, ArrowRight, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<LearningState>(() => loadLearningState());
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Modal controls
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [focusSubjectId, setFocusSubjectId] = useState<string | null>(null);
  const [focusModuleId, setFocusModuleId] = useState<string | null>(null);

  const [isFlashcardReviewOpen, setIsFlashcardReviewOpen] = useState(false);
  const [activeReviewCards, setActiveReviewCards] = useState<Flashcard[]>([]);
  const [reviewDeckTitle, setReviewDeckTitle] = useState('Recall Review');

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync state changes to localStorage
  useEffect(() => {
    saveLearningState(state);
  }, [state]);

  const todayStr = getTodayDateString();

  // Due flashcards count
  const dueCardsCount = state.subjects.reduce((acc, sub) => {
    return acc + sub.flashcards.filter((c) => c.nextReviewDate <= todayStr).length;
  }, 0);

  // Handlers for Focus Timer
  const handleOpenFocusTimer = (subjectId?: string, moduleId?: string) => {
    setFocusSubjectId(subjectId || (state.subjects[0]?.id ?? null));
    setFocusModuleId(moduleId || null);
    setIsFocusTimerOpen(true);
  };

  const handleSessionComplete = (sessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
    };

    setState((prev) => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
    }));
  };

  // Handlers for Flashcards
  const handleStartFlashcardReview = (cards: Flashcard[], title: string) => {
    if (cards.length === 0) return;
    setActiveReviewCards(cards);
    setReviewDeckTitle(title);
    setIsFlashcardReviewOpen(true);
  };

  const handleRateCard = (
    cardId: string,
    rating: FlashcardRating,
    nextReviewDate: string,
    intervalDays: number
  ) => {
    setState((prev) => {
      const updatedSubjects = prev.subjects.map((sub) => {
        const cardIndex = sub.flashcards.findIndex((c) => c.id === cardId);
        if (cardIndex === -1) return sub;

        const updatedCards = [...sub.flashcards];
        const card = updatedCards[cardIndex];
        updatedCards[cardIndex] = {
          ...card,
          difficulty: rating,
          nextReviewDate,
          intervalDays,
          reviewCount: (card.reviewCount || 0) + 1,
          lastReviewed: todayStr,
        };

        return { ...sub, flashcards: updatedCards };
      });

      return { ...prev, subjects: updatedSubjects };
    });
  };

  const handleAddNewFlashcard = (subjectId: string, front: string, back: string) => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      subjectId,
      front,
      back,
      difficulty: 'new',
      nextReviewDate: todayStr,
      intervalDays: 1,
      reviewCount: 0,
      lastReviewed: null,
    };

    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) =>
        s.id === subjectId ? { ...s, flashcards: [...s.flashcards, newCard] } : s
      ),
    }));
  };

  // Handlers for Subjects
  const handleAddSubject = (newSubject: Subject) => {
    setState((prev) => ({
      ...prev,
      subjects: [newSubject, ...prev.subjects],
    }));
    setSelectedSubjectId(newSubject.id);
  };

  const handleUpdateSubject = (updated: Subject) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  // Handlers for Study Notes
  const handleAddNote = (
    subjectId: string,
    noteData: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newNote: StudyNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: todayStr,
      updatedAt: todayStr,
    };

    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) =>
        s.id === subjectId ? { ...s, notes: [newNote, ...s.notes] } : s
      ),
    }));
  };

  // Handlers for Preferences
  const handleSavePreferences = (prefs: UserPreferences) => {
    setState((prev) => ({ ...prev, preferences: prefs }));
  };

  const handleRestoreState = (restored: LearningState) => {
    setState(restored);
  };

  const handleResetToSample = () => {
    if (window.confirm('Reset all roadmaps and sessions to initial demo data?')) {
      setState(INITIAL_STATE);
      setSelectedSubjectId(null);
    }
  };

  // Determine current active subject for detail view
  const activeSubject = selectedSubjectId
    ? state.subjects.find((s) => s.id === selectedSubjectId)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Bar Contract Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setSelectedSubjectId(null);
          setCurrentTab(tab);
        }}
        onStartFocus={() => handleOpenFocusTimer()}
        dueCardsCount={dueCardsCount}
        preferences={state.preferences}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container Viewport (Baseline 1440px wide presence) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* If a specific subject is selected, render SubjectDetailView */}
        {activeSubject ? (
          <SubjectDetailView
            subject={activeSubject}
            sessions={state.sessions}
            onBack={() => setSelectedSubjectId(null)}
            onStartFocus={(subId, modId) => handleOpenFocusTimer(subId, modId)}
            onStartFlashcardReview={handleStartFlashcardReview}
            onUpdateSubject={handleUpdateSubject}
          />
        ) : (
          <>
            {/* Tab 1: Dashboard Overview */}
            {currentTab === 'dashboard' && (
              <DashboardView
                subjects={state.subjects}
                sessions={state.sessions}
                preferences={state.preferences}
                onOpenSubject={(id) => setSelectedSubjectId(id)}
                onOpenAddSubject={() => setIsAddSubjectOpen(true)}
                onStartFocus={(subId) => handleOpenFocusTimer(subId)}
                onStartFlashcards={handleStartFlashcardReview}
                onViewAllFlashcards={() => setCurrentTab('flashcards')}
              />
            )}

            {/* Tab 2: Roadmaps / Subjects List */}
            {currentTab === 'subjects' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      Curriculum Roadmaps &amp; Syllabi
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Systematic pathways to acquire new skills step-by-step
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddSubjectOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Roadmap</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {state.subjects.map((sub) => {
                    const totalTasks = sub.modules.reduce((acc, m) => acc + m.items.length, 0);
                    const doneTasks = sub.modules.reduce(
                      (acc, m) => acc + m.items.filter((i) => i.isCompleted).length,
                      0
                    );
                    const percent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
                    const subSessions = state.sessions.filter((s) => s.subjectId === sub.id);
                    const totalHours = (
                      subSessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60
                    ).toFixed(1);

                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubjectId(sub.id)}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
                      >
                        {sub.coverImage ? (
                          <div className="h-36 w-full overflow-hidden relative bg-slate-900">
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
                            className="h-3 w-full"
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
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-slate-500 font-medium">Progress</span>
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
                                <span>Open Syllabus</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Flashcards Recall Hub */}
            {currentTab === 'flashcards' && (
              <FlashcardsView
                subjects={state.subjects}
                onStartReview={handleStartFlashcardReview}
                onOpenSubject={(id) => setSelectedSubjectId(id)}
                onAddNewCard={handleAddNewFlashcard}
              />
            )}

            {/* Tab 4: Study Journal & Notes */}
            {currentTab === 'journal' && (
              <StudyJournalView subjects={state.subjects} onAddNote={handleAddNote} />
            )}

            {/* Tab 5: Analytics & Velocity */}
            {currentTab === 'analytics' && (
              <AnalyticsView
                state={state}
                onRestoreState={handleRestoreState}
                onResetToSample={handleResetToSample}
              />
            )}
          </>
        )}
      </main>

      {/* Focus Timer Modal */}
      <FocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
        subjects={state.subjects}
        initialSubjectId={focusSubjectId}
        initialModuleId={focusModuleId}
        soundEnabled={state.preferences.soundEnabled}
        onSessionComplete={handleSessionComplete}
      />

      {/* Spaced Repetition Flashcard Review Modal */}
      <FlashcardReviewModal
        isOpen={isFlashcardReviewOpen}
        onClose={() => setIsFlashcardReviewOpen(false)}
        cards={activeReviewCards}
        subjectTitle={reviewDeckTitle}
        onRateCard={handleRateCard}
      />

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onAddSubject={handleAddSubject}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={state.preferences}
        onSavePreferences={handleSavePreferences}
      />
    </div>
  );
}
