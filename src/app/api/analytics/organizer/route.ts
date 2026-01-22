import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';
import { User } from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const organizerAddress = searchParams.get('address');

    if (!organizerAddress) {
      return NextResponse.json(
        { error: 'Organizer address required' },
        { status: 400 }
      );
    }

    // Get all events created by organizer
    const events = await Event.find({
      creatorAddress: organizerAddress.toLowerCase(),
    }).lean();

    // Calculate analytics
    const totalEvents = events.length;
    const totalTicketsSold = events.reduce((sum, event) => sum + (event.soldTickets || 0), 0);
    const totalRevenue = events.reduce(
      (sum, event) => sum + (event.soldTickets || 0) * (event.ticketPrice || 0),
      0
    );

    // Events by status
    const eventsByStatus = events.reduce(
      (acc, event) => {
        acc[event.status] = (acc[event.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Sales over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEvents = events.filter(
      (event) => new Date(event.createdAt) >= thirtyDaysAgo
    );

    // Sales by category
    const salesByCategory = events.reduce(
      (acc, event) => {
        const category = event.category || 'Other';
        acc[category] = (acc[category] || 0) + (event.soldTickets || 0);
        return acc;
      },
      {} as Record<string, number>
    );

    // Revenue by event
    const revenueByEvent = events
      .map((event) => ({
        eventId: event._id.toString(),
        title: event.title,
        revenue: (event.soldTickets || 0) * (event.ticketPrice || 0),
        ticketsSold: event.soldTickets || 0,
        date: event.date,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Daily sales (last 30 days)
    const dailySales: Record<string, { date: string; tickets: number; revenue: number }> = {};
    
    // Get all tickets purchased for organizer's events
    const eventIds = events.map((e) => e._id.toString());
    const users = await User.find({
      'tickets.eventId': { $in: eventIds },
    }).lean();

    users.forEach((user) => {
      user.tickets.forEach((ticket: any) => {
        if (eventIds.includes(ticket.eventId)) {
          const event = events.find((e) => e._id.toString() === ticket.eventId);
          if (event) {
            const date = new Date(ticket.purchaseDate).toISOString().split('T')[0];
            if (!dailySales[date]) {
              dailySales[date] = { date, tickets: 0, revenue: 0 };
            }
            dailySales[date].tickets += 1;
            dailySales[date].revenue += event.ticketPrice || 0;
          }
        }
      });
    });

    const dailySalesArray = Object.values(dailySales)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    // Top performing events
    const topEvents = events
      .map((event) => ({
        eventId: event._id.toString(),
        title: event.title,
        ticketsSold: event.soldTickets || 0,
        totalTickets: event.totalTickets || 0,
        revenue: (event.soldTickets || 0) * (event.ticketPrice || 0),
        conversionRate:
          event.totalTickets > 0
            ? ((event.soldTickets || 0) / event.totalTickets) * 100
            : 0,
      }))
      .sort((a, b) => b.ticketsSold - a.ticketsSold)
      .slice(0, 5);

    return NextResponse.json({
      overview: {
        totalEvents,
        totalTicketsSold,
        totalRevenue,
        averageTicketPrice: totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0,
      },
      eventsByStatus,
      salesByCategory,
      revenueByEvent,
      dailySales: dailySalesArray,
      topEvents,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
