'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { BrowserProvider, Contract } from 'ethers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Upload, Lock, Unlock, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { EVENT_TICKET_ABI, CONTRACT_ADDRESS } from '@/lib/contractABI';

export default function CreateEventPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: '',
    ticketPrice: '',
    totalTickets: '',
    isPrivate: false,
    pin: ''
  });

  if (!isConnected) {
    router.push('/');
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload image to Pinata
      let imageUrl = '';
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) throw new Error('Failed to upload image');
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.ipfsUrl;
      }

      // Prepare event data for MongoDB
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        location: formData.location,
        category: formData.category,
        ticketPrice: formData.ticketPrice ? parseFloat(formData.ticketPrice) : 0,
        totalTickets: parseInt(formData.totalTickets),
        imageUrl,
        creatorAddress: address,
        isPrivate: formData.isPrivate,
        privatePin: formData.isPrivate ? formData.pin : undefined,
        status: 'published',
      };

      // Create event in MongoDB first to get event ID
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      const data = await res.json();
      const mongoEventId = data.event._id;

      toast.info('Creating event on blockchain...');

      // Create event on blockchain
      const provider = new BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, EVENT_TICKET_ABI, signer);

      // Convert ticket price to wei
      const ticketPriceInWei = BigInt(Math.floor(parseFloat(formData.ticketPrice) * 1e18));

      // Call createEvent on smart contract
      const tx = await contract.createEvent(
        mongoEventId, // Use MongoDB ID as eventId
        parseInt(formData.totalTickets), // maxSupply
        ticketPriceInWei, // ticketPrice in wei
        imageUrl || '' // metadataURI
      );

      console.log('Blockchain transaction submitted:', tx.hash);
      await tx.wait();
      console.log('Blockchain transaction confirmed');

      toast.success('🎉 Event created successfully on blockchain!');
      router.push(`/event/${mongoEventId}`);
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error?.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBF7] to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-6 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8" />
                <h1 className="text-4xl font-bold">Create Your Event</h1>
              </div>
              <p className="text-orange-100">Fill in the details and launch your event on-chain</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Image Upload */}
              <div>
                <Label className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-orange-500" />
                  Event Banner
                </Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl border-2 border-orange-200"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-orange-300 rounded-xl cursor-pointer bg-orange-50 hover:bg-orange-100 transition-colors">
                      <Upload className="w-12 h-12 text-orange-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload banner image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Event Title */}
              <div>
                <Label htmlFor="title" className="text-gray-700 font-semibold">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Web3 Developer Meetup"
                  required
                  className="mt-2 border-orange-200 focus:border-orange-500"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-gray-700 font-semibold">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your event..."
                  rows={4}
                  required
                  className="mt-2 border-orange-200 focus:border-orange-500"
                />
              </div>

              {/* Date & Location */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date" className="text-gray-700 font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    Event Date
                  </Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="mt-2 border-orange-200 focus:border-orange-500"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-gray-700 font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Bangalore, India"
                    required
                    className="mt-2 border-orange-200 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-gray-700 font-semibold">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="mt-2 w-full px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select a category</option>
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Arts">Arts & Culture</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Ticket Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="ticketPrice" className="text-gray-700 font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-orange-500" />
                    Ticket Price (USDC)
                  </Label>
                  <Input
                    id="ticketPrice"
                    type="number"
                    step="0.01"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    placeholder="10.00"
                    required
                    className="mt-2 border-orange-200 focus:border-orange-500"
                  />
                </div>

                <div>
                  <Label htmlFor="totalTickets" className="text-gray-700 font-semibold">Total Tickets</Label>
                  <Input
                    id="totalTickets"
                    type="number"
                    value={formData.totalTickets}
                    onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
                    placeholder="100"
                    required
                    className="mt-2 border-orange-200 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Private Event Toggle */}
              <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {formData.isPrivate ? (
                      <Lock className="w-5 h-5 text-orange-600" />
                    ) : (
                      <Unlock className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <Label className="text-gray-900 font-semibold">Private Event</Label>
                      <p className="text-sm text-gray-600">Require a PIN to register</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isPrivate ? 'bg-orange-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isPrivate ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {formData.isPrivate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4"
                  >
                    <Label htmlFor="pin" className="text-gray-700 font-semibold">Event PIN</Label>
                    <Input
                      id="pin"
                      type="text"
                      value={formData.pin}
                      onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                      placeholder="Enter 4-6 digit PIN"
                      required={formData.isPrivate}
                      maxLength={6}
                      className="mt-2 border-orange-300 focus:border-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Share this PIN with invited attendees</p>
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-orange-300/50 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Event...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Create Event
                  </span>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}