export interface User {
  id: number;
  email: string;
  role: 'student' | 'client';
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  bio?: string;
  university?: string;
  avatar_url?: string;
  availability: string;
  completed_gigs_count: number;
  average_rating: number;
  created_at: string;
  total_earnings?: number;
  skills_summary?: string;
}

export interface Gig {
  id: number;
  title: string;
  description: string;
  category_id: number;
  client_id: number;
  budget: number;
  delivery_days: number;
  status: 'draft' | 'open' | 'closed' | 'completed' | 'cancelled';
  application_count: number;
  created_at: string;
  requirements: string;
  deliverables: string;
}

export interface Application {
  id: number;
  gig_id: number;
  freelancer_id: number;
  proposed_price: number;
  delivery_days?: number;
  cover_letter?: string;
  portfolio_links?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  freelancer?: {
    id: number;
    email: string;
    role: string;
    profile?: Profile;
  };
}

export interface Contract {
  id: number;
  gig_id: number;
  client_id: number;
  freelancer_id: number;
  agreed_budget: number;
  status: 'pending' | 'active' | 'submitted' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Payment {
  id: number;
  contract_id: number;
  amount: number;
  status: 'pending' | 'released' | 'failed' | 'refunded';
  released_at?: string;
  created_at: string;
}

export interface Review {
  id: number;
  contract_id: number;
  reviewer_id: number;
  reviewed_id: number;
  rating: number;
  comment?: string;
  is_from_client: boolean;
  created_at: string;
}