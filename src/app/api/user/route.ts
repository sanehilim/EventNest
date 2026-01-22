import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Event } from '@/lib/models/Event';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');
    const type = searchParams.get('type');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      user = await User.create({
        walletAddress: walletAddress.toLowerCase(),
        createdEvents: [],
        tickets: [],
        totalSpent: 0,
      });
    }

    if (type === 'tickets') {
      const ticketEvents = await Event.find({
        _id: { $in: user.tickets.map((t: { eventId: string }) => t.eventId) }
      }).lean();

      const tickets = user.tickets.map((ticket: any) => {
        const event = ticketEvents.find((e: any) => e._id.toString() === ticket.eventId);
        return {
          tokenId: ticket.tokenId,
          eventId: ticket.eventId,
          eventTitle: event?.title || 'Unknown Event',
          eventDate: event?.date || new Date(),
          eventLocation: event?.location || 'Unknown',
          eventImage: event?.imageUrl || '',
          mintedAt: ticket.purchaseDate,
        };
      });

      return NextResponse.json({ tickets });
    }

    const createdEvents = await Event.find({ 
      creatorAddress: walletAddress.toLowerCase() 
    }).sort({ createdAt: -1 }).lean();

    const ticketEvents = await Event.find({
      _id: { $in: user.tickets.map((t: { eventId: string }) => t.eventId) }
    }).lean();

    const ticketsWithEvents = user.tickets.map((ticket: any) => {
      const event = ticketEvents.find((e: any) => e._id.toString() === ticket.eventId);
      return { ...ticket, event };
    });

    return NextResponse.json({
      user: {
        ...user.toObject(),
        createdEvents,
        ticketsWithEvents,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}