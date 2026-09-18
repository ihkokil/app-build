export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  category: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  subtasks: Subtask[];
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string | null;
  priority?: Priority;
  category?: string;
  due_date?: string | null;
  subtasks?: Subtask[];
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  priority?: Priority;
  category?: string;
  due_date?: string | null;
  completed?: boolean;
  subtasks?: Subtask[];
}

export interface DbHealthResult {
  connected: boolean;
  host: string;
  port: number;
  database: string;
  latencyMs?: number;
  error?: string | null;
  source: 'mysql' | 'fallback';
  tableReady: boolean;
  todoCount?: number;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  urgent: number;
  completedToday: number;
  completionRate: number;
}
