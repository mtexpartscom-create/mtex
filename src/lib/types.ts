export type UserRole = 'b2c' | 'b2b' | 'admin';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  uic_eik: string | null;
  b2b_approved: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Part {
  id: string;
  title: string;
  description: string | null;
  price: number;
  oem_code: string | null;
  image_url: string | null;
  category_id: string | null;
  in_stock: boolean;
  created_at: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  engine: string | null;
  gearbox: string | null;
  image_url: string | null;
  created_at: string;
}

export type OrderStatus = 'new' | 'sent' | 'done' | 'cancelled';

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  phone: string;
  city: string;
  ekont_office: string;
  status: OrderStatus;
  total: number;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  part_id: string | null;
  title: string;
  price: number;
  quantity: number;
}

export interface BuybackRequest {
  id: string;
  make: string;
  model: string;
  year: number;
  condition: string;
  photos: string[] | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface ServiceBooking {
  id: string;
  service_type: string;
  name: string;
  phone: string;
  vehicle_info: string | null;
  preferred_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  part_description: string;
  created_at: string;
}

export interface EcontCity {
  id: string;
  name: string;
  sort_order: number;
}

export interface EcontOffice {
  id: string;
  city_id: string;
  name: string;
  address: string | null;
  sort_order: number;
}

export interface CartItem {
  part: Part;
  quantity: number;
}