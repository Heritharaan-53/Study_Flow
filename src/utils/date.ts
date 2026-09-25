import { StudySession, FlashcardRating } from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeAgo(timestampStr: string): string {
  const date = new Date(timestampStr);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatMinutes(mins: number): string {
  if (mins < 60) {
    return `${mins}m`;
  }
  const hours = (mins / 60).toFixed(1);
  return `${hours.endsWith('.0') ? parseInt(hours) : hours}h`;
}

/**
 * Calculates current streak (consecutive days with at least 1 study session)
 */
export function calculateStreak(sessions: StudySession[]): { currentStreak: number; longestStreak: number } {
  if (!sessions || sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Extract unique sorted dates (descending)
  const uniqueDates = Array.from(new Set(sessions.map((s) => s.date))).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const today = getTodayDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  const hasStudiedToday = uniqueDates.includes(today);
  const hasStudiedYesterday = uniqueDates.includes(yesterday);

  let currentStreak = 0;

  if (hasStudiedToday || hasStudiedYesterday) {
    let checkDate = new Date(hasStudiedToday ? today : yesterday);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = currentStreak;
  let tempStreak = 0;
  if (uniqueDates.length > 0) {
    // Sort ascending for longest streak detection
    const ascDates = [...uniqueDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    tempStreak = 1;
    let max = 1;

    for (let i = 1; i < ascDates.length; i++) {
      const prev = new Date(ascDates[i - 1]);
      const curr = new Date(ascDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > max) max = tempStreak;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(max, currentStreak);
  }

  return { currentStreak, longestStreak };
}

/**
 * Calculates next review interval and date using modified SM-2 spaced repetition
 */
export function calculateNextReview(rating: FlashcardRating, currentInterval: number, reviewCount: number): {
  nextReviewDate: string;
  intervalDays: number;
} {
  let nextInterval: number;

  switch (rating) {
    case 'again':
      nextInterval = 1;
      break;
    case 'hard':
      nextInterval = Math.max(1, Math.round(currentInterval * 1.2));
      break;
    case 'good':
      if (reviewCount === 0) nextInterval = 2;
      else if (reviewCount === 1) nextInterval = 4;
      else nextInterval = Math.round(currentInterval * 2.1);
      break;
    case 'easy':
      if (reviewCount === 0) nextInterval = 4;
      else if (reviewCount === 1) nextInterval = 8;
      else nextInterval = Math.round(currentInterval * 3.2);
      break;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextInterval);
  const nextDateStr = nextDate.toISOString().split('T')[0];

  return {
    nextReviewDate: nextDateStr,
    intervalDays: nextInterval,
  };
}

/**
 * Generates an array of the last N weeks for the activity heatmap
 */
export function generatePastYearDays(sessions: StudySession[]): {
  date: string;
  minutes: number;
  intensity: 0 | 1 | 2 | 3 | 4;
}[] {
  const map: Record<string, number> = {};
  sessions.forEach((s) => {
    map[s.date] = (map[s.date] || 0) + s.durationMinutes;
  });

  const days: { date: string; minutes: number; intensity: 0 | 1 | 2 | 3 | 4 }[] = [];
  const today = new Date();
  // 16 weeks (~112 days) provides a compact, elegant, high-density desktop heatmap without horizontal clutter
  const totalDays = 112; 

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const mins = map[dateStr] || 0;

    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (mins > 0 && mins < 25) intensity = 1;
    else if (mins >= 25 && mins < 60) intensity = 2;
    else if (mins >= 60 && mins < 120) intensity = 3;
    else if (mins >= 120) intensity = 4;

    days.push({
      date: dateStr,
      minutes: mins,
      intensity,
    });
  }

  return days;
}
