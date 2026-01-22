'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, Plus, User, Sparkles, ExternalLink, QrCode, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketQRCode } from '@/components/TicketQRCode';
import { OrganizerAnalytics } from '@/components/OrganizerAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserTicket {
  tokenId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventImage: string;
  mintedAt: string;
}

interface UserEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  ticketPrice: number;
  availableTickets: number;
  totalTickets: number;
  status: string;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }
    
    fetchUserData();
  }, [isConnected, address]);

  const fetchUserData = async () => {
    if (!address) return;

    try {
      const [ticketsRes, eventsRes] = await Promise.all([
        fetch(`/api/user?address=${address}&type=tickets`),
        fetch(`/api/events?creator=${address}`)
      ]);

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData.tickets || []);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBF7] to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My <span className="text-orange-600">Dashboard</span>
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span className="text-sm font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
            </div>
            <Button
              onClick={() => router.push('/create-event')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Ticket className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-bold text-gray-900">My Tickets</h2>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {tickets.length}
                  </span>
                </div>

                {tickets.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-orange-100 p-12 text-center">
                    <Sparkles className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets yet</h3>
                    <p className="text-gray-600 mb-6">Explore events and get your first NFT ticket!</p>
                    <Button
                      onClick={() => router.push('/explore')}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                      Explore Events
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.map((ticket, i) => (
                      <motion.div
                        key={ticket.tokenId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-orange-100 hover:shadow-2xl hover:border-orange-300 transition-all cursor-pointer"
                        onClick={() => router.push(`/event/${ticket.eventId}`)}
                      >
                        <div className="relative h-40 bg-gradient-to-br from-orange-200 to-orange-100">
                          {ticket.eventImage ? (
                            <img
                              src={ticket.eventImage}
                              alt={ticket.eventTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Ticket className="w-12 h-12 text-orange-300" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            NFT #{ticket.tokenId}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{ticket.eventTitle}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-orange-500" />
                              {new Date(ticket.eventDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-orange-500" />
                              <span className="line-clamp-1">{ticket.eventLocation}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-orange-600" />
                  <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {events.length}
                  </span>
                </div>

                {events.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-orange-100 p-12 text-center">
                    <Plus className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No events created yet</h3>
                    <p className="text-gray-600 mb-6">Start hosting your first event on-chain!</p>
                    <Button
                      onClick={() => router.push('/create-event')}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Event
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event, i) => (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-orange-100 hover:shadow-2xl hover:border-orange-300 transition-all"
                      >
                        <div className="relative h-40 bg-gradient-to-br from-orange-200 to-orange-100">
                          {event.imageUrl ? (
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Sparkles className="w-12 h-12 text-orange-300" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                              event.status === 'published'
                                ? 'bg-green-500 text-white'
                                : 'bg-yellow-500 text-white'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                          <div className="space-y-1 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-orange-500" />
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <Ticket className="w-3 h-3 text-orange-500" />
                              {event.availableTickets} / {event.totalTickets} available
                            </div>
                          </div>
                          <Button
                            onClick={() => router.push(`/event/${event._id}`)}
                            variant="outline"
                            className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                          >
                            View Event
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
