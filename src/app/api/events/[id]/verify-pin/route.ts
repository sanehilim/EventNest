import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { pin } = await request.json();

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.isPrivate) {
      return NextResponse.json({ valid: true });
    }

    if (event.privatePin === pin) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json(
      { error: 'Invalid PIN', valid: false },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json(
      { error: 'Failed to verify PIN' },
      { status: 500 }
    );
  }
}
