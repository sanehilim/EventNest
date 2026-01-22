import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  category: string;
  imageUrl: string;
  imageCID: string;
  ticketPrice: number;
  totalTickets: number;
  soldTickets: number;
  isPrivate: boolean;
  privatePin?: string;
  creatorAddress: string;
  contractAddress?: string;
  metadataCID?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  customTheme: {
    primaryColor: string;
    backgroundColor: string;
  };
  attendees: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    imageCID: { type: String, default: '' },
    ticketPrice: { type: Number, required: true, default: 0 },
    totalTickets: { type: Number, required: true, default: 100 },
    soldTickets: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: false },
    privatePin: { type: String },
    creatorAddress: { type: String, required: true },
    contractAddress: { type: String },
    metadataCID: { type: String },
    status: { 
      type: String, 
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft' 
    },
    customTheme: {
      primaryColor: { type: String, default: '#F97316' },
      backgroundColor: { type: String, default: '#FFFBF7' },
    },
    attendees: [{ type: String }],
  },
  { timestamps: true }
);

EventSchema.index({ title: 'text', description: 'text', location: 'text', category: 'text' });
EventSchema.index({ creatorAddress: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ date: 1 });

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
