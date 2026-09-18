'use client';

import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: 'all' | 'active' | 'completed';
  onStatusChange: (status: 'all' | 'active' | 'completed') => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
}: SearchBarProps) {
  return (
    <div className={styles.wrapper}>
      {/* Search Bar */}
      <div className={styles.searchRow}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            id="task-search-input"
            type="text"
            placeholder="Search tasks, descriptions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              className={styles.clearButton}
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status Segmented Control */}
        <div className={styles.statusSegment}>
          <button
            className={`${styles.segmentBtn} ${statusFilter === 'all' ? styles.activeSegment : ''}`}
            onClick={() => onStatusChange('all')}
          >
            All
          </button>
          <button
            className={`${styles.segmentBtn} ${statusFilter === 'active' ? styles.activeSegment : ''}`}
            onClick={() => onStatusChange('active')}
          >
            Active
          </button>
          <button
            className={`${styles.segmentBtn} ${statusFilter === 'completed' ? styles.activeSegment : ''}`}
            onClick={() => onStatusChange('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Filter and Sort Dropdowns */}
      <div className={styles.filtersRow}>
        {/* Priority Filter */}
        <div className={styles.filterControl}>
          <SlidersHorizontal size={14} className={styles.filterIcon} />
          <select
            id="priority-select"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className={styles.selectInput}
          >
            <option value="all">Priority: All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sort Select */}
        <div className={styles.filterControl}>
          <ArrowUpDown size={14} className={styles.filterIcon} />
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className={styles.selectInput}
          >
            <option value="created_desc">Newest First</option>
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="created_asc">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}
