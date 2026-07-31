export type Service = {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'technician_assigned'
  | 'on_the_way'
  | 'work_started'
  | 'completed'
  | 'cancelled';

export type Booking = {
  id: string;
  booking_id: string;
  customer_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  distance_km: number | null;
  preferred_date: string | null;
  preferred_slot: string | null;
  status: BookingStatus;
  total_amount: number;
  notes: string | null;
  technician_name: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  booking_items?: BookingItem[];
};

export type BookingItem = {
  id: string;
  booking_id: string;
  ac_type: string;
  service: string;
  quantity: number;
  price: number;
  created_at: string;
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  review: string;
  photo_url: string | null;
  is_approved: boolean;
  is_verified: boolean;
  booking_id: string | null;
  created_at: string;
};

export type OfferCycle = {
  id: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
  created_at: string;
};

export type Settings = {
  contact?: { phone: string; email: string; whatsapp: string; address: string };
  seo?: { title: string; description: string; keywords: string };
  offer?: { enabled: boolean; activeDurationHours: number; gapDurationHours: number };
  service_area?: { centerLat: number; centerLng: number; radiusKm: number };
  branding?: { name: string; tagline: string };
};

export const AC_TYPES = ['Split AC', 'Window AC', 'Cassette AC', 'Tower AC', 'Portable AC'];

export const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  technician_assigned: 'Technician Assigned',
  on_the_way: 'On The Way',
  work_started: 'Work Started',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  technician_assigned: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  on_the_way: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  work_started: 'bg-violet-100 text-violet-700 border-violet-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};
