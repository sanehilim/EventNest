'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { QrCode, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CheckInRecord {
  tokenId: string;
  walletAddress: string;
  checkedInAt: string;
  eventTitle: string;
}

export default function CheckInPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [event, setEvent] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }
    fetchEvent();
    fetchCheckIns();
  }, [isConnected, params.eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);

        // Verify user is the organizer
        if (data.creatorAddress.toLowerCase() !== address?.toLowerCase()) {
          toast.error('Unauthorized: You are not the event organizer');
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckIns = async () => {
    try {
      const response = await fetch(`/api/events/${params.eventId}/check-ins`);
      if (response.ok) {
        const data = await response.json();
        setCheckIns(data.checkIns || []);
      }
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    }
  };

  const handleScanSuccess = async (ticket: any) => {
    await fetchCheckIns();
    setShowScanner(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBF7] to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Check-In: <span className="text-orange-600">{event.title}</span>
            </h1>
            <p className="text-gray-600">{event.location}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Check-In Scanner</h2>
                  <Button
                    onClick={() => setShowScanner(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    Start Scanner
                  </Button>
                </div>
                <p className="text-gray-600">
                  Scan attendee QR codes to check them in. Each ticket can only be checked in once.
                </p>
              </div>

              <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Check-In Records ({checkIns.length})
                </h3>
                {checkIns.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No check-ins yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {checkIns.map((checkIn, i) => (
                      <motion.div
                        key={checkIn.tokenId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-semibold text-gray-900">
                              Token #{checkIn.tokenId}
                            </div>
                            <div className="text-sm text-gray-600 font-mono">
                              {checkIn.walletAddress.slice(0, 6)}...
                              {checkIn.walletAddress.slice(-4)}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(checkIn.checkedInAt).toLocaleTimeString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Event Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Tickets</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {event.totalTickets}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Sold</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {event.soldTickets}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Checked In</div>
                    <div className="text-2xl font-bold text-green-600">
                      {checkIns.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Attendance Rate</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {event.soldTickets > 0
                        ? ((checkIns.length / event.soldTickets) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {showScanner && (
        <QRCodeScanner
          eventId={params.eventId as string}
          organizerAddress={address || ''}
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
