import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Event } from '@/lib/models/Event';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    await dbConnect();
    const { tokenId } = await params;

    // Find ticket in database
    const user = await User.findOne({
      'tickets.tokenId': tokenId,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const ticket = user.tickets.find((t: any) => t.tokenId === tokenId);
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const event = await Event.findById(ticket.eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Create QR code data payload
    const qrData = JSON.stringify({
      tokenId,
      eventId: ticket.eventId,
      walletAddress: user.walletAddress,
      timestamp: Date.now(),
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      ticket: {
        tokenId,
        eventId: ticket.eventId,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        status: ticket.status,
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
