'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { motion } from 'framer-motion';
import { ShoppingCart, DollarSign, Ticket, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CONTRACT_ADDRESS, EVENT_TICKET_ABI } from '@/lib/contractABI';

interface ResaleTicket {
  tokenId: string;
  price: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  seller: string;
}

export function TicketMarketplace() {
  const { address, isConnected } = useAccount();
  const [tickets, setTickets] = useState<ResaleTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingTokenId, setPurchasingTokenId] = useState<string | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    fetchResaleTickets();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Ticket purchased successfully!');
      setPurchasingTokenId(null);
      fetchResaleTickets();
    }
  }, [isSuccess]);

  const fetchResaleTickets = async () => {
    try {
      // In a real implementation, you'd fetch from an API that queries the blockchain
      // For now, this is a placeholder
      const response = await fetch('/api/marketplace/resale-tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching resale tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseTicket = async (ticket: ResaleTicket) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    setPurchasingTokenId(ticket.tokenId);

    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: EVENT_TICKET_ABI,
        functionName: 'buyResaleTicket',
        args: [BigInt(ticket.tokenId)],
        value: parseEther(ticket.price),
      });
    } catch (error: any) {
      console.error('Error purchasing ticket:', error);
      toast.error(error.message || 'Failed to purchase ticket');
      setPurchasingTokenId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-orange-200 p-12 text-center">
        <ShoppingCart className="w-16 h-16 text-orange-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets for resale</h3>
        <p className="text-gray-600">Check back later for available tickets</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Ticket Marketplace</h2>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
          {tickets.length} tickets available
        </span>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket, i) => (
          <motion.div
            key={ticket.tokenId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-orange-100 hover:shadow-2xl hover:border-orange-300 transition-all"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  NFT #{ticket.tokenId}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {parseFloat(ticket.price).toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-600">MATIC</div>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{ticket.eventTitle}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-orange-500" />
                  {new Date(ticket.eventDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  <span className="line-clamp-1">{ticket.eventLocation}</span>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-xs text-orange-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>Royalties included</span>
                </div>
              </div>

              <Button
                onClick={() => purchaseTicket(ticket)}
                disabled={
                  !isConnected ||
                  purchasingTokenId === ticket.tokenId ||
                  isPending ||
                  isConfirming
                }
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {purchasingTokenId === ticket.tokenId && (isPending || isConfirming) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Ticket
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
