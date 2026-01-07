import React, { useCallback, useState } from 'react';
import { CloudUpload, Link, Youtube, Video, FileVideo } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, onUrlSubmit }) => {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onUrlSubmit(urlInput);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      <div 
        className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 p-12 text-center cursor-pointer
          ${dragActive 
            ? 'border-purple-500 bg-purple-500/10' 
            : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          accept="video/*"
          onChange={(e) => e.target.files && e.target.files[0] && onFileSelect(e.target.files[0])}
        />
        
        <div className="flex flex-col items-center gap-4 pointer-events-none">
          <div className={`p-5 rounded-full bg-slate-800 transition-transform duration-300 ${dragActive ? 'scale-110 bg-purple-600' : ''}`}>
            <CloudUpload className={`w-10 h-10 ${dragActive ? 'text-white' : 'text-slate-400'}`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Drag & Drop video file
            </h3>
            <p className="text-slate-400 text-sm">
              MP4, MOV, or AVI up to 4GB
            </p>
          </div>
          <div className="flex gap-3 text-xs text-slate-500 uppercase tracking-widest font-semibold mt-2">
            <span>Or browse files</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-slate-500">
        <div className="h-px bg-slate-800 flex-grow" />
        <span className="text-xs uppercase font-medium">Or paste link</span>
        <div className="h-px bg-slate-800 flex-grow" />
      </div>

      <form onSubmit={handleUrlSubmit} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Link className="w-5 h-5 text-slate-500" />
        </div>
        <input 
          type="url" 
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste YouTube, Vimeo, or Zoom link..."
          className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl py-4 pl-12 pr-32 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
        />
        <button 
          type="submit"
          className="absolute right-2 top-2 bottom-2 bg-slate-800 hover:bg-purple-600 text-white px-6 rounded-xl font-medium transition-all duration-300"
        >
          Import
        </button>
      </form>

      {/* Supported Platforms */}
      <div className="flex justify-center gap-6 text-slate-600">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Youtube className="w-4 h-4" /> YouTube
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <Video className="w-4 h-4" /> Zoom Rec
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <FileVideo className="w-4 h-4" /> Vimeo
        </div>
      </div>
    </div>
  );
};

export default UploadZone;