import { NextResponse } from 'next/server';
import { TodoService } from '@/lib/todo-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { todo, source } = await TodoService.getTodoById(id);

    if (!todo) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: todo, source });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { todo, source } = await TodoService.updateTodo(id, {
      title: body.title !== undefined ? body.title.trim() : undefined,
      description: body.description !== undefined ? (body.description?.trim() || null) : undefined,
      priority: body.priority,
      category: body.category !== undefined ? body.category.trim() : undefined,
      due_date: body.due_date,
      completed: body.completed,
      subtasks: body.subtasks,
    });

    if (!todo) {
      return NextResponse.json(
        { success: false, error: 'Todo not found' },
        { status: 404 }
      );
    }

    const stats = await TodoService.getStats();

    return NextResponse.json({ success: true, data: todo, source, stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { success, source } = await TodoService.deleteTodo(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Todo not found or could not be deleted' },
        { status: 404 }
      );
    }

    const stats = await TodoService.getStats();

    return NextResponse.json({ success: true, source, stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
