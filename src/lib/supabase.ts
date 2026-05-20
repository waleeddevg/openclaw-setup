import { createClient } from '@supabase/supabase-js'
import { Order, CreateOrderInput, UpdateOrderInput } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function createOrder(order: CreateOrderInput): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert([{
      ...order,
      status: 'pending',
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating order:', error)
    return null
  }

  return data
}

export async function getOrders(email?: string): Promise<Order[]> {
  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (email) {
    query = query.eq('email', email)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data || []
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data
}

export async function updateOrder(id: string, updates: UpdateOrderInput): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order:', error)
    return null
  }

  return data
}

export async function deleteOrder(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('orders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting order:', error)
    return false
  }

  return true
}

export async function getSubscription(email: string): Promise<any | null> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  return data
}

export async function upsertSubscription(subscription: any): Promise<any | null> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      ...subscription,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'email'
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting subscription:', error)
    return null
  }

  return data
}

