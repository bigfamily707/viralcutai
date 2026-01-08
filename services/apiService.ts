import { VideoClip, AspectRatio } from '../types';

const API_BASE = ''; // Proxied via Vite

export interface UploadResponse {
  filename: string;
  path: string;
  type: 'local' | 'url' | 'youtube';
}

export const uploadVideo = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('video', file);

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Upload failed');
  return response.json();
};

export const importVideoUrl = async (url: string): Promise<UploadResponse> => {
  const response = await fetch(`${API_BASE}/api/import-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) throw new Error('Import failed');
  return response.json();
};

export const processVideoClips = async (
  sourceFilename: string, 
  clips: VideoClip[], 
  aspectRatio: AspectRatio
): Promise<VideoClip[]> => {
  const response = await fetch(`${API_BASE}/api/process-clips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      sourceFilename, 
      clips,
      aspectRatio 
    }),
  });

  if (!response.ok) throw new Error('Processing failed');
  const data = await response.json();
  return data.clips;
};
