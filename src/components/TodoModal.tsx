'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Tag, AlertCircle } from 'lucide-react';
import styles from './TodoModal.module.css';
import type { Todo, CreateTodoInput, Priority, Subtask } from '@/lib/types';
import { sound } from '@/lib/sound';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTodoInput, id?: string) => Promise<void>;
  editingTodo: Todo | null;
  existingCategories: string[];
}

export function TodoModal({
  isOpen,
  onClose,
  onSave,
  editingTodo,
  existingCategories,
}: TodoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize values when opening or editingTodo changes
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || '');
      setPriority(editingTodo.priority);
      if (existingCategories.includes(editingTodo.category)) {
        setCategory(editingTodo.category);
        setIsCustomCategory(false);
      } else {
        setIsCustomCategory(true);
        setCustomCategory(editingTodo.category);
      }
      if (editingTodo.due_date) {
        // Format for datetime-local: YYYY-MM-DDTHH:mm
        const d = new Date(editingTodo.due_date);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
          d.getHours()
        )}:${pad(d.getMinutes())}`;
        setDueDate(formatted);
      } else {
        setDueDate('');
      }
      setSubtasks(editingTodo.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setCategory(existingCategories[0] || 'General');
      setIsCustomCategory(false);
      setCustomCategory('');
      setPriority('medium');
      setDueDate('');
      setSubtasks([]);
    }
    setError(null);
  }, [editingTodo, isOpen, existingCategories]);

  if (!isOpen) return null;

  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subtaskInput.trim()) return;

    sound.playTap();
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title: subtaskInput.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    sound.playTap();
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSetQuickDate = (daysFromNow: number) => {
    sound.playTap();
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(18, 0, 0, 0); // default to 6:00 PM
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T18:00`;
    setDueDate(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    sound.playTap();

    try {
      const finalCategory = isCustomCategory
        ? customCategory.trim() || 'General'
        : category;

      await onSave(
        {
          title: title.trim(),
          description: description.trim() || null,
          category: finalCategory,
          priority,
          due_date: dueDate ? new Date(dueDate).toISOString() : null,
          subtasks,
        },
        editingTodo ? editingTodo.id : undefined
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving task';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Drag handle for mobile */}
        <div className={styles.dragHandle} />

        {/* Header */}
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.modalTitle}>
            {editingTodo ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <div className={styles.fieldGroup}>
            <label htmlFor="task-title" className={styles.label}>
              Title <span className={styles.requiredStar}>*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className={styles.titleInput}
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className={styles.fieldGroup}>
            <label htmlFor="task-desc" className={styles.label}>
              Description
            </label>
            <textarea
              id="task-desc"
              className={styles.textarea}
              placeholder="Add details, links, or notes..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Category & Priority Grid */}
          <div className={styles.twoColumnGrid}>
            {/* Category */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <Tag size={13} />
                <span>Category</span>
              </label>
              <select
                id="task-category-select"
                className={styles.select}
                value={isCustomCategory ? '__custom__' : category}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setCategory(e.target.value);
                  }
                }}
              >
                {existingCategories
                  .filter((c) => c !== 'All')
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                <option value="__custom__">+ New Category</option>
              </select>

              {isCustomCategory && (
                <input
                  type="text"
                  placeholder="Enter category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className={styles.customCategoryInput}
                  autoFocus
                />
              )}
            </div>

            {/* Priority Selector */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <AlertCircle size={13} />
                <span>Priority</span>
              </label>
              <div className={styles.prioritySegments}>
                {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.priorityOption} ${
                      priority === p ? styles[`priorityActive_${p}`] : ''
                    }`}
                    onClick={() => {
                      sound.playTap();
                      setPriority(p);
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className={styles.fieldGroup}>
            <div className={styles.dateLabelRow}>
              <label htmlFor="task-due-date" className={styles.label}>
                <Calendar size={13} />
                <span>Due Date & Time</span>
              </label>
              <div className={styles.quickDatePills}>
                <button
                  type="button"
                  className={styles.quickDateBtn}
                  onClick={() => handleSetQuickDate(0)}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={styles.quickDateBtn}
                  onClick={() => handleSetQuickDate(1)}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  className={styles.quickDateBtn}
                  onClick={() => handleSetQuickDate(7)}
                >
                  Next Week
                </button>
              </div>
            </div>
            <input
              id="task-due-date"
              type="datetime-local"
              className={styles.input}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Subtasks Builder */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Subtasks / Checklist</label>

            <div className={styles.subtaskInputRow}>
              <input
                type="text"
                placeholder="Add subtask item..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className={styles.input}
              />
              <button
                type="button"
                className={styles.addSubtaskBtn}
                onClick={() => handleAddSubtask()}
              >
                <Plus size={16} />
              </button>
            </div>

            {subtasks.length > 0 && (
              <ul className={styles.subtaskDraftList}>
                {subtasks.map((sub) => (
                  <li key={sub.id} className={styles.subtaskDraftItem}>
                    <span className={styles.subtaskDraftText}>{sub.title}</span>
                    <button
                      type="button"
                      className={styles.removeSubtaskBtn}
                      onClick={() => handleRemoveSubtask(sub.id)}
                      aria-label="Remove subtask"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer Actions */}
          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className={styles.buttonSpinner} />
              ) : editingTodo ? (
                'Update Task'
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
