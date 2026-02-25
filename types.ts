
export enum Country {
  UGANDA = 'Uganda',
  KENYA = 'Kenya',
  TANZANIA = 'Tanzania'
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  UGX = 'UGX',
  KES = 'KES',
  TZS = 'TZS'
}

export enum Language {
  ENGLISH = 'English',
  FRENCH = 'French',
  SPANISH = 'Spanish',
  GERMAN = 'German',
  ARABIC = 'Arabic'
}

export type Activity = 'Wildlife' | 'Rafting' | 'Trekking' | 'Beach' | 'Hiking' | 'Photography' | 'Birding' | 'Relaxation';

export interface Location {
  country: Country;
  district: string;
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'Hotel' | 'Airbnb';
  country: Country;
  district: string;
  price: number;
  rating: number;
  image: string; // Featured image
  images: string[]; // Carousel images
  activities: Activity[];
  description: string;
  lat: number;
  lng: number;
}

export interface Guide {
  id: string;
  name: string;
  bio: string;
  country: Country;
  location: string;
  languages: string[];
  expertise: Activity[];
  rating: number;
  reviews: number;
  image: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  experienceYears: number;
}

export interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  price: number;
  duration: string;
  time: string; // HH:mm AM/PM
  stops: number;
  departureDate: string; // YYYY-MM-DD
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  priceLevel: number; // 1-4
  rating: number;
  reviews: number;
  district: string;
  country: Country;
  image: string;
  description: string;
}

export interface Car {
  id: string;
  name: string;
  type: 'SUV' | '4x4 Safari' | 'Sedan' | 'Van';
  transmission: 'Automatic' | 'Manual';
  capacity: number;
  pricePerDay: number;
  image: string;
  country: Country;
  district: string;
  features: string[];
}

export interface TourActivity {
  id: string;
  name: string;
  description: string;
  country: Country;
  location: string;
  image: string;
  price: number;
  rating: number;
  duration: string;
  category: Activity;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type TripBudget = 'Backpacker' | 'Moderate' | 'Luxury';
export type TripGroup = 'Solo' | 'Couple' | 'Family' | 'Group';

export interface TripPlanRequest {
  destination: Country | 'Surprise Me';
  duration: number;
  budget: TripBudget;
  group: TripGroup;
  interests: Activity[];
}
