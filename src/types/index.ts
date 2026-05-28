export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed'

export interface Order {
  id: string
  full_name: string
  email: string
  whatsapp: string
  vps_provider: string
  vps_ip: string
  vps_username: string
  vps_password?: string
  ai_provider?: string
  openai_api_key: string
  plan: string
  additional_notes: string | null
  status: OrderStatus
  payment_status: 'unpaid' | 'paid' | 'refunded'
  amount_paid?: number
  deployment_logs: string[]
  ai_url?: string
  created_at: string
  updated_at: string
}

export interface CreateOrderInput {
  full_name: string
  email: string
  whatsapp: string
  vps_provider: string
  vps_ip: string
  vps_region?: string
  vps_username?: string
  vps_password?: string
  ai_provider?: string
  openai_api_key: string
  additional_notes?: string
}

export interface UpdateOrderInput {
  status?: OrderStatus
  payment_status?: 'unpaid' | 'paid' | 'refunded'
  additional_notes?: string
  deployment_logs?: string[]
  ai_url?: string
}

export interface PricingPlan {
  name: string
  price: number
  period?: string
  description: string
  features: string[]
  popular?: boolean
  cta: string
}

export interface Feature {
  icon: string
  title: string
  description: string
}

export interface Testimonial {
  name: string
  role: string
  company: string
  content: string
  rating: number
}

export interface FAQItem {
  question: string
  answer: string
}

export interface Subscription {
  id: string
  email: string
  plan: 'free' | 'basic' | 'pro' | 'business'
  status: 'active' | 'inactive' | 'canceled'
  ls_subscription_id?: string
  ls_customer_id?: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

