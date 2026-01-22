import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { Event } from '@/lib/models/Event';
import { CONTRACT_ADDRESS, EVENT_TICKET_ABI } from '@/lib/contractABI';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { qrData, eventId, organizerAddress } = await request.json();

    if (!qrData || !eventId || !organizerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse QR code data
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch {
      return NextResponse.json(
        { error: 'Invalid QR code format' },
        { status: 400 }
      );
    }

    const { tokenId, walletAddress } = parsedData;

    // Verify event exists and organizer matches
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.creatorAddress.toLowerCase() !== organizerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: Not the event organizer' },
        { status: 403 }
      );
    }

    // Verify ticket exists in database
    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
      'tickets.tokenId': tokenId,
      'tickets.eventId': eventId,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Ticket not found in database' },
        { status: 404 }
      );
    }

    const ticket = user.tickets.find(
      (t: any) => t.tokenId === tokenId && t.eventId === eventId
    );

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Verify ticket hasn't been used
    if (ticket.status === 'used') {
      return NextResponse.json(
        { error: 'Ticket already checked in', valid: false },
        { status: 400 }
      );
    }

    // Verify on-chain ownership using smart contract
    const rpcUrl = process.env.POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, EVENT_TICKET_ABI, provider);

    try {
      // Check if token exists and get owner
      const owner = await contract.ownerOf(tokenId);
      const ticketInfo = await contract.getTicketInfo(tokenId);

      // Verify ownership matches
      if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
        return NextResponse.json(
          { error: 'Ticket ownership mismatch', valid: false },
          { status: 400 }
        );
      }

      // Verify ticket belongs to this event
      if (ticketInfo.eventId !== eventId) {
        return NextResponse.json(
          { error: 'Ticket does not belong to this event', valid: false },
          { status: 400 }
        );
      }

      // Verify ticket hasn't been checked in on-chain
      if (ticketInfo.checkedIn) {
        return NextResponse.json(
          { error: 'Ticket already checked in on-chain', valid: false },
          { status: 400 }
        );
      }

      // Mark ticket as used in database
      await User.updateOne(
        {
          walletAddress: walletAddress.toLowerCase(),
          'tickets.tokenId': tokenId,
        },
        {
          $set: {
            'tickets.$.status': 'used',
          },
        }
      );

      return NextResponse.json({
        valid: true,
        ticket: {
          tokenId,
          eventId,
          eventTitle: event.title,
          walletAddress,
          checkedIn: true,
        },
      });
    } catch (onChainError: any) {
      console.error('On-chain verification error:', onChainError);
      return NextResponse.json(
        { error: 'Failed to verify ticket on-chain', valid: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error verifying QR code:', error);
    return NextResponse.json(
      { error: 'Failed to verify QR code' },
      { status: 500 }
    );
  }
}
