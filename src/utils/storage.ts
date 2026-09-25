import { LearningState } from '../types';
import { INITIAL_STATE } from '../data/initialData';

const STORAGE_KEY = 'omnistudy_learning_state_v1';

export function loadLearningState(): LearningState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.subjects) && Array.isArray(parsed.sessions)) {
      return {
        ...INITIAL_STATE,
        ...parsed,
        // Ensure preferences exist
        preferences: {
          ...INITIAL_STATE.preferences,
          ...(parsed.preferences || {}),
        },
      };
    }
    return INITIAL_STATE;
  } catch (err) {
    console.error('Failed to load learning state from localStorage:', err);
    return INITIAL_STATE;
  }
}

export function saveLearningState(state: LearningState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save learning state:', err);
  }
}

export function exportBackupJSON(state: LearningState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `omnistudy-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
