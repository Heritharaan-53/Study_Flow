import React, { useState, useMemo } from 'react';
import { Layers, BookOpen, Plus, Search, Filter, Sparkles } from 'lucide-react';
import { Subject, Flashcard, FlashcardRating } from '../types';
import { formatDate, getTodayDateString } from '../utils/date';

interface FlashcardsViewProps {
  subjects: Subject[];
  onStartReview: (cards: Flashcard[], title: string) => void;
  onOpenSubject: (subjectId: string) => void;
  onAddNewCard: (subjectId: string, front: string, back: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  subjects,
  onStartReview,
  onOpenSubject,
  onAddNewCard,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states
  const [targetSubjectId, setTargetSubjectId] = useState<string>(
    subjects.length > 0 ? subjects[0].id : ''
  );
  const [cardFront, setCardFront] = useState<string>('');
  const [cardBack, setCardBack] = useState<string>('');

  const todayStr = getTodayDateString();

  // Aggregate all flashcards
  const allCards = useMemo(() => {
    const list: (Flashcard & { subjectTitle: string; subjectColor: string })[] = [];
    subjects.forEach((sub) => {
      sub.flashcards.forEach((fc) => {
        list.push({
          ...fc,
          subjectTitle: sub.title,
          subjectColor: sub.color,
        });
      });
    });
    return list;
  }, [subjects]);

  // Filtered cards
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      const matchSubject =
        selectedSubjectFilter === 'all' || card.subjectId === selectedSubjectFilter;
      const matchSearch =
        !searchQuery ||
        card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [allCards, selectedSubjectFilter, searchQuery]);

  // Due cards
  const dueCards = useMemo(() => {
    return filteredCards.filter((c) => c.nextReviewDate <= todayStr);
  }, [filteredCards, todayStr]);

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim() || !targetSubjectId) return;

    onAddNewCard(targetSubjectId, cardFront.trim(), cardBack.trim());
    setCardFront('');
    setCardBack('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Spaced Repetition &amp; Active Recall Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Strengthen synapses using algorithmic memory intervals
          </p>
        </div>

        <div className="flex items-center gap-3">
          {dueCards.length > 0 && (
            <button
              onClick={() => onStartReview(dueCards, 'Due Flashcards Session')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review Due ({dueCards.length})</span>
            </button>
          )}

          {filteredCards.length > 0 && dueCards.length === 0 && (
            <button
              onClick={() => onStartReview(filteredCards, 'Full Deck Practice')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Practice All ({filteredCards.length})</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Filter:</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="all">All Roadmaps ({allCards.length})</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.flashcards.length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards List Grid */}
      {filteredCards.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No flashcards found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Create recall cards for concepts that require memorization and fast retrieval.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
          >
            Create New Flashcard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const isDue = card.nextReviewDate <= todayStr;
            return (
              <div
                key={card.id}
                className={`bg-white rounded-xl border p-5 flex flex-col justify-between transition-all ${
                  isDue
                    ? 'border-amber-300 ring-2 ring-amber-100 shadow-sm'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-[11px]">
                    <span className="font-semibold text-slate-500 truncate max-w-[160px]">
                      {card.subjectTitle}
                    </span>
                    {isDue ? (
                      <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                        Due for Review
                      </span>
                    ) : (
                      <span className="text-slate-400">Next: {formatDate(card.nextReviewDate)}</span>
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-800 mb-2 leading-snug">
                    {card.front}
                  </div>

                  <div className="text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2.5 font-mono leading-relaxed line-clamp-3">
                    {card.back}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Interval: {card.intervalDays}d</span>
                  <span>{card.reviewCount} reviews</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Create New Recall Card</h3>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Subject *
                </label>
                <select
                  value={targetSubjectId}
                  onChange={(e) => setTargetSubjectId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question / Concept Prompt *
                </label>
                <textarea
                  rows={2}
                  required
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  placeholder="e.g. What is the difference between static and dynamic dispatch in Rust?"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Answer / Code / Takeaway *
                </label>
                <textarea
                  rows={4}
                  required
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  placeholder="The concise answer or core mnemonic to recall..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
