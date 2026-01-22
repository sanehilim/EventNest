'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Ticket, DollarSign, Calendar } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    averageTicketPrice: number;
  };
  eventsByStatus: Record<string, number>;
  salesByCategory: Record<string, number>;
  revenueByEvent: Array<{
    eventId: string;
    title: string;
    revenue: number;
    ticketsSold: number;
    date: string;
  }>;
  dailySales: Array<{
    date: string;
    tickets: number;
    revenue: number;
  }>;
  topEvents: Array<{
    eventId: string;
    title: string;
    ticketsSold: number;
    totalTickets: number;
    revenue: number;
    conversionRate: number;
  }>;
}

const COLORS = ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5'];

export function OrganizerAnalytics() {
  const { address } = useAccount();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchAnalytics();
    }
  }, [address]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/organizer?address=${address}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-600">
        No analytics data available
      </div>
    );
  }

  const categoryData = Object.entries(data.salesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = Object.entries(data.eventsByStatus).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">
              {data.overview.totalEvents}
            </span>
          </div>
          <p className="text-sm text-gray-600">Total Events</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Ticket className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">
              {data.overview.totalTicketsSold}
            </span>
          </div>
          <p className="text-sm text-gray-600">Tickets Sold</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">
              {data.overview.totalRevenue.toFixed(2)} MATIC
            </span>
          </div>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">
              {data.overview.averageTicketPrice.toFixed(2)} MATIC
            </span>
          </div>
          <p className="text-sm text-gray-600">Avg Ticket Price</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Sales (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="tickets"
                stroke="#F97316"
                strokeWidth={2}
                name="Tickets"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FB923C"
                strokeWidth={2}
                name="Revenue (MATIC)"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sales by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue by Event */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top Events by Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenueByEvent.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#F97316" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Events by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Events by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#FB923C" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Events Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Top Performing Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Event</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Tickets Sold</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {data.topEvents.map((event) => (
                <tr key={event.eventId} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{event.title}</div>
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    {event.ticketsSold} / {event.totalTickets}
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-gray-900">
                    {event.revenue.toFixed(2)} MATIC
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    {event.conversionRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
