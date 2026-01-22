import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';
import { parseSearchQuery } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const filters = await parseSearchQuery(query);

    const mongoQuery: Record<string, unknown> = {
      status: 'published',
      isPrivate: false,
    };

    if (filters.category) {
      mongoQuery.category = { $regex: filters.category, $options: 'i' };
    }

    if (filters.location) {
      mongoQuery.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters.dateFrom || filters.dateTo) {
      mongoQuery.date = {};
      if (filters.dateFrom) {
        (mongoQuery.date as Record<string, Date>).$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        (mongoQuery.date as Record<string, Date>).$lte = new Date(filters.dateTo);
      }
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      mongoQuery.ticketPrice = {};
      if (filters.priceMin !== undefined) {
        (mongoQuery.ticketPrice as Record<string, number>).$gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        (mongoQuery.ticketPrice as Record<string, number>).$lte = filters.priceMax;
      }
    }

    if (filters.keywords && filters.keywords.length > 0) {
      const keywordRegex = filters.keywords.join('|');
      mongoQuery.$or = [
        { title: { $regex: keywordRegex, $options: 'i' } },
        { description: { $regex: keywordRegex, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(mongoQuery)
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(mongoQuery),
    ]);

    return NextResponse.json({
      events,
      filters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error searching events:', error);
    return NextResponse.json(
      { error: 'Failed to search events' },
      { status: 500 }
    );
  }
}
