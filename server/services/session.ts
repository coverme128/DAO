import { supabase } from '../lib/supabase';

export type Plan = 'FREE' | 'PRO';
export type Role = 'USER' | 'ASSISTANT';

export interface CreateSessionParams {
  userId: string;
}

export interface CreateMessageParams {
  sessionId: string;
  role: Role;
  content: string;
}

export interface UsageCheckResult {
  allowed: boolean;
  remaining: number;
  plan: Plan;
}

export class SessionService {
  async createSession(params: CreateSessionParams) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: params.userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSession(sessionId: string) {
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;
    if (!session) return null;

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    return {
      ...session,
      messages: messages || [],
    };
  }

  async createMessage(params: CreateMessageParams) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: params.sessionId,
        role: params.role,
        content: params.content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getHistory(sessionId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async deleteSession(sessionId: string) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    return { success: true };
  }

  async deleteUserData(userId: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  }
}

export const sessionService = new SessionService();
