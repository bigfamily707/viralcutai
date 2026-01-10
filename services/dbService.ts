import { supabase } from './supabaseClient';
import { VideoClip, UserPlan } from '../types';

// --- Projects ---

export const createProject = async (userId: string, title: string, sourceUrl: string = '') => {
  const { data, error } = await supabase
    .from('projects')
    .insert([
      { 
        user_id: userId, 
        title: title, 
        source_url: sourceUrl,
        status: 'completed' // For this demo, we assume immediate completion
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// --- Clips ---

export const saveGeneratedClips = async (projectId: string, userId: string, clips: VideoClip[]) => {
  const dbClips = clips.map(clip => ({
    project_id: projectId,
    user_id: userId,
    title: clip.title,
    thumbnail_url: clip.thumbnailUrl,
    video_url: clip.videoUrl || '', 
    duration: clip.duration,
    viral_score: clip.viralScore,
    summary: clip.summary,
    hashtags: clip.hashtags,
    start_time: clip.startTime,
    end_time: clip.endTime,
    transcript_segment: clip.transcript
  }));

  const { data, error } = await supabase
    .from('generated_clips')
    .insert(dbClips)
    .select();

  if (error) throw error;
  
  // Map back to frontend structure
  return data.map(mapDbClipToVideoClip);
};

export const fetchUserClips = async (userId: string): Promise<VideoClip[]> => {
  const { data, error } = await supabase
    .from('generated_clips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapDbClipToVideoClip);
};

// --- Profiles & Usage ---

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) return null;
  return data;
};

export const createUserProfile = async (user: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      { 
        id: user.id, 
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
        plan: 'free',
        used_minutes: 0
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateUserUsage = async (userId: string, minutesToAdd: number) => {
  // 1. Get current usage
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('used_minutes')
    .eq('id', userId)
    .single();
    
  if (fetchError) throw fetchError;

  const newTotal = (profile?.used_minutes || 0) + minutesToAdd;

  // 2. Update
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ used_minutes: newTotal })
    .eq('id', userId);

  if (updateError) throw updateError;
  return newTotal;
};

export const updateUserPlan = async (userId: string, plan: UserPlan) => {
  const { error } = await supabase
    .from('profiles')
    .update({ plan: plan })
    .eq('id', userId);

  if (error) throw error;
};

// --- Helper ---

const mapDbClipToVideoClip = (dbClip: any): VideoClip => ({
  id: dbClip.id,
  title: dbClip.title,
  thumbnailUrl: dbClip.thumbnail_url || 'https://picsum.photos/300/533',
  duration: dbClip.duration,
  viralScore: dbClip.viral_score,
  hashtags: dbClip.hashtags || [],
  summary: dbClip.summary,
  transcript: dbClip.transcript_segment || '',
  startTime: dbClip.start_time,
  endTime: dbClip.end_time,
  videoUrl: dbClip.video_url
});