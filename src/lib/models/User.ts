import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket {
  eventId: string;
  tokenId: string;
  purchaseDate: Date;
  transactionHash: string;
  status: 'valid' | 'used' | 'refunded';
}

export interface IUser extends Document {
  walletAddress: string;
  createdEvents: string[];
  tickets: ITicket[];
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>({
  eventId: { type: String, required: true },
  tokenId: { type: String, required: true },
  purchaseDate: { type: Date, default: Date.now },
  transactionHash: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['valid', 'used', 'refunded'],
    default: 'valid' 
  },
});

const UserSchema = new Schema<IUser>(
  {
    walletAddress: { type: String, required: true, unique: true, lowercase: true },
    createdEvents: [{ type: String }],
    tickets: [TicketSchema],
    totalSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.index({ walletAddress: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
