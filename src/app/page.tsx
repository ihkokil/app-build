'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { StatsDashboard } from '@/components/StatsDashboard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBar } from '@/components/SearchBar';
import { TodoList } from '@/components/TodoList';
import { TodoModal } from '@/components/TodoModal';
import { DatabaseModal } from '@/components/DatabaseModal';
import { MobileNavBar } from '@/components/MobileNavBar';
import styles from './page.module.css';
import type { Todo, TodoStats, DbHealthResult, CreateTodoInput } from '@/lib/types';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats>({
    total: 0,
    completed: 0,
    pending: 0,
    urgent: 0,
    completedToday: 0,
    completionRate: 0,
  });
  const [health, setHealth] = useState<DbHealthResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');

  // Modals & Navigation
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'all' | 'today' | 'stats' | 'db'>('all');
  const [isDark, setIsDark] = useState(true);

  // Theme synchronization
  useEffect(() => {
    const savedTheme = localStorage.getItem('omnitask_theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    const themeStr = newTheme ? 'dark' : 'light';
    localStorage.setItem('omnitask_theme', themeStr);
    document.documentElement.setAttribute('data-theme', themeStr);
  };

  // Fetch Database Health
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.success) {
        setHealth(data.health);
      }
    } catch (err) {
      console.error('Failed to fetch db health:', err);
    }
  }, []);

  // Fetch Todos
  const fetchTodos = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
      if (priorityFilter && priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (sortBy) params.set('sort', sortBy);

      const res = await fetch(`/api/todos?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setTodos(data.data);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, priorityFilter, statusFilter, sortBy]);

  // Initial Load
  useEffect(() => {
    fetchTodos();
    fetchHealth();
  }, [fetchTodos, fetchHealth]);

  // Compute Categories from existing todos
  const categoriesList = useMemo(() => {
    const baseCats = ['All', 'Work', 'Personal', 'Development', 'Design', 'DevOps'];
    const dynamicCats = new Set<string>(baseCats);
    todos.forEach((t) => {
      if (t.category) dynamicCats.add(t.category);
    });

    return Array.from(dynamicCats).map((catName) => {
      if (catName === 'All') {
        return { name: 'All', count: todos.length };
      }
      const count = todos.filter((t) => t.category.toLowerCase() === catName.toLowerCase()).length;
      return { name: catName, count };
    });
  }, [todos]);

  // Handle Toggle Completion (Optimistic)
  const handleToggle = async (id: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completed_at: nextCompleted ? new Date().toISOString() : null,
          };
        }
        return t;
      })
    );

    try {
      const res = await fetch(`/api/todos/${id}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Toggle failed:', err);
      fetchTodos(); // Revert on failure
    }
  };

  // Handle Create or Update
  const handleSaveTodo = async (input: CreateTodoInput, id?: string) => {
    if (id) {
      // Update
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setTodos((prev) => prev.map((t) => (t.id === id ? data.data : t)));
      if (data.stats) setStats(data.stats);
    } else {
      // Create
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setTodos((prev) => [data.data, ...prev]);
      if (data.stats) setStats(data.stats);
    }
  };

  // Handle Delete (Optimistic)
  const handleDelete = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      fetchTodos();
    }
  };

  // Handle Subtask update
  const handleUpdateSubtasks = async (id: string, subtasks: Todo['subtasks']) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, subtasks } : t))
    );

    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks }),
      });
    } catch (err) {
      console.error('Subtask update failed:', err);
      fetchTodos();
    }
  };

  // Handle Demo Seed
  const handleSeed = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchTodos();
        await fetchHealth();
      }
    } catch (err) {
      console.error('Seed failed:', err);
    }
  };

  // Mobile Tab Selection Handler
  const handleSelectMobileTab = (tab: 'all' | 'today' | 'stats' | 'db') => {
    setMobileTab(tab);
    if (tab === 'db') {
      setIsDbModalOpen(true);
    } else if (tab === 'today') {
      // Filter for today's items
      setSelectedCategory('All');
      setStatusFilter('all');
    } else if (tab === 'stats') {
      // Scroll to dashboard
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filtered todos for "Today" mobile tab
  const displayedTodos = useMemo(() => {
    if (mobileTab === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      return todos.filter((t) => {
        if (!t.due_date) return false;
        return t.due_date.startsWith(todayStr) || new Date(t.due_date).getTime() < Date.now();
      });
    }
    return todos;
  }, [todos, mobileTab]);

  const isFiltered = Boolean(
    searchQuery ||
      (selectedCategory && selectedCategory !== 'All') ||
      statusFilter !== 'all' ||
      priorityFilter !== 'all' ||
      mobileTab === 'today'
  );

  return (
    <div className={styles.appWrapper}>
      {/* Top Header */}
      <Header
        health={health}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenCreateModal={() => {
          setEditingTodo(null);
          setIsTodoModalOpen(true);
        }}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Productivity Dashboard */}
          <StatsDashboard stats={stats} />

          {/* Category Pills Navigation */}
          <CategoryFilter
            categories={categoriesList}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />

          {/* Search, Status, and Priority Bar */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Task List */}
          <TodoList
            todos={displayedTodos}
            isLoading={isLoading}
            onToggle={handleToggle}
            onEdit={(todo) => {
              setEditingTodo(todo);
              setIsTodoModalOpen(true);
            }}
            onDelete={handleDelete}
            onUpdateSubtasks={handleUpdateSubtasks}
            onOpenCreateModal={() => {
              setEditingTodo(null);
              setIsTodoModalOpen(true);
            }}
            onSeedData={handleSeed}
            isFiltered={isFiltered}
          />
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileNavBar
        currentTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
        onOpenCreate={() => {
          setEditingTodo(null);
          setIsTodoModalOpen(true);
        }}
        urgentCount={stats.urgent}
      />

      {/* Create / Edit Task Modal & Bottom Sheet */}
      <TodoModal
        isOpen={isTodoModalOpen}
        onClose={() => {
          setIsTodoModalOpen(false);
          setEditingTodo(null);
        }}
        onSave={handleSaveTodo}
        editingTodo={editingTodo}
        existingCategories={categoriesList.map((c) => c.name)}
      />

      {/* MySQL Connection & Diagnostics Hub Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        health={health}
        onRefreshHealth={fetchHealth}
        onSeedData={handleSeed}
      />
    </div>
  );
}
