'use client';

import React, { useState } from 'react';
import {
  Check,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  CheckCircle,
  Circle,
  Tag,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import styles from './TodoItem.module.css';
import type { Todo, Priority } from '@/lib/types';
import { sound } from '@/lib/sound';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onUpdateSubtasks?: (id: string, subtasks: Todo['subtasks']) => void;
}

const PRIORITY_LABELS: Record<Priority, { label: string; className: string }> = {
  urgent: { label: 'Urgent', className: styles.priorityUrgent },
  high: { label: 'High', className: styles.priorityHigh },
  medium: { label: 'Medium', className: styles.priorityMedium },
  low: { label: 'Low', className: styles.priorityLow },
};

export function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
  onUpdateSubtasks,
}: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const priorityInfo = PRIORITY_LABELS[todo.priority] || PRIORITY_LABELS.medium;

  // Due Date status calculation
  const getDueDateStatus = () => {
    if (!todo.due_date) return null;

    const due = new Date(todo.due_date);
    const now = new Date();
    const isPast = due.getTime() < now.getTime();

    // Check if today
    const isToday =
      due.getDate() === now.getDate() &&
      due.getMonth() === now.getMonth() &&
      due.getFullYear() === now.getFullYear();

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow =
      due.getDate() === tomorrow.getDate() &&
      due.getMonth() === tomorrow.getMonth() &&
      due.getFullYear() === tomorrow.getFullYear();

    if (isPast && !isToday && !todo.completed) {
      return { text: 'Overdue', className: styles.dueOverdue };
    }
    if (isToday) {
      return { text: 'Today', className: styles.dueToday };
    }
    if (isTomorrow) {
      return { text: 'Tomorrow', className: styles.dueTomorrow };
    }

    return {
      text: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(due),
      className: styles.dueNormal,
    };
  };

  const dueStatus = getDueDateStatus();

  // Subtask progress
  const totalSubtasks = todo.subtasks?.length || 0;
  const completedSubtasks = todo.subtasks?.filter((s) => s.completed).length || 0;
  const hasSubtasks = totalSubtasks > 0;

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!todo.completed) {
      sound.playComplete();
      // Trigger festive confetti explosion
      try {
        confetti({
          particleCount: 40,
          spread: 55,
          origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // Ignore canvas confetti error if not loaded
      }
    } else {
      sound.playTap();
    }
    onToggle(todo.id);
  };

  const handleSubtaskToggle = (subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateSubtasks || !todo.subtasks) return;

    sound.playTap();
    const updated = todo.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    onUpdateSubtasks(todo.id, updated);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    sound.playTap();
    setTimeout(() => {
      onDelete(todo.id);
    }, 200);
  };

  return (
    <article
      className={`${styles.card} ${todo.completed ? styles.completedCard : ''} ${
        isDeleting ? styles.cardDeleting : ''
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className={styles.mainRow}>
        {/* Custom Checkbox */}
        <button
          className={`${styles.checkbox} ${todo.completed ? styles.checked : ''}`}
          onClick={handleToggleClick}
          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed && <Check size={14} className={styles.checkIcon} />}
        </button>

        {/* Content Details */}
        <div className={styles.details}>
          <div className={styles.titleRow}>
            <h3 className={`${styles.title} ${todo.completed ? styles.completedTitle : ''}`}>
              {todo.title}
            </h3>
          </div>

          {/* Badges / Metadata */}
          <div className={styles.metaRow}>
            {/* Category Tag */}
            <span className={styles.categoryBadge}>
              <Tag size={11} />
              {todo.category}
            </span>

            {/* Priority Badge */}
            <span className={`${styles.priorityBadge} ${priorityInfo.className}`}>
              {todo.priority === 'urgent' && <AlertCircle size={11} />}
              {priorityInfo.label}
            </span>

            {/* Due Date Badge */}
            {dueStatus && (
              <span className={`${styles.dueDateBadge} ${dueStatus.className}`}>
                <Calendar size={11} />
                {dueStatus.text}
              </span>
            )}

            {/* Subtask Count */}
            {hasSubtasks && (
              <span className={styles.subtaskBadge}>
                <CheckCircle size={11} />
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className={styles.actionButtons} onClick={(e) => e.stopPropagation()}>
          <button
            className={styles.actionBtn}
            onClick={() => {
              sound.playTap();
              onEdit(todo);
            }}
            title="Edit task"
            aria-label="Edit task"
          >
            <Edit3 size={16} />
          </button>

          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={handleDelete}
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>

          {(todo.description || hasSubtasks) && (
            <button
              className={styles.actionBtn}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Section: Description & Subtasks */}
      {isExpanded && (
        <div className={styles.expandedSection} onClick={(e) => e.stopPropagation()}>
          {todo.description && (
            <p className={styles.descriptionText}>{todo.description}</p>
          )}

          {hasSubtasks && (
            <div className={styles.subtasksContainer}>
              <h4 className={styles.subtasksHeader}>Checklist</h4>
              <ul className={styles.subtaskList}>
                {todo.subtasks.map((sub) => (
                  <li
                    key={sub.id}
                    className={styles.subtaskItem}
                    onClick={(e) => handleSubtaskToggle(sub.id, e)}
                  >
                    <button
                      className={`${styles.subtaskCheckbox} ${
                        sub.completed ? styles.subtaskChecked : ''
                      }`}
                      aria-label="Toggle subtask"
                    >
                      {sub.completed ? (
                        <Check size={12} />
                      ) : (
                        <Circle size={12} className={styles.subtaskUncheckedIcon} />
                      )}
                    </button>
                    <span
                      className={`${styles.subtaskText} ${
                        sub.completed ? styles.subtaskCompletedText : ''
                      }`}
                    >
                      {sub.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
