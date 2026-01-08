import React, { useRef, useEffect, useState } from 'react';
import { VideoClip } from '../types';
import { X, Download, Play, Pause, Volume2, VolumeX, AlertCircle, RotateCcw, RotateCw } from 'lucide-react';

interface VideoModalProps {
  clip: VideoClip;
  videoSrc: string | null;
  onClose: () => void;
  onDownload: (clip: VideoClip) => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ clip, videoSrc, onClose, onDownload }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);

  // Precision Loop Logic
  const checkLoop = () => {
    const video = videoRef.current;
    if (!video) return;

    // High precision time check
    if (video.currentTime >= clip.endTime) {
      video.currentTime = clip.startTime;
      if (!video.paused) video.play();
    } else if (video.currentTime < clip.startTime) {
      video.currentTime = clip.startTime;
    }

    // Update Progress Bar
    const duration = clip.endTime - clip.startTime;
    const current = Math.max(0, video.currentTime - clip.startTime);
    setProgress((current / duration) * 100);

    animationFrameRef.current = requestAnimationFrame(checkLoop);
  };

  // Handle successful metadata load to initialize playback position
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = clip.startTime;
    video.volume = volume; // Set initial volume
    
    // Attempt auto-play
    video.play()
      .then(() => setIsPlaying(true))
      .catch((e) => {
        console.warn("Autoplay prevented:", e);
        setIsPlaying(false);
      });
  };

  const handleVideoError = () => {
    setVideoError(true);
    setIsPlaying(false);
  };

  useEffect(() => {
    const video = videoRef.current;
    
    // Reset error state when source changes
    setVideoError(false);

    // Start precision loop
    animationFrameRef.current = requestAnimationFrame(checkLoop);

    // If video is already ready (e.g. same source, different clip), reposition
    if (video && video.readyState >= 1) {
       video.currentTime = clip.startTime;
       video.volume = volume;
       if (!video.paused) setIsPlaying(true);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (video) video.pause();
    };
  }, [clip, videoSrc]); 

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

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      let newTime = videoRef.current.currentTime + seconds;
      // Clamp to clip boundaries
      if (newTime > clip.endTime) newTime = clip.endTime - 0.1;
      if (newTime < clip.startTime) newTime = clip.startTime;
      
      videoRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // If unmuting and volume was 0, reset to default 1
      if (!newMutedState && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      }
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
        
        {/* Video Player Area */}
        <div className="relative aspect-[9/16] bg-black group">
          {videoSrc && !videoError ? (
            <video 
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-cover"
              onClick={togglePlay}
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
              onError={handleVideoError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 p-8">
               <div className="text-center">
                 <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-slate-400" />
                 </div>
                 <p className="font-semibold text-white mb-2">Preview Unavailable</p>
                 <p className="text-xs text-slate-400 leading-relaxed">
                   External links (YouTube/Vimeo) cannot be previewed directly in the browser due to security restrictions. 
                 </p>
                 <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-xs text-purple-300 font-medium">
                        Tip: Upload a local video file to enable real-time preview.
                    </p>
                 </div>
               </div>
            </div>
          )}

          {/* Controls Overlay (Only show if video is valid) */}
          {videoSrc && !videoError && (
             <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                 {/* Centered Play & Seek Controls */}
                 <div className="absolute inset-0 flex items-center justify-center gap-8 pointer-events-none">
                     <button 
                        onClick={(e) => { e.stopPropagation(); handleSeek(-10); }}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all hover:scale-110 pointer-events-auto text-white"
                        title="Rewind 10s"
                     >
                         <RotateCcw className="w-6 h-6" />
                     </button>
                     
                     <button 
                         onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                         className="w-16 h-16 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/40 hover:scale-105 transition-all pointer-events-auto text-white"
                     >
                         {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                     </button>

                     <button 
                        onClick={(e) => { e.stopPropagation(); handleSeek(10); }}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all hover:scale-110 pointer-events-auto text-white"
                        title="Forward 10s"
                     >
                         <RotateCw className="w-6 h-6" />
                     </button>
                 </div>

                 {/* Bottom Bar: Volume, Progress, Actions */}
                 <div className="mt-auto flex items-center gap-4 pointer-events-auto z-20">
                     {/* Volume Control */}
                     <div className="flex items-center gap-2 group/vol">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                          className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
                        >
                          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300 ease-out">
                           <input 
                             type="range" 
                             min="0" 
                             max="1" 
                             step="0.05"
                             value={isMuted ? 0 : volume}
                             onChange={handleVolumeChange}
                             onClick={(e) => e.stopPropagation()}
                             className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-purple-500"
                           />
                        </div>
                     </div>

                     {/* Progress Bar */}
                     <div className="flex-grow h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                     </div>

                     <button 
                       onClick={(e) => { e.stopPropagation(); onDownload(clip); }}
                       className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                       title="Download Clip"
                     >
                        <Download className="w-4 h-4" />
                     </button>
                 </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;