export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  level: 'Explorer' | 'Guide' | 'Heritage Sage';
  points: number;
  badges: string[];
}

export interface Santhe {
  id?: string;
  name: string;
  village: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  coordinates: Coordinates;
  description?: string;
  imageUrl?: string;
  specialties?: string[];
  isVerified?: boolean;
  addedBy: string;
  createdAt: any;
}

export interface Eatery {
  id?: string;
  name: string;
  type: 'hotel' | 'homestay' | 'pop-up' | 'mess';
  village: string;
  specialty?: string;
  coordinates: Coordinates;
  description?: string;
  imageUrl?: string;
  isVerified?: boolean;
  addedBy: string;
  createdAt: any;
}

export interface Review {
  id?: string;
  targetId?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  type: 'voice' | 'photo' | 'text';
  content: string;
  mediaUrl?: string;
  hasPhoto?: boolean;
  hasVoice?: boolean;
  createdAt: any;
}
