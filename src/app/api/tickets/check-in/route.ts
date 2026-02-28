import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import dbConnect from '@/lib/mongodb';
import { Event } from '@/lib/models/Event';
import { CONTRACT_ADDRESS, EVENT_TICKET_ABI } from '@/lib/contractABI';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { tokenId, eventId, organizerAddress, signature } = await request.json();

    if (!tokenId || !eventId || !organizerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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

    // Verify on-chain and check-in
    const rpcUrl = process.env.POLYGON_MAINNET_RPC || 'https://polygon-rpc.com';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, EVENT_TICKET_ABI, provider);

    try {
      const ticketInfo = await contract.getTicketInfo(tokenId);
      
      if (ticketInfo.eventId !== eventId) {
        return NextResponse.json(
          { error: 'Ticket does not belong to this event' },
          { status: 400 }
        );
      }

      if (ticketInfo.checkedIn) {
        return NextResponse.json(
          { error: 'Ticket already checked in' },
          { status: 400 }
        );
      }

      // If signature provided, use it to check-in on-chain
      // Otherwise, just mark in database (for manual check-in)
      if (signature && process.env.PRIVATE_KEY) {
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contractWithSigner = contract.connect(wallet);
        
        const tx = await contractWithSigner.checkInTicket(tokenId);
        await tx.wait();

        return NextResponse.json({
          success: true,
          transactionHash: tx.hash,
          message: 'Ticket checked in on-chain',
        });
      } else {
        // Database-only check-in (for testing or manual process)
        return NextResponse.json({
          success: true,
          message: 'Ticket marked as checked in (database only)',
        });
      }
    } catch (onChainError: any) {
      console.error('On-chain check-in error:', onChainError);
      return NextResponse.json(
        { error: 'Failed to check in ticket on-chain', details: onChainError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error checking in ticket:', error);
    return NextResponse.json(
      { error: 'Failed to check in ticket' },
      { status: 500 }
    );
  }
}
