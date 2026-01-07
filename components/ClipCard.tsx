import React, { useState } from 'react';
import { VideoClip } from '../types';
import { Play, Download, Wand2, Share2, Pencil, Loader2 } from 'lucide-react';
import { generateViralMetadata } from '../services/geminiService';

interface ClipCardProps {
  clip: VideoClip;
  onPlay: (clip: VideoClip) => void;
  onDownload: (clip: VideoClip) => void;
}

const ClipCard: React.FC<ClipCardProps> = ({ clip, onPlay, onDownload }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [localClip, setLocalClip] = useState<VideoClip>(clip);

  const handleOptimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOptimizing(true);
    try {
      const metadata = await generateViralMetadata(localClip.transcript, "Productivity advice video");
      setLocalClip(prev => ({
        ...prev,
        title: metadata.title,
        hashtags: metadata.hashtags,
        summary: metadata.description
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(localClip);
  };

  return (
    <div 
      className="group relative glass-panel rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => onPlay(localClip)}
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden">
        <img 
          src={localClip.thumbnailUrl} 
          alt={localClip.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-600/30 transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Viral Score Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
          <span className="text-xs text-slate-400">Viral Score</span>
          <span className={`text-sm font-bold ${localClip.viralScore > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
            {localClip.viralScore}
          </span>
        </div>

        {/* Duration Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-white">
          {localClip.duration}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-white mb-2 leading-tight line-clamp-2 group-hover:text-purple-400 transition-colors">
          {localClip.title}
        </h3>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {localClip.hashtags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-grow">
          {localClip.summary}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <button 
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            {isOptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            AI Optimize
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadClick}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white" 
              title="Download Clip"
            >
              <Download className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white" title="Share">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClipCard;