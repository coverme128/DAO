import { supabase } from '../lib/supabase';
import type { Plan } from './billing';
import { addDays } from 'date-fns';

export interface MemorySummary {
  summary: string;
  expiresAt: Date;
}

export class MemoryService {
  private getExpiresAt(plan: Plan): Date {
    const days = plan === 'PRO' ? 90 : 1;
    return addDays(new Date(), days);
  }

  async getOrCreateMemory(userId: string, plan: Plan) {
    const { data: existing } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      return existing;
    }

    const expiresAt = this.getExpiresAt(plan);
    const { data, error } = await supabase
      .from('memories')
      .insert({
        user_id: userId,
        summary: '',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateMemory(userId: string, summary: string, plan: Plan) {
    const expiresAt = this.getExpiresAt(plan);

    const { data: existing } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('memories')
        .update({
          summary,
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('memories')
      .insert({
        user_id: userId,
        summary,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMemorySummary(userId: string): Promise<string> {
    const { data } = await supabase
      .from('memories')
      .select('summary')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return data?.summary || '';
  }

  async clearMemory(userId: string) {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  }

  async generateSummary(messages: Array<{ role: string; content: string }>): Promise<string> {
    // TODO: Implement LLM-based summary generation
    // For MVP, return a simple summary
    const recentMessages = messages.slice(-10);
    return `Recent conversation topics: ${recentMessages.map(m => m.content.substring(0, 50)).join('; ')}`;
  }
}

export const memoryService = new MemoryService();
