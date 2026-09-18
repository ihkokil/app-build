import { randomUUID } from 'crypto';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool, checkDbHealth, initDatabase, isDbAvailable } from './db';
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoStats, DbHealthResult, Subtask, Priority } from './types';

// In-memory fallback repository when MySQL is unreachable or not yet configured
let fallbackTodos: Todo[] = [
  {
    id: 'todo-1',
    title: 'Finalize Mobile UI Design System',
    description: 'Ensure 48px touch targets, bottom action sheet, and fluid glassmorphic cards for mobile conversion.',
    priority: 'high',
    category: 'Design',
    due_date: new Date(Date.now() + 86400000).toISOString(),
    completed: false,
    completed_at: null,
    subtasks: [
      { id: 'sub-1', title: 'Audit safe area insets', completed: true },
      { id: 'sub-2', title: 'Create bottom navigation bar', completed: true },
      { id: 'sub-3', title: 'Add tactile tap micro-animations', completed: false },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'todo-2',
    title: 'Configure Remote MySQL Database',
    description: 'Set up remote database credentials in .env.local (Host, User, Password, SSL enabled).',
    priority: 'urgent',
    category: 'DevOps',
    due_date: new Date(Date.now() + 7200000).toISOString(),
    completed: false,
    completed_at: null,
    subtasks: [
      { id: 'sub-4', title: 'Set environment variables in .env.local', completed: false },
      { id: 'sub-5', title: 'Test latency & SSL handshake in app modal', completed: false },
    ],
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'todo-3',
    title: 'Review Mobile App Wrapper (Capacitor/PWA)',
    description: 'Test wrapping this Next.js app in a native shell with full responsive touch ergonomics.',
    priority: 'medium',
    category: 'Development',
    due_date: new Date(Date.now() + 259200000).toISOString(),
    completed: false,
    completed_at: null,
    subtasks: [
      { id: 'sub-6', title: 'Verify viewport-fit=cover on iOS/Android', completed: false },
      { id: 'sub-7', title: 'Test offline SQLite/remote sync', completed: false },
    ],
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'todo-4',
    title: 'Curate Brand Accent Palette',
    description: 'Selected cosmic violet, electric indigo, emerald success, and coral urgency.',
    priority: 'low',
    category: 'Personal',
    due_date: null,
    completed: true,
    completed_at: new Date(Date.now() - 1800000).toISOString(),
    subtasks: [],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

interface TodoRow extends RowDataPacket {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  category: string;
  due_date: Date | null;
  completed: number | boolean;
  completed_at: Date | null;
  subtasks: string | Subtask[] | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function parseRow(row: TodoRow): Todo {
  let parsedSubtasks: Subtask[] = [];
  if (row.subtasks) {
    if (typeof row.subtasks === 'string') {
      try {
        parsedSubtasks = JSON.parse(row.subtasks);
      } catch {
        parsedSubtasks = [];
      }
    } else if (Array.isArray(row.subtasks)) {
      parsedSubtasks = row.subtasks;
    }
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    category: row.category,
    due_date: row.due_date ? new Date(row.due_date).toISOString() : null,
    completed: Boolean(row.completed),
    completed_at: row.completed_at ? new Date(row.completed_at).toISOString() : null,
    subtasks: parsedSubtasks,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString(),
  };
}

export class TodoService {
  static async getHealth(): Promise<DbHealthResult> {
    const health = await checkDbHealth();
    return {
      ...health,
      source: health.connected ? 'mysql' : 'fallback',
      todoCount: health.connected ? await this.getTodoCountFromDb() : fallbackTodos.length,
    };
  }

  private static async getTodoCountFromDb(): Promise<number> {
    try {
      const pool = getPool();
      const [rows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as cnt FROM todos');
      return rows[0]?.cnt || 0;
    } catch {
      return 0;
    }
  }

  static async getTodos(params?: {
    search?: string;
    category?: string;
    priority?: string;
    status?: 'all' | 'active' | 'completed';
    sort?: 'created_desc' | 'created_asc' | 'due_date' | 'priority';
  }): Promise<{ todos: Todo[]; source: 'mysql' | 'fallback' }> {
    try {
      if (!(await isDbAvailable())) {
        return { todos: this.filterFallback(params), source: 'fallback' };
      }
      await initDatabase();
      const pool = getPool();

      let query = 'SELECT * FROM todos WHERE 1=1';
      const values: unknown[] = [];

      if (params?.search) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        const searchPattern = `%${params.search}%`;
        values.push(searchPattern, searchPattern);
      }

      if (params?.category && params.category !== 'All') {
        query += ' AND category = ?';
        values.push(params.category);
      }

      if (params?.priority && params.priority !== 'all') {
        query += ' AND priority = ?';
        values.push(params.priority);
      }

      if (params?.status === 'active') {
        query += ' AND completed = FALSE';
      } else if (params?.status === 'completed') {
        query += ' AND completed = TRUE';
      }

      switch (params?.sort) {
        case 'due_date':
          query += ' ORDER BY due_date IS NULL, due_date ASC, created_at DESC';
          break;
        case 'priority':
          query += ` ORDER BY FIELD(priority, 'urgent', 'high', 'medium', 'low'), created_at DESC`;
          break;
        case 'created_asc':
          query += ' ORDER BY created_at ASC';
          break;
        case 'created_desc':
        default:
          query += ' ORDER BY completed ASC, created_at DESC';
          break;
      }

      const [rows] = await pool.query<TodoRow[]>(query, values);
      return {
        todos: rows.map(parseRow),
        source: 'mysql',
      };
    } catch (err) {
      console.warn('MySQL getTodos fallback to memory store:', err);
      return {
        todos: this.filterFallback(params),
        source: 'fallback',
      };
    }
  }

  private static filterFallback(params?: {
    search?: string;
    category?: string;
    priority?: string;
    status?: 'all' | 'active' | 'completed';
    sort?: 'created_desc' | 'created_asc' | 'due_date' | 'priority';
  }): Todo[] {
    let result = [...fallbackTodos];

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (params?.category && params.category !== 'All') {
      result = result.filter((t) => t.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params?.priority && params.priority !== 'all') {
      result = result.filter((t) => t.priority === params.priority);
    }

    if (params?.status === 'active') {
      result = result.filter((t) => !t.completed);
    } else if (params?.status === 'completed') {
      result = result.filter((t) => t.completed);
    }

    const priorityWeights: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    if (params?.sort === 'due_date') {
      result.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
    } else if (params?.sort === 'priority') {
      result.sort((a, b) => priorityWeights[b.priority] - priorityWeights[a.priority]);
    } else if (params?.sort === 'created_asc') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      result.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return result;
  }

  static async getTodoById(id: string): Promise<{ todo: Todo | null; source: 'mysql' | 'fallback' }> {
    if (!(await isDbAvailable())) {
      const found = fallbackTodos.find((t) => t.id === id) || null;
      return { todo: found, source: 'fallback' };
    }
    try {
      const pool = getPool();
      const [rows] = await pool.query<TodoRow[]>('SELECT * FROM todos WHERE id = ?', [id]);
      if (rows.length === 0) return { todo: null, source: 'mysql' };
      return { todo: parseRow(rows[0]), source: 'mysql' };
    } catch {
      const found = fallbackTodos.find((t) => t.id === id) || null;
      return { todo: found, source: 'fallback' };
    }
  }

  static async createTodo(input: CreateTodoInput): Promise<{ todo: Todo; source: 'mysql' | 'fallback' }> {
    const id = randomUUID();
    const now = new Date();
    const subtasks = input.subtasks || [];
    const priority = input.priority || 'medium';
    const category = input.category?.trim() || 'General';
    const dueDate = input.due_date ? new Date(input.due_date) : null;

    const fallbackTodo: Todo = {
      id,
      title: input.title,
      description: input.description || null,
      priority,
      category,
      due_date: dueDate ? dueDate.toISOString() : null,
      completed: false,
      completed_at: null,
      subtasks,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    if (!(await isDbAvailable())) {
      fallbackTodos.unshift(fallbackTodo);
      return { todo: fallbackTodo, source: 'fallback' };
    }

    try {
      await initDatabase();
      const pool = getPool();
      await pool.query(
        `INSERT INTO todos (id, title, description, priority, category, due_date, completed, subtasks, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, FALSE, ?, ?, ?)`,
        [
          id,
          input.title,
          input.description || null,
          priority,
          category,
          dueDate,
          JSON.stringify(subtasks),
          now,
          now,
        ]
      );

      const createdTodo: Todo = {
        id,
        title: input.title,
        description: input.description || null,
        priority,
        category,
        due_date: dueDate ? dueDate.toISOString() : null,
        completed: false,
        completed_at: null,
        subtasks,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      // Also mirror to fallback memory
      fallbackTodos.unshift(createdTodo);

      return { todo: createdTodo, source: 'mysql' };
    } catch (err) {
      console.warn('MySQL createTodo fallback to memory:', err);
      const fallbackTodo: Todo = {
        id,
        title: input.title,
        description: input.description || null,
        priority,
        category,
        due_date: dueDate ? dueDate.toISOString() : null,
        completed: false,
        completed_at: null,
        subtasks,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
      fallbackTodos.unshift(fallbackTodo);
      return { todo: fallbackTodo, source: 'fallback' };
    }
  }

  private static updateFallback(id: string, input: UpdateTodoInput, now: Date): { todo: Todo | null; source: 'fallback' } {
    const idx = fallbackTodos.findIndex((t) => t.id === id);
    if (idx === -1) return { todo: null, source: 'fallback' };

    const current = fallbackTodos[idx];
    const isCompleted = input.completed !== undefined ? input.completed : current.completed;

    const updated: Todo = {
      ...current,
      title: input.title !== undefined ? input.title : current.title,
      description: input.description !== undefined ? input.description : current.description,
      priority: input.priority !== undefined ? input.priority : current.priority,
      category: input.category !== undefined ? input.category : current.category,
      due_date: input.due_date !== undefined ? input.due_date : current.due_date,
      completed: isCompleted,
      completed_at: isCompleted ? (current.completed_at || now.toISOString()) : null,
      subtasks: input.subtasks !== undefined ? input.subtasks : current.subtasks,
      updated_at: now.toISOString(),
    };

    fallbackTodos[idx] = updated;
    return { todo: updated, source: 'fallback' };
  }

  static async updateTodo(
    id: string,
    input: UpdateTodoInput
  ): Promise<{ todo: Todo | null; source: 'mysql' | 'fallback' }> {
    const now = new Date();

    if (!(await isDbAvailable())) {
      return this.updateFallback(id, input, now);
    }

    try {
      const pool = getPool();
      const updates: string[] = ['updated_at = ?'];
      const values: unknown[] = [now];

      if (input.title !== undefined) {
        updates.push('title = ?');
        values.push(input.title);
      }
      if (input.description !== undefined) {
        updates.push('description = ?');
        values.push(input.description);
      }
      if (input.priority !== undefined) {
        updates.push('priority = ?');
        values.push(input.priority);
      }
      if (input.category !== undefined) {
        updates.push('category = ?');
        values.push(input.category);
      }
      if (input.due_date !== undefined) {
        updates.push('due_date = ?');
        values.push(input.due_date ? new Date(input.due_date) : null);
      }
      if (input.completed !== undefined) {
        updates.push('completed = ?');
        values.push(input.completed);
        updates.push('completed_at = ?');
        values.push(input.completed ? now : null);
      }
      if (input.subtasks !== undefined) {
        updates.push('subtasks = ?');
        values.push(JSON.stringify(input.subtasks));
      }

      values.push(id);

      const [res] = await pool.query<ResultSetHeader>(
        `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      if (res.affectedRows === 0) return { todo: null, source: 'mysql' };

      const updated = await this.getTodoById(id);
      return updated;
    } catch {
      return this.updateFallback(id, input, now);
    }
  }

  static async toggleTodo(id: string): Promise<{ todo: Todo | null; source: 'mysql' | 'fallback' }> {
    const currentResult = await this.getTodoById(id);
    if (!currentResult.todo) return { todo: null, source: currentResult.source };

    const newCompleted = !currentResult.todo.completed;
    return this.updateTodo(id, { completed: newCompleted });
  }

  static async deleteTodo(id: string): Promise<{ success: boolean; source: 'mysql' | 'fallback' }> {
    if (!(await isDbAvailable())) {
      const initLen = fallbackTodos.length;
      fallbackTodos = fallbackTodos.filter((t) => t.id !== id);
      return { success: fallbackTodos.length < initLen, source: 'fallback' };
    }

    try {
      const pool = getPool();
      const [res] = await pool.query<ResultSetHeader>('DELETE FROM todos WHERE id = ?', [id]);
      fallbackTodos = fallbackTodos.filter((t) => t.id !== id);
      return { success: res.affectedRows > 0, source: 'mysql' };
    } catch {
      const initLen = fallbackTodos.length;
      fallbackTodos = fallbackTodos.filter((t) => t.id !== id);
      return { success: fallbackTodos.length < initLen, source: 'fallback' };
    }
  }

  static async getStats(): Promise<TodoStats> {
    const { todos } = await this.getTodos();
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = total - completed;
    const urgent = todos.filter((t) => !t.completed && t.priority === 'urgent').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const completedToday = todos.filter((t) => {
      if (!t.completed || !t.completed_at) return false;
      return t.completed_at.startsWith(todayStr);
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      urgent,
      completedToday,
      completionRate,
    };
  }

  static async seedTodos(): Promise<{ count: number; source: 'mysql' | 'fallback' }> {
    try {
      await initDatabase();
      const pool = getPool();

      // Check if already populated
      const [existing] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as cnt FROM todos');
      if (existing[0]?.cnt === 0) {
        for (const todo of fallbackTodos) {
          await pool.query(
            `INSERT INTO todos (id, title, description, priority, category, due_date, completed, completed_at, subtasks, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              todo.id,
              todo.title,
              todo.description,
              todo.priority,
              todo.category,
              todo.due_date ? new Date(todo.due_date) : null,
              todo.completed,
              todo.completed_at ? new Date(todo.completed_at) : null,
              JSON.stringify(todo.subtasks),
              new Date(todo.created_at),
              new Date(todo.updated_at),
            ]
          );
        }
      }
      return { count: fallbackTodos.length, source: 'mysql' };
    } catch {
      return { count: fallbackTodos.length, source: 'fallback' };
    }
  }
}
