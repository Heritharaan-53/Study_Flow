import React, { useState } from 'react';
import { X, RotateCw, CheckCircle2, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { Flashcard, FlashcardRating } from '../types';
import { sound } from '../utils/audio';
import { calculateNextReview } from '../utils/date';

interface FlashcardReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
  subjectTitle?: string;
  onRateCard: (cardId: string, rating: FlashcardRating, nextReviewDate: string, intervalDays: number) => void;
}

export const FlashcardReviewModal: React.FC<FlashcardReviewModalProps> = ({
  isOpen,
  onClose,
  cards,
  subjectTitle,
  onRateCard,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [reviewedCount, setReviewedCount] = useState<number>(0);
  const [ratingsCount, setRatingsCount] = useState<Record<FlashcardRating, number>>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];
  const isDeckComplete = currentIndex >= cards.length;

  const handleFlip = () => {
    sound.playCardFlip();
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating: FlashcardRating) => {
    if (!currentCard) return;

    const { nextReviewDate, intervalDays } = calculateNextReview(
      rating,
      currentCard.intervalDays || 1,
      currentCard.reviewCount || 0
    );

    onRateCard(currentCard.id, rating, nextReviewDate, intervalDays);

    setRatingsCount((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));
    setReviewedCount((prev) => prev + 1);
    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col min-h-[500px] max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">
              Active Recall Session
            </span>
            {subjectTitle && (
              <>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                  {subjectTitle}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isDeckComplete && (
              <span className="text-xs font-mono font-medium text-slate-500 tabular-nums">
                {currentIndex + 1} / {cards.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Stage */}
        <div className="flex-1 p-6 flex flex-col justify-between items-center bg-slate-50/30">
          {!isDeckComplete && currentCard ? (
            <>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${(currentIndex / cards.length) * 100}%` }}
                />
              </div>

              {/* The 3D Flip Card Container */}
              <div
                onClick={handleFlip}
                className="w-full flex-1 min-h-[260px] bg-white rounded-xl border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-all cursor-pointer p-6 flex flex-col justify-between select-none relative group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-3">
                    <span>{isFlipped ? 'Answer & Explanation' : 'Prompt / Question'}</span>
                    <span className="flex items-center gap-1 text-indigo-600 group-hover:underline">
                      <RotateCw className="w-3 h-3" />
                      {isFlipped ? 'Show question' : 'Flip to see answer'}
                    </span>
                  </div>

                  <div className="text-base text-slate-800 font-medium leading-relaxed whitespace-pre-wrap mt-2">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span>Current Interval: {currentCard.intervalDays}d</span>
                  <span>Times reviewed: {currentCard.reviewCount}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="w-full mt-6">
                {!isFlipped ? (
                  <button
                    onClick={handleFlip}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                  >
                    Show Answer (Spacebar / Click)
                  </button>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleRate('again')}
                      className="py-2.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl text-center transition-colors"
                    >
                      <div className="text-xs font-bold">Again</div>
                      <div className="text-[10px] text-rose-600">1 day</div>
                    </button>

                    <button
                      onClick={() => handleRate('hard')}
                      className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-center transition-colors"
                    >
                      <div className="text-xs font-bold">Hard</div>
                      <div className="text-[10px] text-amber-600">
                        {Math.max(1, Math.round((currentCard.intervalDays || 1) * 1.2))}d
                      </div>
                    </button>

                    <button
                      onClick={() => handleRate('good')}
                      className="py-2.5 px-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-center transition-colors"
                    >
                      <div className="text-xs font-bold">Good</div>
                      <div className="text-[10px] text-indigo-600">
                        {Math.round((currentCard.intervalDays || 1) * 2.1)}d
                      </div>
                    </button>

                    <button
                      onClick={() => handleRate('easy')}
                      className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-center transition-colors"
                    >
                      <div className="text-xs font-bold">Easy</div>
                      <div className="text-[10px] text-emerald-600">
                        {Math.round((currentCard.intervalDays || 1) * 3.2)}d
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Review Deck Complete */
            <div className="w-full flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Session Complete!</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6">
                You reviewed <span className="font-semibold text-slate-700">{reviewedCount}</span> cards.
                Next review dates have been calibrated for optimal spaced retention.
              </p>

              {/* Stats summary */}
              <div className="grid grid-cols-4 gap-3 w-full max-w-sm mb-8 text-xs">
                <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
                  <div className="font-bold text-rose-700 text-base tabular-nums">
                    {ratingsCount.again}
                  </div>
                  <div className="text-rose-600 text-[11px]">Again</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
                  <div className="font-bold text-amber-700 text-base tabular-nums">
                    {ratingsCount.hard}
                  </div>
                  <div className="text-amber-600 text-[11px]">Hard</div>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg">
                  <div className="font-bold text-indigo-700 text-base tabular-nums">
                    {ratingsCount.good}
                  </div>
                  <div className="text-indigo-600 text-[11px]">Good</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
                  <div className="font-bold text-emerald-700 text-base tabular-nums">
                    {ratingsCount.easy}
                  </div>
                  <div className="text-emerald-600 text-[11px]">Easy</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                Return to Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
