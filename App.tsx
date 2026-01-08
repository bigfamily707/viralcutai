import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Settings, 
  Scissors, 
  ChevronRight, 
  Zap, 
  Layout, 
  Clock,
  CircleCheck,
  AlertCircle,
  Menu,
  X,
  CreditCard,
  Download
} from 'lucide-react';

import UploadZone from './components/UploadZone';
import ClipCard from './components/ClipCard';
import EngagementChart from './components/EngagementChart';
import VideoModal from './components/VideoModal';
import TemplatesPage from './components/TemplatesPage';
import Pricing from './components/Pricing';
import Showcase from './components/Showcase';

import { AppStep, AppView, AspectRatio, VideoClip, ProcessingConfig } from './types';
import { TEMPLATES, ASPECT_RATIOS, MOCK_TRANSCRIPT_SEGMENT } from './constants';
import { generateViralMetadata } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [generatedClips, setGeneratedClips] = useState<VideoClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null);
  const [config, setConfig] = useState<ProcessingConfig>({
    aspectRatio: AspectRatio.PORTRAIT_9_16,
    template: TEMPLATES[0].id,
    customPrompt: '',
    faceDetection: true,
    autoCaptions: true,
  });

  // Cleanup object URL on unmount or restart
  useEffect(() => {
    return () => {
      if (videoObjectUrl) {
        URL.revokeObjectURL(videoObjectUrl);
      }
    };
  }, [videoObjectUrl]);

  // Handle File Selection
  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    // Create local object URL for previewing the real video
    const url = URL.createObjectURL(file);
    setVideoObjectUrl(url);
    setCurrentStep(AppStep.CONFIG);
  };

  const handleUrlSubmit = (url: string) => {
    setVideoUrl(url);
    setVideoObjectUrl(null); // External URLs can't be previewed simply in <video> tag due to CORS often
    setCurrentStep(AppStep.CONFIG);
  };

  // Mock Download Functionality
  const handleDownload = (clip: VideoClip) => {
    const fileContent = `
VIRAL CUT PROJECT - DOWNLOAD RECEIPT
====================================
This file confirms that your clip was processed in the demo environment.

Clip ID: ${clip.id}
Title: ${clip.title}
Original File: ${uploadedFile?.name || videoUrl}
Timestamps: ${clip.startTime}s - ${clip.endTime}s

[Transcript]
${clip.transcript}

NOTE: Real server-side video rendering requires backend infrastructure (FFmpeg/GPU).
In this demo, the preview player simulated the cut by looping the video segment.
    `.trim();

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${clip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Optional: Visual feedback
    // alert(`Download simulation started for: ${clip.title}`);
  };

  // Simulate Processing
  const startProcessing = () => {
    setCurrentStep(AppStep.PROCESSING);
    setProcessingProgress(0);

    const stages = [
      { msg: 'Uploading video to secure cloud...', duration: 1000 },
      { msg: 'Analyzing audio transcript...', duration: 1500 },
      { msg: 'Detecting faces & viral moments...', duration: 2000 },
      { msg: 'Generating captions...', duration: 1000 },
      { msg: 'Rendering final clips...', duration: 1000 },
    ];

    let accumulatedTime = 0;
    for (let i = 0; i < stages.length; i++) {
      setTimeout(() => {
        setProcessingStatus(stages[i].msg);
        setProcessingProgress(((i + 1) / stages.length) * 100);
      }, accumulatedTime);
      accumulatedTime += stages[i].duration;
    }

    // Finish processing
    setTimeout(async () => {
      await generateMockClips();
      setCurrentStep(AppStep.DASHBOARD);
    }, accumulatedTime + 500);
  };

  // Generate Mock Data
  const generateMockClips = async () => {
    // Initial request for default metadata for the first clip to show integration
    let initialMetadata;
    try {
      initialMetadata = await generateViralMetadata(MOCK_TRANSCRIPT_SEGMENT, "Productivity Vlog");
    } catch (e) {
      console.error(e);
      initialMetadata = {
         title: "Productivity Hack 101",
         hashtags: ["#productivity"],
         description: "A quick tip.",
         viralScoreReasoning: "Good pace."
      };
    }

    // We generate somewhat random timestamps. 
    // In a real app, these would come from the backend analysis of the specific video file.
    // For this demo, we assume the user uploaded a video at least 1 minute long.
    const mockClips: VideoClip[] = [
      {
        id: '1',
        title: initialMetadata.title,
        thumbnailUrl: `https://picsum.photos/300/533?random=1`,
        duration: '0:15',
        viralScore: 94,
        hashtags: initialMetadata.hashtags,
        summary: initialMetadata.description,
        transcript: MOCK_TRANSCRIPT_SEGMENT,
        startTime: 0, // Starts at 0 for demo purposes so it works with any video
        endTime: 15,
      },
      {
        id: '2',
        title: 'Why Most People Fail 🚫',
        thumbnailUrl: `https://picsum.photos/300/533?random=2`,
        duration: '0:10',
        viralScore: 88,
        hashtags: ['#motivation', '#failure', '#success', '#mindset'],
        summary: 'A hard truth about why inconsistency kills dreams.',
        transcript: "Most people fail not because they lack talent, but because they lack grit. Grit is the ability to keep going when things get hard.",
        startTime: 15,
        endTime: 25,
      },
      {
        id: '3',
        title: 'The 2-Minute Rule ⏱️',
        thumbnailUrl: `https://picsum.photos/300/533?random=3`,
        duration: '0:08',
        viralScore: 91,
        hashtags: ['#timemanagement', '#tips', '#hacks', '#life'],
        summary: 'If it takes less than 2 minutes, do it now.',
        transcript: "Here is the golden rule. If a task takes less than two minutes, do it immediately. Just do it.",
        startTime: 25,
        endTime: 33,
      },
      {
        id: '4',
        title: 'Behind the Scenes 🎬',
        thumbnailUrl: `https://picsum.photos/300/533?random=4`,
        duration: '0:12',
        viralScore: 76,
        hashtags: ['#bts', '#filmmaking', '#creator', '#vlog'],
        summary: 'A funny blooper from the recording session.',
        transcript: "Okay, let's try that again. *Laughs* I completely forgot what I was going to say.",
        startTime: 33,
        endTime: 45,
      }
    ];
    setGeneratedClips(mockClips);
  };

  const handleRestart = () => {
    setUploadedFile(null);
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    setVideoObjectUrl(null);
    setVideoUrl('');
    setGeneratedClips([]);
    setCurrentStep(AppStep.UPLOAD);
  };

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    // If navigating away from home, we don't necessarily reset the step, 
    // but if navigating TO home, we keep the state unless explicitly reset.
  };

  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/5 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick(AppView.HOME)}>
        <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <Scissors className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          ViralCut<span className="text-purple-500">AI</span>
        </span>
      </div>
      
      <div className="hidden md:flex items-center gap-6">
        <nav className="flex gap-4 text-sm font-medium text-slate-400">
          <button onClick={() => handleNavClick(AppView.TEMPLATES)} className={`hover:text-white transition-colors ${currentView === AppView.TEMPLATES ? 'text-white' : ''}`}>Templates</button>
          <button onClick={() => handleNavClick(AppView.PRICING)} className={`hover:text-white transition-colors ${currentView === AppView.PRICING ? 'text-white' : ''}`}>Pricing</button>
          <button onClick={() => handleNavClick(AppView.SHOWCASE)} className={`hover:text-white transition-colors ${currentView === AppView.SHOWCASE ? 'text-white' : ''}`}>Showcase</button>
        </nav>
        <div className="h-6 w-px bg-slate-800"></div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs font-semibold text-white">Free Plan</span>
            <span className="text-[10px] text-slate-400">12/60 mins used</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
            JD
          </div>
        </div>
      </div>
      <button className="md:hidden text-white">
        <Menu className="w-6 h-6" />
      </button>
    </header>
  );

  const renderConfig = () => (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-fade-in">
      <button onClick={() => setCurrentStep(AppStep.UPLOAD)} className="text-slate-500 hover:text-white mb-6 flex items-center gap-1 text-sm">
        ← Back to upload
      </button>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Video Configuration</h2>
            <p className="text-slate-400 text-sm">Customize how AI should process your video.</p>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-sm font-semibold text-slate-300 mb-3 block">Target Format</label>
            <div className="grid grid-cols-3 gap-3">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setConfig({ ...config, aspectRatio: ratio.id })}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    config.aspectRatio === ratio.id
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Layout className={`w-6 h-6 mb-2 ${config.aspectRatio === ratio.id ? 'opacity-100' : 'opacity-50'}`} />
                  <span className="text-xs font-medium">{ratio.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                   <Zap className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="text-sm font-semibold text-white">AI Face Tracking</h4>
                   <p className="text-xs text-slate-500">Keep subjects centered automatically</p>
                 </div>
               </div>
               <button 
                onClick={() => setConfig({...config, faceDetection: !config.faceDetection})}
                className={`w-12 h-6 rounded-full transition-colors relative ${config.faceDetection ? 'bg-purple-600' : 'bg-slate-700'}`}
               >
                 <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${config.faceDetection ? 'translate-x-6' : ''}`} />
               </button>
             </div>

             <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                   <Sparkles className="w-5 h-5" />
                 </div>
                 <div>
                   <h4 className="text-sm font-semibold text-white">Magic Captions</h4>
                   <p className="text-xs text-slate-500">Auto-generate and animate subtitles</p>
                 </div>
               </div>
               <button 
                onClick={() => setConfig({...config, autoCaptions: !config.autoCaptions})}
                className={`w-12 h-6 rounded-full transition-colors relative ${config.autoCaptions ? 'bg-purple-600' : 'bg-slate-700'}`}
               >
                 <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${config.autoCaptions ? 'translate-x-6' : ''}`} />
               </button>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Templates */}
          <div>
            <label className="text-sm font-semibold text-slate-300 mb-3 block">AI Clipping Template</label>
            <div className="space-y-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setConfig({ ...config, template: t.id })}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    config.template === t.id
                      ? 'bg-slate-800 border-purple-500/50 shadow-md'
                      : 'bg-transparent border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    config.template === t.id ? 'border-purple-500' : 'border-slate-600'
                  }`}>
                    {config.template === t.id && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                  </div>
                  <div>
                    <span className={`block text-sm font-medium ${config.template === t.id ? 'text-white' : 'text-slate-300'}`}>{t.name}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{t.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
             <button 
              onClick={startProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
             >
               <Sparkles className="w-5 h-5" />
               Generate Clips with AI
             </button>
             <p className="text-center text-xs text-slate-500 mt-3">
               Estimated time: ~45 seconds
             </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
       <div className="w-full max-w-md space-y-8 text-center">
         <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div 
              className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-2xl font-bold text-white">{Math.round(processingProgress)}%</span>
            </div>
         </div>
         
         <div>
           <h3 className="text-xl font-bold text-white mb-2">{processingStatus}</h3>
           <p className="text-slate-400 text-sm">Please keep this tab open while we work our magic.</p>
         </div>

         <div className="bg-slate-900/50 rounded-xl p-4 text-left border border-slate-800">
            <div className="flex items-center gap-3 mb-2 text-slate-300 text-sm">
               <CircleCheck className="w-4 h-4 text-green-500" />
               <span>Video uploaded successfully</span>
            </div>
            <div className={`flex items-center gap-3 mb-2 text-sm ${processingProgress > 30 ? 'text-slate-300' : 'text-slate-600'}`}>
               {processingProgress > 30 ? <CircleCheck className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
               <span>Audio transcription complete</span>
            </div>
            <div className={`flex items-center gap-3 text-sm ${processingProgress > 70 ? 'text-slate-300' : 'text-slate-600'}`}>
               {processingProgress > 70 ? <CircleCheck className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
               <span>AI Curation & Editing</span>
            </div>
         </div>
       </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto py-8 px-6 animate-fade-in">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
         <div>
           <h2 className="text-3xl font-bold text-white mb-2">Ready to publish 🚀</h2>
           <p className="text-slate-400">AI extracted <span className="text-purple-400 font-bold">{generatedClips.length} viral clips</span> from your video.</p>
         </div>
         <div className="flex gap-3">
           <button 
             onClick={handleRestart}
             className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
           >
             Upload New Video
           </button>
           <button 
             onClick={() => generatedClips.forEach(clip => handleDownload(clip))}
             className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg text-sm hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20"
           >
             Export All (.zip)
           </button>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {generatedClips.map((clip) => (
           <div key={clip.id} className="h-[500px]">
             <ClipCard 
               clip={clip} 
               onPlay={(c) => setSelectedClip(c)}
               onDownload={(c) => handleDownload(c)}
             />
           </div>
         ))}
       </div>

       {/* Engagement Analysis Section */}
       <div className="mt-16 bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Viral Potential Analysis</h3>
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded">POWERED BY GEMINI 2.5</span>
         </div>
         <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
               <p className="text-slate-400 text-sm mb-4">
                 We analyzed the audio waveform and transcript sentiment to identify peaks in user retention.
                 The clips generated correspond to the highest peaks in the graph below.
               </p>
               <EngagementChart 
                 data={[
                   { time: '0:00', engagement: 20 },
                   { time: '0:30', engagement: 45 },
                   { time: '1:00', engagement: 30 },
                   { time: '2:00', engagement: 85 }, // Peak 1
                   { time: '2:30', engagement: 60 },
                   { time: '3:00', engagement: 40 },
                   { time: '5:00', engagement: 90 }, // Peak 2
                   { time: '5:30', engagement: 55 },
                   { time: '6:00', engagement: 35 },
                   { time: '8:30', engagement: 78 }, // Peak 3
                   { time: '9:00', engagement: 40 },
                   { time: '10:00', engagement: 20 },
                 ]}
               />
            </div>
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-white font-semibold text-sm mb-1">Top Performing Topic</h4>
                <p className="text-purple-400 text-lg font-bold">Productivity Systems</p>
                <p className="text-xs text-slate-500 mt-1">Segments mentioning 'systems' had 40% higher retention.</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-white font-semibold text-sm mb-1">Suggested Caption Tone</h4>
                <p className="text-blue-400 text-lg font-bold">Authoritative & Urgent</p>
                <p className="text-xs text-slate-500 mt-1">Using imperative verbs drove higher engagement scores.</p>
              </div>
            </div>
         </div>
       </div>
    </div>
  );

  // Main Render Logic
  const renderContent = () => {
    switch(currentView) {
      case AppView.TEMPLATES: return <TemplatesPage />;
      case AppView.PRICING: return <Pricing />;
      case AppView.SHOWCASE: return <Showcase />;
      default:
        // HOME View Logic
        switch(currentStep) {
          case AppStep.UPLOAD:
            return (
              <div className="max-w-4xl mx-auto px-6 py-12 text-center animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-6">
                  <Sparkles className="w-3 h-3" /> New Gemini 2.5 Model Integrated
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                  Turn long videos into <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Viral Shorts</span> in seconds.
                </h1>
                <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
                  Drop a YouTube link or file. Our AI identifies the hooks, crops for mobile, and adds captions automatically.
                </p>
                
                <UploadZone 
                  onFileSelect={handleFileSelect} 
                  onUrlSubmit={handleUrlSubmit} 
                />

                {/* Social Proof / Trust */}
                <div className="mt-20 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                   <div className="text-center font-bold text-xl text-white">NETFLIX</div>
                   <div className="text-center font-bold text-xl text-white">Spotify</div>
                   <div className="text-center font-bold text-xl text-white">Twitch</div>
                   <div className="text-center font-bold text-xl text-white">YouTube</div>
                </div>
              </div>
            );
          case AppStep.CONFIG: return renderConfig();
          case AppStep.PROCESSING: return renderProcessing();
          case AppStep.DASHBOARD: return renderDashboard();
          default: return null;
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30">
      {renderHeader()}
      
      <main className="pt-24 pb-12">
        {renderContent()}
      </main>

      {/* Video Player Modal */}
      {selectedClip && (
        <VideoModal 
          clip={selectedClip} 
          videoSrc={videoObjectUrl} 
          onClose={() => setSelectedClip(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default App;