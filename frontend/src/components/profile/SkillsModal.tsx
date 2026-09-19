import React, { useState, useEffect } from 'react';
import { Search, X, Check, Plus, Filter, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSkills: string[];
  onSave: (skills: string[]) => Promise<void>;
}

const PREDEFINED_CATEGORIES: Record<string, string[]> = {
  'Development & Tech': [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'HTML/CSS',
    'Mobile App Dev', 'Next.js', 'Django', 'FastAPI', 'SQL', 'Git', 'Java', 'C++'
  ],
  'Design & Creative': [
    'Figma', 'UI/UX Design', 'Logo Design', 'Graphic Design', 'Photoshop',
    'Illustrator', 'Canva', '3D Modeling', 'Branding'
  ],
  'Writing & Content': [
    'Content Writing', 'Copywriting', 'Technical Writing', 'Blogging',
    'Proofreading & Editing', 'Creative Writing', 'SEO Writing'
  ],
  'Video & Audio': [
    'Video Editing', 'Premiere Pro', 'DaVinci Resolve', 'Animation',
    'Voiceover', 'Audio Editing', 'Motion Graphics'
  ],
  'Marketing & Business': [
    'Social Media Marketing', 'SEO', 'Digital Marketing', 'Content Strategy',
    'Brand Strategy', 'Market Research', 'Email Marketing'
  ],
  'Data & Analytics': [
    'Data Analysis', 'Excel / Spreadsheets', 'Machine Learning',
    'Python Data Science', 'PowerBI', 'SQL Analytics'
  ],
};

export function SkillsModal({ isOpen, onClose, currentSkills, onSave }: SkillsModalProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customSkill, setCustomSkill] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedSkills(currentSkills || []);
      setSearchQuery('');
      setCustomSkill('');
    }
  }, [isOpen, currentSkills]);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCustomSkill('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedSkills);
      onClose();
    } catch (err) {
      console.error('Failed to save skills:', err);
    } finally {
      setSaving(false);
    }
  };

  // Get categories list
  const categoriesList = ['All', ...Object.keys(PREDEFINED_CATEGORIES)];

  // Filter skills based on category and search query
  const getFilteredSkills = () => {
    const result: { category: string; skills: string[] }[] = [];

    Object.entries(PREDEFINED_CATEGORIES).forEach(([cat, skills]) => {
      if (activeCategory !== 'All' && activeCategory !== cat) return;

      const matchingSkills = skills.filter(skill =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (matchingSkills.length > 0) {
        result.push({ category: cat, skills: matchingSkills });
      }
    });

    return result;
  };

  const filteredCategories = getFilteredSkills();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
              Manage Profile Skills
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Select skills from the dropdown categories or add custom skills to highlight your expertise.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selected Skills Bar */}
        <div className="px-6 py-3 bg-[var(--color-primary-light)]/40 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              Selected Skills ({selectedSkills.length})
            </span>
            {selectedSkills.length > 0 && (
              <button
                onClick={() => setSelectedSkills([])}
                className="text-xs text-[var(--color-text-muted)] hover:text-red-500"
              >
                Clear all
              </button>
            )}
          </div>
          {selectedSkills.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] italic">No skills selected yet. Click skills below to add them.</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
              {selectedSkills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)] text-white text-xs font-medium rounded-full shadow-sm"
                >
                  {skill}
                  <button
                    onClick={() => toggleSkill(skill)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Controls: Search & Category Filter Dropdown */}
        <div className="p-6 pb-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search skills (e.g., React, Figma, SEO)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative flex items-center gap-2">
              <Filter className="w-4 h-4 text-[var(--color-text-muted)] hidden sm:block" />
              <select
                value={activeCategory}
                onChange={e => setActiveCategory(e.target.value)}
                className="px-3 py-2 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-medium"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add Custom Skill Row */}
          <form onSubmit={handleAddCustomSkill} className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom skill if not in list..."
              value={customSkill}
              onChange={e => setCustomSkill(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <button
              type="submit"
              disabled={!customSkill.trim()}
              className="px-3 py-1.5 bg-[var(--color-surface-alt)] hover:bg-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </form>
        </div>

        {/* Skills Selection Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
              No matching skills found for "{searchQuery}". You can add it using the custom skill input above!
            </div>
          ) : (
            filteredCategories.map(({ category, skills }) => (
              <div key={category} className="space-y-2">
                <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[var(--color-primary)] text-white shadow-sm scale-105'
                            : 'bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
                        }`}
                      >
                        {isSelected && <Check size={13} />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving Skills...' : 'Save Skills'}
          </Button>
        </div>
      </div>
    </div>
  );
}
