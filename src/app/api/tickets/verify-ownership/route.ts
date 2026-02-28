import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, EVENT_TICKET_ABI } from '@/lib/contractABI';

export async function POST(request: NextRequest) {
  try {
    const { tokenId, walletAddress } = await request.json();

    if (!tokenId || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify on-chain ownership
    const rpcUrl = process.env.POLYGON_MAINNET_RPC || 'https://polygon-rpc.com';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, EVENT_TICKET_ABI, provider);

    try {
      // Get token owner
      const owner = await contract.ownerOf(tokenId);
      
      // Get ticket info
      const ticketInfo = await contract.getTicketInfo(tokenId);
      
      // Verify ownership
      const isOwner = owner.toLowerCase() === walletAddress.toLowerCase();
      
      // Verify ticket validity
      const isValid = await contract.verifyTicket(tokenId, walletAddress);

      return NextResponse.json({
        valid: isOwner && isValid,
        isOwner,
        isValid,
        ticket: {
          tokenId,
          owner: owner,
          eventId: ticketInfo.eventId,
          checkedIn: ticketInfo.checkedIn,
          mintedAt: ticketInfo.mintedAt.toString(),
        },
      });
    } catch (onChainError: any) {
      // Token doesn't exist or other error
      if (onChainError.message?.includes('ERC721NonexistentToken')) {
        return NextResponse.json({
          valid: false,
          isOwner: false,
          isValid: false,
          error: 'Token does not exist',
        });
      }
      
      console.error('On-chain verification error:', onChainError);
      return NextResponse.json(
        { error: 'Failed to verify ticket on-chain', valid: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error verifying ownership:', error);
    return NextResponse.json(
      { error: 'Failed to verify ownership' },
      { status: 500 }
    );
  }
}
