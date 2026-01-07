import React, { useRef, useEffect, useState } from 'react';
import { VideoClip } from '../types';
import { X, Download, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoModalProps {
  clip: VideoClip;
  videoSrc: string | null;
  onClose: () => void;
  onDownload: (clip: VideoClip) => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ clip, videoSrc, onClose, onDownload }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set initial time
    video.currentTime = clip.startTime;

    const handleTimeUpdate = () => {
      if (video.currentTime >= clip.endTime) {
        // Loop clip
        video.currentTime = clip.startTime;
        video.play();
      }
      
      const duration = clip.endTime - clip.startTime;
      const current = video.currentTime - clip.startTime;
      setProgress((current / duration) * 100);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    
    // Auto play on mount
    video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [clip]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-slate-900 z-10">
          <h3 className="font-semibold text-white truncate pr-4">{clip.title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        {/* Video Player */}
        <div className="relative aspect-[9/16] bg-black group">
          {videoSrc ? (
            <video 
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-cover"
              onClick={togglePlay}
              playsInline
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400">
               <p className="px-6 text-center">Video preview unavailable for URL imports in this demo. Please upload a file.</p>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {!isPlaying && videoSrc && (
              <div className="w-16 h-16 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-between mb-2">
              <button onClick={togglePlay} className="text-white hover:text-purple-400">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={toggleMute} className="text-white hover:text-purple-400">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
            {/* Progress Bar */}
            <div className="h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-100" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
           {/* Fake Captions Overlay */}
           <div className="absolute bottom-16 left-0 right-0 px-6 text-center pointer-events-none">
              <span className="inline-block bg-black/60 backdrop-blur-md px-3 py-1 text-lg font-bold text-yellow-400 shadow-lg rounded-lg leading-relaxed animate-pulse">
                {clip.summary.split('.')[0]}
              </span>
           </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-900 border-t border-white/10 space-y-3">
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {clip.hashtags.map(t => (
                <span key={t} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded whitespace-nowrap">{t}</span>
              ))}
           </div>
           <button 
              onClick={() => onDownload(clip)}
              className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
           >
             <Download className="w-5 h-5" />
             Download Clip (.mp4)
           </button>
           <p className="text-[10px] text-center text-slate-500">
             *In this demo, download returns metadata receipt. Real rendering requires backend.
           </p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;