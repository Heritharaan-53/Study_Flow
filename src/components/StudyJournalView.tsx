import React, { useState, useMemo } from 'react';
import { FileText, Plus, Search, Tag, BookOpen, Clock } from 'lucide-react';
import { Subject, StudyNote } from '../types';
import { formatDate, getTodayDateString } from '../utils/date';

interface StudyJournalViewProps {
  subjects: Subject[];
  onAddNote: (subjectId: string, note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const StudyJournalView: React.FC<StudyJournalViewProps> = ({ subjects, onAddNote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [targetSubjectId, setTargetSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Collect all notes
  const allNotes = useMemo(() => {
    const list: (StudyNote & { subjectTitle: string; subjectColor: string })[] = [];
    subjects.forEach((sub) => {
      sub.notes.forEach((n) => {
        list.push({
          ...n,
          subjectTitle: sub.title,
          subjectColor: sub.color,
        });
      });
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [subjects]);

  // Unique tags across all notes
  const allTags = useMemo(() => {
    const set = new Set<string>();
    allNotes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [allNotes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return allNotes.filter((note) => {
      const matchSubject =
        selectedSubjectFilter === 'all' || note.subjectId === selectedSubjectFilter;
      const matchTag = !selectedTagFilter || note.tags.includes(selectedTagFilter);
      const matchSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSubject && matchTag && matchSearch;
    });
  }, [allNotes, selectedSubjectFilter, selectedTagFilter, searchQuery]);

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetSubjectId) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    onAddNote(targetSubjectId, {
      subjectId: targetSubjectId,
      title: title.trim(),
      keyTakeaway: keyTakeaway.trim(),
      content: content.trim(),
      tags,
    });

    setTitle('');
    setKeyTakeaway('');
    setContent('');
    setTagsInput('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Study Journal &amp; Conceptual Notes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture synthetic mental models, breakthrough insights, and technical summaries
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, takeaways, or keywords..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Subject:</span>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-auto"
            >
              <option value="all">All Subjects ({allNotes.length})</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.notes.length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags bar */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Tags:</span>
            {selectedTagFilter && (
              <button
                onClick={() => setSelectedTagFilter(null)}
                className="px-2 py-0.5 rounded text-[11px] bg-indigo-100 text-indigo-700 font-medium hover:bg-indigo-200"
              >
                Clear #{selectedTagFilter} ✕
              </button>
            )}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedTagFilter === tag
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No notes found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Summarizing concepts in your own words accelerates understanding by 2-3x.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
          >
            Create Your First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded truncate max-w-[200px]">
                    {note.subjectTitle}
                  </span>
                  <span>{formatDate(note.createdAt)}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-2.5">{note.title}</h3>

                {note.keyTakeaway && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 font-medium mb-3">
                    <span className="font-bold text-indigo-700">Core Takeaway: </span>
                    {note.keyTakeaway}
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                  {note.content}
                </p>
              </div>

              {note.tags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 flex-wrap">
                  {note.tags.map((t) => (
                    <span
                      key={t}
                      onClick={() => setSelectedTagFilter(t)}
                      className="text-[10px] text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Add Study Note</h3>

            <form onSubmit={handleSubmitNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject *
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
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Memory layout of Box vs Arc pointers"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Takeaway / Synthetic Rule
                </label>
                <input
                  type="text"
                  value={keyTakeaway}
                  onChange={(e) => setKeyTakeaway(e.target.value)}
                  placeholder="One sentence core principle"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Notes &amp; Synthesis *
                </label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your study notes..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="syntax, memory, pointers"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
