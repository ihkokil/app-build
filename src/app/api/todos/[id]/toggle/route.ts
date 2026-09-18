import { NextResponse } from 'next/server';
import { TodoService } from '@/lib/todo-service';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { todo, source } = await TodoService.toggleTodo(id);

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
