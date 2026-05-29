export interface Account {
  id: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: string;
  isPremium: boolean;
  premiumExpiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
