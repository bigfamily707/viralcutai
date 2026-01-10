import { VideoClip, AspectRatio } from '../types';

// For Vercel deployment, we simulate the backend processing client-side.
// The actual FFmpeg cutting is replaced by logic in VideoModal that plays specific timestamp ranges.

export interface UploadResponse {
  filename: string;
  path: string;
  type: 'local' | 'url' | 'youtube';
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const uploadVideo = async (file: File): Promise<UploadResponse> => {
  // Simulate network upload delay
  await delay(1500);
  
  return {
    filename: file.name,
    path: URL.createObjectURL(file), // Use Blob URL for local preview
    type: 'local'
  };
};

export const importVideoUrl = async (url: string): Promise<UploadResponse> => {
  // Simulate checking URL validity
  await delay(1000);

  return {
    filename: 'imported_video',
    path: url,
    type: 'url'
  };
};

export const processVideoClips = async (
  sourceFilename: string, 
  clips: VideoClip[], 
  aspectRatio: AspectRatio
): Promise<VideoClip[]> => {
  // Simulate FFmpeg processing time (approx 2s per clip)
  const processingTime = Math.min(clips.length * 2000, 8000); 
  await delay(processingTime);

  // Return the clips. 
  // Note: In this client-side demo version, we don't generate physical .mp4 files.
  // The VideoModal component uses startTime/endTime to play the correct segment.
  return clips.map(clip => ({
    ...clip,
    // We leave videoUrl undefined here so the App uses the original source + timestamps
    // or we could generate blob URLs if we had an in-browser WASM ffmpeg implementation.
    videoUrl: undefined 
  }));
};