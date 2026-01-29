export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  updated_at: string; 
  created_at: string; 
}

export interface Ad {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string;
  format: string;
  condition: string;
  region_code: string | null;
  is_steelbook: boolean;
  is_sold: boolean;
  created_at: string;
  profiles?: Profile | null;
}

export interface Review {
  id: string;
  reviewer_id: string;
  receiver_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Chat {
  id: string;
  ad_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  ads?: Ad;
  buyer?: Profile;
  seller?: Profile;
}
