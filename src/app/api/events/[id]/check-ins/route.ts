import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Event } from '@/lib/models/Event';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Find all users with tickets for this event that are marked as 'used'
    const users = await User.find({
      'tickets.eventId': id,
      'tickets.status': 'used',
    }).lean();

    const checkIns = users.flatMap((user) =>
      user.tickets
        .filter((ticket: any) => ticket.eventId === id && ticket.status === 'used')
        .map((ticket: any) => ({
          tokenId: ticket.tokenId,
          walletAddress: user.walletAddress,
          checkedInAt: ticket.purchaseDate, // In production, add a checkedInAt field
          eventTitle: event.title,
        }))
    );

    return NextResponse.json({ checkIns });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}
