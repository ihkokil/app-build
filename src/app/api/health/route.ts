import { NextResponse } from 'next/server';
import { TodoService } from '@/lib/todo-service';

export async function GET() {
  try {
    const health = await TodoService.getHealth();
    return NextResponse.json({ success: true, health });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Health check failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
