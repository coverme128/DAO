import { supabase } from '../lib/supabase';

export type Plan = 'FREE' | 'PRO';

export class BillingService {
  async getUserPlan(userId: string): Promise<Plan> {
    const { data, error } = await supabase
      .from('users')
      .select('plan')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return (data?.plan as Plan) || 'FREE';
  }

  async updateUserPlan(userId: string, plan: Plan) {
    const { data, error } = await supabase
      .from('users')
      .update({ plan })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async createOrGetUser(email?: string) {
    if (!email) {
      // Anonymous user
      const { data, error } = await supabase
        .from('users')
        .insert({})
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) {
      return existing;
    }

    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        plan: 'FREE',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const billingService = new BillingService();
