import { NextResponse } from 'next/server';
import { TodoService } from '@/lib/todo-service';

export async function POST() {
  try {
    const result = await TodoService.seedTodos();
    const stats = await TodoService.getStats();
    return NextResponse.json({ success: true, seeded: result.count, source: result.source, stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Seed failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
