import { NextRequest, NextResponse } from 'next/server';
import { createVariableShift, createFixedShift, getShiftStatus } from '@/lib/sideshift';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      quoteId, 
      settleAddress, 
      depositCoin, 
      depositNetwork,
      settleCoin,
      settleNetwork,
      refundAddress,
      fixed = false 
    } = body;

    const userIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1';

    let shift;
    
    if (fixed && quoteId) {
      shift = await createFixedShift({
        quoteId,
        settleAddress,
        affiliateId: process.env.SIDESHIFT_AFFILIATE_ID || '',
        refundAddress,
      }, userIp);
    } else {
      shift = await createVariableShift({
        settleAddress,
        affiliateId: process.env.SIDESHIFT_AFFILIATE_ID || '',
        depositCoin,
        depositNetwork,
        settleCoin: settleCoin || 'MATIC',
        settleNetwork: settleNetwork || 'polygon',
        refundAddress,
      }, userIp);
    }

    return NextResponse.json(shift);
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json(
      { error: 'Failed to create shift' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shiftId = searchParams.get('id');

    if (!shiftId) {
      return NextResponse.json(
        { error: 'Shift ID required' },
        { status: 400 }
      );
    }

    const status = await getShiftStatus(shiftId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting shift status:', error);
    return NextResponse.json(
      { error: 'Failed to get shift status' },
      { status: 500 }
    );
  }
}