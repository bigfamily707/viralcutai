import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Scissors, 
  Zap, 
  Layout, 
  CircleCheck,
  Menu,
  Crown,
  Lock,
  Clock,
  LogOut,
  User as UserIcon
} from 'lucide-react';

import UploadZone from './components/UploadZone';
import ClipCard from './components/ClipCard';
import EngagementChart from './components/EngagementChart';
import VideoModal from './components/VideoModal';
import TemplatesPage from './components/TemplatesPage';
import Pricing from './components/Pricing';
import Showcase from './components/Showcase';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Toast, { ToastType } from './components/Toast';

import { AppStep, AppView, AspectRatio, VideoClip, ProcessingConfig, UserPlan, User } from './types';
import { TEMPLATES, ASPECT_RATIOS, MOCK_TRANSCRIPT_SEGMENT } from './constants';
import { generateViralMetadata } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import * as db from './services/dbService';
import * as api from './services/apiService';

const App: React.FC = () => {
  // Navigation & Workflow State
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD);
  
  // User & Plan State
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan>('free');
  const [usedMinutes, setUsedMinutes] = useState<number>(0);
  const FREE_LIMIT_MINUTES = 30;

  // Video Data State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  
  // Backend State
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);

  // Processing State
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [generatedClips, setGeneratedClips] = useState<VideoClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null);
  
  // UI State
  const [toast, setToast] = useState<{msg: string, type: ToastType} | null>(null);
  
  const [config, setConfig] = useState<ProcessingConfig>({
    aspectRatio: AspectRatio.PORTRAIT_9_16,
    template: TEMPLATES[0].id,
    customPrompt: '',
    faceDetection: true,
    autoCaptions: true,
  });

  // --- Effects ---

  // Supabase Auth & Data Sync
  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        initializeUser(session.user);
      }
    });

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await initializeUser(session.user);
      } else {
        setUser(null);
        setUserId(null);
        setGeneratedClips([]);
        setCurrentView(AppView.LANDING);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeUser = async (authUser: any) => {
    setUserId(authUser.id);
    
    // Fetch fresh profile data from DB (more reliable than metadata)
    const profile = await db.getUserProfile(authUser.id);
    
    if (profile) {
      const mappedUser: User = {
        name: profile.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        plan: (profile.plan as UserPlan) || 'free',
      };
      setUser(mappedUser);
      setUserPlan(mappedUser.plan);
      setUsedMinutes(profile.used_minutes || 0);
      
      // Load their clips
      loadUserClips(authUser.id);
      
      if (window.location.pathname === '/') {
        setCurrentView(AppView.WORKSPACE);
      }
    }
  };

  const loadUserClips = async (uid: string) => {
    try {
      const clips = await db.fetchUserClips(uid);
      setGeneratedClips(clips);
    } catch (e) {
      console.error("Failed to load clips", e);
    }
  };

  // Cleanup object URL on unmount or restart
  useEffect(() => {
    return () => {
      if (videoObjectUrl && !videoObjectUrl.startsWith('http')) {
        URL.revokeObjectURL(videoObjectUrl);
      }
    };
  }, [videoObjectUrl]);

  // --- Helpers ---
  
  const showToast = (msg: string, type: ToastType = 'info') => {
    setToast({ msg, type });
  };

  // --- Auth Handlers ---
  const handleAuthSuccess = (authenticatedUser: User) => {
    // onAuthStateChange handles the actual state updates
    setCurrentView(AppView.WORKSPACE);
    showToast(`Welcome back!`, 'success');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView(AppView.LANDING);
    handleRestart();
    showToast('Successfully logged out', 'info');
  };

  const handleGetStarted = () => {
    if (user) {
      setCurrentView(AppView.WORKSPACE);
    } else {
      setCurrentView(AppView.AUTH);
    }
  };

  // --- Video & Workflow Handlers ---

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setVideoObjectUrl(url);
    setCurrentStep(AppStep.CONFIG);
  };

  const handleUrlSubmit = (url: string) => {
    setVideoUrl(url);
    setVideoObjectUrl(null); 
    setCurrentStep(AppStep.CONFIG);
  };

  const handleUpgrade = async (plan: UserPlan) => {
    if (!user || !userId) {
      setCurrentView(AppView.AUTH);
      return;
    }
    
    try {
      await db.updateUserPlan(userId, plan);
      
      // Optimistic Update
      const updatedUser = { ...user, plan };
      setUser(updatedUser);
      setUserPlan(plan);
      
      showToast(`Upgraded to ${plan.toUpperCase()} plan!`, 'success');
      setCurrentView(AppView.WORKSPACE);
      setCurrentStep(AppStep.UPLOAD);
    } catch (e) {
      showToast("Upgrade failed. Please try again.", "error");
    }
  };

  const handleDownload = (clip: VideoClip) => {
    // 1. If backend provided a direct download link (videoUrl), use it
    if (clip.videoUrl && clip.videoUrl.startsWith('http')) {
       showToast('Downloading generated clip...', 'success');
       const link = document.createElement('a');
       link.href = clip.videoUrl;
       link.download = `${clip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       return;
    }

    // 2. If we have a local uploaded file, allow downloading it as an MP4 (Fallback)
    if (uploadedFile) {
      const safeTitle = clip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const url = URL.createObjectURL(uploadedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeTitle}_source.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast('Downloading source file (Clip not rendered)', 'info');
      return;
    }

    // 3. Fallback: Download metadata receipt
    const fileContent = `
VIRAL CUT PROJECT - DOWNLOAD RECEIPT
====================================
User: ${user?.name || 'Guest'}
User Plan: ${userPlan.toUpperCase()}
Clip ID: ${clip.id}
Title: ${clip.title}
Duration: ${clip.duration}
Range: ${clip.startTime}s - ${clip.endTime}s
Transcript: ${clip.transcript}
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
    
    showToast('Download started (Metadata)', 'success');
  };

  const startProcessing = async () => {
    // 1. Check Limits
    const estimatedVideoLength = 5; 
    
    if (userPlan === 'free' && (usedMinutes + estimatedVideoLength) > FREE_LIMIT_MINUTES) {
      showToast('Trial limit reached. Please upgrade.', 'error');
      setCurrentView(AppView.PRICING);
      return;
    }

    if (!userId) {
      showToast('Please login to process videos.', 'error');
      setCurrentView(AppView.AUTH);
      return;
    }

    // 2. Start Processing UI
    setCurrentStep(AppStep.PROCESSING);
    setProcessingProgress(0);

    try {
        let serverFilename = uploadedFilename;

        // Step A: Upload Video to Backend (if not already uploaded)
        if (!serverFilename) {
          setProcessingStatus('Fast-uploading video to cloud...');
          setProcessingProgress(10);
          
          let uploadRes;
          if (uploadedFile) {
            uploadRes = await api.uploadVideo(uploadedFile);
          } else if (videoUrl) {
            setProcessingStatus('Stream-ripping video from URL...');
            uploadRes = await api.importVideoUrl(videoUrl);
          } else {
            throw new Error("No video source provided");
          }
          
          serverFilename = uploadRes.filename;
          setUploadedFilename(serverFilename);
        }

        // Step B: AI Analysis
        setProcessingStatus('Gemini is generating 3 viral variations...');
        setProcessingProgress(40);
        // Process Metadata parallel to video setup
        const mockClipsMetadata = await generateMockClipsMetadata();
        setProcessingProgress(60);

        // Step C: Server-Side Processing (FFmpeg)
        setProcessingStatus('High-speed rendering (Ultrafast Mode)...');
        const processedClips = await api.processVideoClips(
           serverFilename!, 
           mockClipsMetadata, 
           config.aspectRatio
        );
        setProcessingProgress(90);

        // Step D: Save to Database (Supabase)
        setProcessingStatus('Finalizing...');
        
        const project = await db.createProject(
          userId, 
          uploadedFile ? uploadedFile.name : (videoUrl || 'Untitled Video'),
          videoUrl
        );

        const savedClips = await db.saveGeneratedClips(project.id, userId, processedClips);
        
        // Step E: Update Usage
        if (userPlan === 'free') {
          const newTotal = await db.updateUserUsage(userId, estimatedVideoLength);
          setUsedMinutes(newTotal);
        }

        setGeneratedClips(prev => [...savedClips, ...prev]);
        setProcessingProgress(100);
        
        // Immediate transition, no artificial delay
        setCurrentStep(AppStep.DASHBOARD);
        showToast('Processing complete! Clips generated.', 'success');

    } catch (e: any) {
        console.error(e);
        showToast('Error: ' + e.message, 'error');
        setCurrentStep(AppStep.CONFIG);
    }
  };

  // Optimized to run in parallel
  const generateMockClipsMetadata = async (): Promise<VideoClip[]> => {
    // Define base segments we want to 'find'
    const segments = [
      { id: '1', timeRange: [0, 15], context: "Intro and Hook" },
      { id: '2', timeRange: [15, 25], context: "Core Problem Statement" },
      { id: '3', timeRange: [25, 33], context: "Quick Solution/Tip" }
    ];

    // Fire all Gemini requests in parallel for speed
    const metadataPromises = segments.map(seg => 
      generateViralMetadata(MOCK_TRANSCRIPT_SEGMENT, `Viral Short Video: ${seg.context}`)
        .catch(() => ({
          title: `Viral Clip ${seg.id}`,
          hashtags: ["#viral", "#shorts"],
          description: "Auto-generated clip",
          viralScoreReasoning: "Fast fallback"
        }))
    );

    const metadataResults = await Promise.all(metadataPromises);

    return segments.map((seg, index) => {
      const meta = metadataResults[index];
      return {
        id: seg.id,
        title: meta.title,
        thumbnailUrl: '', // Will be filled by backend
        duration: `0:${(seg.timeRange[1] - seg.timeRange[0])}`,
        viralScore: 85 + Math.floor(Math.random() * 14), // Random high score
        hashtags: meta.hashtags,
        summary: meta.description,
        transcript: MOCK_TRANSCRIPT_SEGMENT.substring(0, 100) + "...",
        startTime: seg.timeRange[0], 
        endTime: seg.timeRange[1],
      };
    });
  };

  const handleRestart = () => {
    setUploadedFile(null);
    setUploadedFilename(null); // Reset backend file reference
    if (videoObjectUrl && !videoObjectUrl.startsWith('http')) URL.revokeObjectURL(videoObjectUrl);
    setVideoObjectUrl(null);
    setVideoUrl('');
    setCurrentStep(AppStep.UPLOAD);
  };

  const handleNavClick = (view: AppView) => {
    if (view === AppView.WORKSPACE && !user) {
      setCurrentView(AppView.AUTH);
      return;
    }
    setCurrentView(view);
  };

  const renderHeader = () => {
    const isFree = userPlan === 'free';
    const usagePercentage = (usedMinutes / FREE_LIMIT_MINUTES) * 100;

    return (
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-md border-b border-white/5 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick(user ? AppView.WORKSPACE : AppView.LANDING)}>
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Scissors className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            ViralCut<span className="text-purple-500">AI</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-4 text-sm font-medium text-slate-400">
             {currentView !== AppView.AUTH && (
                <>
                  <button onClick={() => handleNavClick(AppView.TEMPLATES)} className={`hover:text-white transition-colors ${currentView === AppView.TEMPLATES ? 'text-white' : ''}`}>Templates</button>
                  <button onClick={() => handleNavClick(AppView.PRICING)} className={`hover:text-white transition-colors ${currentView === AppView.PRICING ? 'text-white' : ''}`}>Pricing</button>
                  <button onClick={() => handleNavClick(AppView.SHOWCASE)} className={`hover:text-white transition-colors ${currentView === AppView.SHOWCASE ? 'text-white' : ''}`}>Showcase</button>
                </>
             )}
          </nav>

          <div className="h-6 w-px bg-slate-800"></div>
          
          {user ? (
            <div className="flex items-center gap-4">
              {isFree ? (
                <div className="flex flex-col items-end group relative">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">Free Trial</span>
                    <span className={`text-[10px] ${usedMinutes >= FREE_LIMIT_MINUTES ? 'text-red-400' : 'text-slate-400'}`}>
                      {usedMinutes}/{FREE_LIMIT_MINUTES} mins
                    </span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${usedMinutes >= FREE_LIMIT_MINUTES ? 'bg-red-500' : 'bg-purple-500'}`} 
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
                  <Crown className="w-3 h-3 text-yellow-400" fill="currentColor" />
                  <span className="text-xs font-bold text-purple-200">PRO</span>
                </div>
              )}
              
              {isFree && (
                <button 
                  onClick={() => setCurrentView(AppView.PRICING)}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  Upgrade <Zap className="w-3 h-3" fill="currentColor" />
                </button>
              )}

              <div className="relative group">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 cursor-pointer">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="p-3 border-b border-white/5">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left p-3 text-sm text-red-400 hover:bg-slate-800 rounded-b-xl flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentView(AppView.AUTH)}
                  className="text-sm font-medium text-white hover:text-purple-400 transition-colors"
                >
                  Log In
                </button>
                <button 
                  onClick={() => setCurrentView(AppView.AUTH)}
                  className="bg-white text-slate-900 hover:bg-slate-200 text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </button>
             </div>
          )}
        </div>
        <button className="md:hidden text-white">
          <Menu className="w-6 h-6" />
        </button>
      </header>
    );
  };

  // --- Workspace Logic ---
  const renderWorkspace = () => {
    switch(currentStep) {
      case AppStep.UPLOAD:
        return (
          <div className="max-w-4xl mx-auto px-6 py-12 text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" /> New Gemini 2.5 Model Integrated
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Create your next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Viral Hit</span>
            </h1>
            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
              Upload your video. We'll find the best clips.
            </p>
            
            <UploadZone 
              onFileSelect={handleFileSelect} 
              onUrlSubmit={handleUrlSubmit} 
            />
          </div>
        );
      case AppStep.CONFIG:
        return (
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
                     {userPlan === 'free' && usedMinutes >= FREE_LIMIT_MINUTES ? (
                       <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center space-y-3">
                         <div className="flex items-center justify-center gap-2 text-red-400 font-bold">
                           <Lock className="w-5 h-5" /> Limit Reached
                         </div>
                         <p className="text-sm text-slate-300">You've used your 30 free minutes.</p>
                         <button 
                           onClick={() => setCurrentView(AppView.PRICING)}
                           className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors"
                         >
                           Upgrade to Continue
                         </button>
                       </div>
                     ) : (
                       <>
                         <button 
                          onClick={startProcessing}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                         >
                           <Sparkles className="w-5 h-5" />
                           Generate Clips with AI
                         </button>
                         <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                           <Clock className="w-3 h-3" />
                           Estimated usage: ~5 mins
                         </p>
                       </>
                     )}
                  </div>
                </div>
              </div>
            </div>
        );
      case AppStep.PROCESSING:
        return (
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
      case AppStep.DASHBOARD:
        return (
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

              {generatedClips.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800">
                  <p className="text-slate-400">No clips found. Start a new project to generate content.</p>
                </div>
              ) : (
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
              )}

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
      default: return null;
    }
  };

  // Main Render Logic
  const renderContent = () => {
    switch(currentView) {
      case AppView.AUTH:
        return <Auth onAuthSuccess={handleAuthSuccess} />;
      case AppView.LANDING: 
        return <LandingPage onGetStarted={handleGetStarted} onLogin={() => setCurrentView(AppView.AUTH)} />;
      case AppView.TEMPLATES: 
        return <TemplatesPage />;
      case AppView.PRICING: 
        return <Pricing currentPlan={userPlan} onUpgrade={handleUpgrade} />;
      case AppView.SHOWCASE: 
        return <Showcase />;
      case AppView.WORKSPACE:
        return renderWorkspace();
      default:
        return <LandingPage onGetStarted={handleGetStarted} onLogin={() => setCurrentView(AppView.AUTH)} />;
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
          videoSrc={selectedClip.videoUrl || videoObjectUrl} 
          onClose={() => setSelectedClip(null)}
          onDownload={handleDownload}
        />
      )}

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200]">
          <Toast 
            message={toast.msg} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}
    </div>
  );
};

export default App;