import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';
import { User } from '@/lib/models/User';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { walletAddress, transactionHash, tokenId, shiftId } = await request.json();

    if (!walletAddress || !transactionHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.soldTickets >= event.totalTickets) {
      return NextResponse.json(
        { error: 'Event is sold out' },
        { status: 400 }
      );
    }

    await Event.findByIdAndUpdate(id, {
      $inc: { soldTickets: 1 },
      $push: { attendees: walletAddress.toLowerCase() },
    });

    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      {
        $push: {
          tickets: {
            eventId: id,
            tokenId: tokenId || `${id}-${event.soldTickets + 1}`,
            purchaseDate: new Date(),
            transactionHash,
            status: 'valid',
          },
        },
        $inc: { totalSpent: event.ticketPrice },
        $setOnInsert: { walletAddress: walletAddress.toLowerCase() },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Ticket purchased successfully',
      ticketNumber: event.soldTickets + 1,
      shiftId,
    });
  } catch (error) {
    console.error('Error purchasing ticket:', error);
    return NextResponse.json(
      { error: 'Failed to purchase ticket' },
      { status: 500 }
    );
  }
}
