export type SubjectCategory =
  | 'engineering'
  | 'language'
  | 'creative'
  | 'science'
  | 'humanities'
  | 'business'
  | 'other';

export type SubjectLevel = 'beginner' | 'intermediate' | 'advanced';

export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
  resourceLink?: string;
  notes?: string;
}

export interface StudyModule {
  id: string;
  title: string;
  description: string;
  status: ModuleStatus;
  estimatedHours: number;
  items: ChecklistItem[];
}

export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy';

export interface Flashcard {
  id: string;
  subjectId: string;
  front: string;
  back: string;
  difficulty: FlashcardRating | 'new';
  nextReviewDate: string; // ISO date string (YYYY-MM-DD)
  intervalDays: number;
  reviewCount: number;
  lastReviewed: string | null;
}

export interface StudyNote {
  id: string;
  subjectId: string;
  moduleId?: string;
  title: string;
  keyTakeaway: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  title: string;
  category: SubjectCategory;
  level: SubjectLevel;
  color: string; // hex or tailwind identifier
  coverImage?: string;
  targetWeeklyHours: number;
  targetEndDate: string; // YYYY-MM-DD
  description: string;
  createdAt: string;
  modules: StudyModule[];
  flashcards: Flashcard[];
  notes: StudyNote[];
}

export type SessionType = 'pomodoro' | 'deep_work' | 'review' | 'practice';

export interface StudySession {
  id: string;
  subjectId: string;
  moduleId?: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  notes: string;
  moodRating: 1 | 2 | 3 | 4 | 5; // 1: Draining -> 5: Flow
  sessionType: SessionType;
  distractionsLogged: number;
}

export interface UserPreferences {
  dailyTargetMinutes: number;
  soundEnabled: boolean;
  defaultTimerMode: 'pomodoro' | 'deep_work';
  userName: string;
  avatarUrl?: string;
}

export interface LearningState {
  subjects: Subject[];
  sessions: StudySession[];
  preferences: UserPreferences;
  selectedSubjectId: string | null;
}
