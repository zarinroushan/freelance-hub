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

export interface GigAttachment {
  id?: number;
  file_url: string;
  file_name: string;
  description?: string;
  file_type?: string;
  created_at?: string;
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
  attachments?: GigAttachment[];
  client?: {
    id: number;
    created_at: string;
    profile?: {
      full_name?: string;
      bio?: string;
      avatar_url?: string;
    };
  };
}

export interface Application {
  id: number;
  gig_id: number;
  freelancer_id: number;
  proposed_price: number;
  delivery_days?: number;
  cover_letter?: string;
  portfolio_links?: string;
  resume_url?: string;
  portfolio_url?: string;
  additional_link?: string;
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
  status: 'pending' | 'active' | 'submitted' | 'revision_requested' | 'completed' | 'cancelled';
  created_at: string;
  reviewed_by_me?: boolean;
  revision_feedback?: string | null;
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
  related_entity_type?: string | null;
  related_entity_id?: number | null;
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