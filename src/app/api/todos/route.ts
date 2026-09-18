import { NextResponse } from 'next/server';
import { TodoService } from '@/lib/todo-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const status = (searchParams.get('status') as 'all' | 'active' | 'completed') || undefined;
    const sort = (searchParams.get('sort') as any) || undefined;

    const [todosResult, stats] = await Promise.all([
      TodoService.getTodos({ search, category, priority, status, sort }),
      TodoService.getStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: todosResult.todos,
      source: todosResult.source,
      stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch todos';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const { todo, source } = await TodoService.createTodo({
      title: body.title.trim(),
      description: body.description?.trim() || null,
      priority: body.priority || 'medium',
      category: body.category?.trim() || 'General',
      due_date: body.due_date || null,
      subtasks: Array.isArray(body.subtasks) ? body.subtasks : [],
    });

    const stats = await TodoService.getStats();

    return NextResponse.json(
      { success: true, data: todo, source, stats },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create todo';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
