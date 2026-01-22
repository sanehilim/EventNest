import { NextRequest, NextResponse } from 'next/server';
import { getQuote, QuoteRequest } from '@/lib/sideshift';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { depositCoin, depositNetwork, settleCoin, settleNetwork, settleAmount } = body;

    const quoteRequest: QuoteRequest = {
      depositCoin,
      depositNetwork,
      settleCoin: settleCoin || 'MATIC',
      settleNetwork: settleNetwork || 'polygon',
      settleAmount: settleAmount.toString(),
    };

    const userIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1';

    const quote = await getQuote(quoteRequest, userIp);

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error getting quote:', error);
    return NextResponse.json(
      { error: 'Failed to get quote' },
      { status: 500 }
    );
  }
}