import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Layers, Plus, Check } from 'lucide-react';
import { Subject, SubjectCategory, SubjectLevel } from '../types';
import { SUBJECT_TEMPLATES, SubjectTemplate } from '../data/templates';
import { getTodayDateString } from '../utils/date';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (newSubject: Subject) => void;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onAddSubject,
}) => {
  const [activeMode, setActiveMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<SubjectTemplate | null>(
    SUBJECT_TEMPLATES[0]
  );

  // Custom form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SubjectCategory>('engineering');
  const [level, setLevel] = useState<SubjectLevel>('beginner');
  const [description, setDescription] = useState('');
  const [targetWeeklyHours, setTargetWeeklyHours] = useState(6);
  const [targetEndDate, setTargetEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [color, setColor] = useState('#0284c7');

  if (!isOpen) return null;

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return;
    const newId = `sub-${Date.now()}`;
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 3);

    const newSubject: Subject = {
      id: newId,
      title: selectedTemplate.title,
      category: selectedTemplate.category,
      level: selectedTemplate.level,
      color: selectedTemplate.color,
      coverImage: selectedTemplate.coverImage,
      description: selectedTemplate.description,
      targetWeeklyHours: selectedTemplate.targetWeeklyHours,
      targetEndDate: targetDate.toISOString().split('T')[0],
      createdAt: getTodayDateString(),
      modules: selectedTemplate.modules.map((m, idx) => ({
        ...m,
        id: `mod-${newId}-${idx}`,
        items: m.items.map((it, itemIdx) => ({
          ...it,
          id: `item-${newId}-${idx}-${itemIdx}`,
        })),
      })),
      flashcards: selectedTemplate.starterFlashcards.map((f, fIdx) => ({
        ...f,
        id: `card-${newId}-${fIdx}`,
        subjectId: newId,
      })),
      notes: [],
    };

    onAddSubject(newSubject);
    onClose();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newId = `sub-${Date.now()}`;
    const newSubject: Subject = {
      id: newId,
      title: title.trim(),
      category,
      level,
      color,
      description: description.trim() || `Mastering ${title.trim()}`,
      targetWeeklyHours: Number(targetWeeklyHours) || 5,
      targetEndDate,
      createdAt: getTodayDateString(),
      modules: [
        {
          id: `mod-${newId}-1`,
          title: '01. Fundamentals & Core Architecture',
          description: `Initial foundations and core principles of ${title.trim()}.`,
          status: 'in_progress',
          estimatedHours: 8,
          items: [
            { id: `item-${newId}-1`, title: 'Review prerequisites and environment setup', isCompleted: false },
            { id: `item-${newId}-2`, title: 'Core syntax and foundational concepts', isCompleted: false },
            { id: `item-${newId}-3`, title: 'First hands-on exercise or miniature project', isCompleted: false },
          ],
        },
      ],
      flashcards: [],
      notes: [],
    };

    onAddSubject(newSubject);
    onClose();
  };

  const colors = [
    { label: 'Azure Sky', value: '#0284c7' },
    { label: 'Emerald Forest', value: '#059669' },
    { label: 'Violet Indigo', value: '#6366f1' },
    { label: 'Royal Purple', value: '#7c3aed' },
    { label: 'Warm Amber', value: '#d97706' },
    { label: 'Crimson Rose', value: '#e11d48' },
    { label: 'Slate Mineral', value: '#475569' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add Learning Goal &amp; Curriculum</h2>
            <p className="text-xs text-slate-500">Pick a structured roadmap blueprint or create a custom syllabus</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveMode('template')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeMode === 'template'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Blueprints</span>
            </button>
            <button
              onClick={() => setActiveMode('custom')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeMode === 'custom'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom Curriculum</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeMode === 'template' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUBJECT_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplate?.id === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-100 bg-indigo-50/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {tpl.category} · {tpl.level}
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">{tpl.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{tpl.description}</p>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {tpl.modules.length} Modules · {tpl.targetWeeklyHours}h/week · {tpl.starterFlashcards.length} Flashcards
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedTemplate && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    Included Curriculum Modules:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {selectedTemplate.modules.map((m, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                        <span className="font-medium text-slate-800">{m.title}</span>
                        <span className="text-slate-400">({m.items.length} milestones)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <form id="custom-subject-form" onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject or Skill Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Go Microservices Architecture, Digital Photography, Organic Chemistry..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SubjectCategory)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="engineering">Engineering &amp; Code</option>
                    <option value="language">Languages</option>
                    <option value="science">Sciences &amp; Math</option>
                    <option value="creative">Creative &amp; Design</option>
                    <option value="humanities">Humanities &amp; History</option>
                    <option value="business">Business &amp; Finance</option>
                    <option value="other">Other Skill</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as SubjectLevel)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description &amp; Objective</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is your main goal or desired outcome for this topic?"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Weekly Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={targetWeeklyHours}
                    onChange={(e) => setTargetWeeklyHours(parseInt(e.target.value) || 5)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={targetEndDate}
                    onChange={(e) => setTargetEndDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Accent Theme</label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c.value ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          {activeMode === 'template' ? (
            <button
              onClick={handleCreateFromTemplate}
              disabled={!selectedTemplate}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              Instantiate Blueprint
            </button>
          ) : (
            <button
              type="submit"
              form="custom-subject-form"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              Create Curriculum
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
