import { User } from './user';

export interface FriendRequest {
  id: string;
  _id?: string; // MongoDB ID (will be mapped to id)
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
}
