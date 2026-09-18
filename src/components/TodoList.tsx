'use client';

import React, { useState } from 'react';
import { CheckCircle, Plus, Sparkles, ChevronDown, ChevronRight, Inbox } from 'lucide-react';
import { TodoItem } from './TodoItem';
import styles from './TodoList.module.css';
import type { Todo } from '@/lib/types';
import { sound } from '@/lib/sound';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onUpdateSubtasks: (id: string, subtasks: Todo['subtasks']) => void;
  onOpenCreateModal: () => void;
  onSeedData: () => void;
  isFiltered: boolean;
}

export function TodoList({
  todos,
  isLoading,
  onToggle,
  onEdit,
  onDelete,
  onUpdateSubtasks,
  onOpenCreateModal,
  onSeedData,
  isFiltered,
}: TodoListProps) {
  const [showCompleted, setShowCompleted] = useState(true);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading your tasks...</p>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconCircle}>
          {isFiltered ? <Inbox size={32} /> : <CheckCircle size={32} />}
        </div>
        <h3 className={styles.emptyTitle}>
          {isFiltered ? 'No matching tasks' : 'All caught up!'}
        </h3>
        <p className={styles.emptySubtitle}>
          {isFiltered
            ? 'Try adjusting your search query or filters to find what you are looking for.'
            : 'You have zero pending tasks. Enjoy your day or add a new goal!'}
        </p>
        <div className={styles.emptyActions}>
          <button
            className={styles.emptyPrimaryBtn}
            onClick={() => {
              sound.playTap();
              onOpenCreateModal();
            }}
          >
            <Plus size={16} />
            <span>Create New Task</span>
          </button>
          {!isFiltered && (
            <button
              className={styles.emptySecondaryBtn}
              onClick={() => {
                sound.playTap();
                onSeedData();
              }}
            >
              <Sparkles size={15} />
              <span>Load Sample Tasks</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div className={styles.listContainer}>
      {/* Active Tasks */}
      <div className={styles.tasksGroup}>
        {activeTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpdateSubtasks={onUpdateSubtasks}
          />
        ))}
      </div>

      {/* Completed Tasks Accordion */}
      {completedTodos.length > 0 && (
        <div className={styles.completedSection}>
          <button
            className={styles.completedHeader}
            onClick={() => {
              sound.playTap();
              setShowCompleted(!showCompleted);
            }}
          >
            <div className={styles.completedHeaderLeft}>
              {showCompleted ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className={styles.completedHeaderText}>
                Completed ({completedTodos.length})
              </span>
            </div>
            <span className={styles.completedSubtext}>
              {showCompleted ? 'Click to collapse' : 'Click to show'}
            </span>
          </button>

          {showCompleted && (
            <div className={styles.completedList}>
              {completedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onUpdateSubtasks={onUpdateSubtasks}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
