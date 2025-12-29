import { supabase } from '../lib/supabase';
import type { Plan } from './billing';
import { format } from 'date-fns';

const FREE_DAILY_LIMIT = 10;

export interface UsageCheckResult {
  allowed: boolean;
  remaining: number;
  plan: Plan;
}

export class UsageService {
  async checkVoiceUsage(userId: string, plan: Plan): Promise<UsageCheckResult> {
    if (plan === 'PRO') {
      return {
        allowed: true,
        remaining: -1, // unlimited
        plan: 'PRO',
      };
    }

    const today = format(new Date(), 'yyyy-MM-dd');

    // Get or create usage record
    const { data: existing } = await supabase
      .from('usages')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    let usage;
    if (existing) {
      usage = existing;
    } else {
      const { data, error } = await supabase
        .from('usages')
        .insert({
          user_id: userId,
          date: today,
          voice_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      usage = data;
    }

    const remaining = FREE_DAILY_LIMIT - usage.voice_count;
    const allowed = remaining > 0;

    return {
      allowed,
      remaining: Math.max(0, remaining),
      plan: 'FREE',
    };
  }

  async consumeVoice(userId: string, plan: Plan): Promise<UsageCheckResult> {
    if (plan === 'PRO') {
      return {
        allowed: true,
        remaining: -1,
        plan: 'PRO',
      };
    }

    const today = format(new Date(), 'yyyy-MM-dd');

    // Get or create usage record
    const { data: existing } = await supabase
      .from('usages')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    let usage;
    if (existing) {
      // Increment voice count
      const { data, error } = await supabase
        .from('usages')
        .update({ voice_count: existing.voice_count + 1 })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      usage = data;
    } else {
      const { data, error } = await supabase
        .from('usages')
        .insert({
          user_id: userId,
          date: today,
          voice_count: 1,
        })
        .select()
        .single();

      if (error) throw error;
      usage = data;
    }

    const remaining = FREE_DAILY_LIMIT - usage.voice_count;
    const allowed = remaining >= 0;

    return {
      allowed,
      remaining: Math.max(0, remaining),
      plan: 'FREE',
    };
  }

  async getTodayUsage(userId: string) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('usages')
      .select('voice_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    return data?.voice_count || 0;
  }
}

export const usageService = new UsageService();
