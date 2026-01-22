import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';
import { User } from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const creator = searchParams.get('creator');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const query: Record<string, unknown> = {};

    if (status) query.status = status;
    if (creator) {
      query.creatorAddress = creator.toLowerCase();
    } else {
      query.isPrivate = false;
      if (!status) query.status = 'published';
    }
    
    if (category) query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (creator) {
      return NextResponse.json({ events });
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    console.log('Received event creation request:', body);
    
    const {
      title,
      description,
      date,
      location,
      category,
      imageUrl,
      imageCID,
      ticketPrice,
      totalTickets,
      isPrivate,
      privatePin,
      creatorAddress,
      customTheme,
      status = 'draft',
    } = body;

    if (!title || !description || !date || !location || !category || !creatorAddress) {
      console.log('Validation failed:', { title, description, date, location, category, creatorAddress });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      location,
      category,
      imageUrl: imageUrl || '',
      imageCID: imageCID || '',
      ticketPrice: ticketPrice || 0,
      totalTickets: totalTickets || 100,
      isPrivate: isPrivate || false,
      privatePin: isPrivate ? privatePin : undefined,
      creatorAddress: creatorAddress.toLowerCase(),
      customTheme: customTheme || { primaryColor: '#F97316', backgroundColor: '#FFFBF7' },
      status,
    });

    await User.findOneAndUpdate(
      { walletAddress: creatorAddress.toLowerCase() },
      { 
        $push: { createdEvents: event._id.toString() },
        $setOnInsert: { walletAddress: creatorAddress.toLowerCase() }
      },
      { upsert: true }
    );

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}