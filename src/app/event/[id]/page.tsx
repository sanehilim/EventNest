'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { BrowserProvider, Contract } from 'ethers';
import { motion } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Lock, Ticket, ArrowLeft, Sparkles, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { EVENT_TICKET_ABI, CONTRACT_ADDRESS } from '@/lib/contractABI';
import { SideShiftPaymentModal } from '@/components/SideShiftPaymentModal';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  ticketPrice: number;
  availableTickets: number;
  totalTickets: number;
  imageUrl: string;
  creator: string;
  isPrivate: boolean;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Event data received:', data);
        setEvent(data);
        if (data.isPrivate && !pinVerified) {
          setShowPinDialog(true);
        }
      } else {
        toast.error('Event not found');
        router.push('/explore');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const verifyPin = async () => {
    try {
      const res = await fetch(`/api/events/${params.id}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        setPinVerified(true);
        setShowPinDialog(false);
        toast.success('PIN verified! You can now view the event.');
      } else {
        toast.error('Invalid PIN');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      toast.error('Failed to verify PIN');
    }
  };

  const handleBuyNowClick = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!event) {
      toast.error('Event data not loaded');
      return;
    }

    if (!address) {
      toast.error('Wallet address not found');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (shiftId: string) => {
    if (!event || !address) return;

    setPurchasing(true);
    setShowPaymentModal(false);

    try {
      toast.info('Processing your ticket purchase...');

      const provider = new BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, EVENT_TICKET_ABI, signer);

      const onChainEvent = await contract.getEventInfo(event._id);
      
      if (!onChainEvent.isActive) {
        throw new Error('Event is not active on blockchain. Please contact event creator.');
      }

      const metadata = {
        name: `${event.title} - Ticket`,
        description: `Event ticket for ${event.title}`,
        event: event.title,
        date: new Date(event.date).toLocaleDateString(),
        location: event.location,
        ticketHolder: address,
        paymentMethod: 'SideShift Crypto Payment',
        shiftId: shiftId,
      };

      console.log('Uploading metadata to IPFS...');

      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });
      const formData = new FormData();
      formData.append('file', metadataFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload metadata to IPFS');
      }
      
      const uploadData = await uploadRes.json();
      const ipfsUrl = uploadData.ipfsUrl || uploadData.url || uploadData.IpfsUrl;

      if (!ipfsUrl) {
        throw new Error('IPFS URL not received');
      }

      console.log('IPFS URL:', ipfsUrl);

      const priceInWei = BigInt(Math.floor(event.ticketPrice * 1e18));

      toast.info('Minting your NFT ticket on blockchain...');

      const tx = await contract.mintTicket(address, event._id, ipfsUrl, {
        value: priceInWei
      });
      
      toast.info('Waiting for blockchain confirmation...');
      await tx.wait();

      toast.success('🎉 Ticket purchased successfully!');

      await fetch(`/api/events/${event._id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyer: address }),
      });

      fetchEvent();
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Error purchasing ticket:', error);
      toast.error(error?.message || 'Failed to purchase ticket. Please contact support.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFFBF7] to-white">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  if (showPinDialog && !pinVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFFBF7] to-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl border border-orange-200 p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Private Event</h2>
            <p className="text-gray-600">Enter the PIN to access this event</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="pin" className="text-gray-700 font-semibold">Event PIN</Label>
              <Input
                id="pin"
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyPin()}
                placeholder="Enter PIN"
                className="mt-2 border-orange-200 focus:border-orange-500"
                maxLength={6}
              />
            </div>

            <Button
              onClick={verifyPin}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6"
            >
              Verify PIN
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push('/explore')}
              className="w-full text-gray-600"
            >
              Back to Events
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBF7] to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/explore')}
            className="mb-6 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
                {/* Event Image */}
                <div className="relative h-96 bg-gradient-to-br from-orange-200 to-orange-100">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Sparkles className="w-24 h-24 text-orange-300" />
                    </div>
                  )}
                  {event.isPrivate && (
                    <div className="absolute top-6 right-6 bg-orange-500 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2 shadow-lg">
                      <Lock className="w-4 h-4" />
                      Private Event
                    </div>
                  )}
                  <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-medium text-orange-600">
                    {event.category}
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">{event.location}</span>
                    </div>
                  </div>

                  <div className="border-t border-orange-100 pt-6">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Event</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                  </div>

                  {/* Security Features */}
                  <div className="mt-8 bg-orange-50 rounded-2xl p-6 border border-orange-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-orange-600" />
                      Blockchain Verified Tickets
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        NFT tickets minted on Polygon Amoy testnet
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        Fraud-proof and cannot be duplicated
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        Stored permanently on IPFS
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Purchase Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-6 sticky top-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    ${event.ticketPrice}
                    <span className="text-lg font-normal text-gray-600"> USDC</span>
                  </div>
                  <p className="text-sm text-gray-600">per ticket</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-3 border-t border-orange-100">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-orange-500" />
                      Available
                    </span>
                    <span className="font-semibold text-gray-900">
                      {event.availableTickets} / {event.totalTickets}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-t border-orange-100">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-500" />
                      Sold
                    </span>
                    <span className="font-semibold text-gray-900">
                      {event.totalTickets - event.availableTickets}
                    </span>
                  </div>
                </div>

                {event.availableTickets > 0 ? (
                  <Button
                    onClick={handleBuyNowClick}
                    disabled={purchasing || !isConnected}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-orange-300/50 transition-all"
                  >
                    {purchasing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : !isConnected ? (
                      'Connect Wallet to Purchase'
                    ) : (
                      <span className="flex items-center gap-2">
                        <Ticket className="w-5 h-5" />
                        Buy Now
                      </span>
                    )}
                  </Button>
                ) : (
                  <div className="text-center py-6 bg-gray-100 rounded-xl">
                    <p className="text-gray-600 font-medium">Sold Out</p>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center mt-4">
                  Pay with any crypto via SideShift. Your NFT ticket will be sent to your wallet.
                </p>

                {/* Creator Info */}
                <div className="mt-6 pt-6 border-t border-orange-100">
                  <p className="text-sm text-gray-600 mb-2">Event Creator</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {event.creator && event.creator.length >= 4 ? event.creator.slice(2, 4).toUpperCase() : '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 truncate font-mono">
                        {event.creator && event.creator.length >= 10 
                          ? `${event.creator.slice(0, 6)}...${event.creator.slice(-4)}` 
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {event && address && (
        <SideShiftPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          ticketPrice={event.ticketPrice}
          settleAddress={address}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}