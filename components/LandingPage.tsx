import React from 'react';
import { Play, CheckCircle, Zap, TrendingUp, Scissors, Smartphone, ArrowRight, Shield } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="w-full animate-fade-in">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-purple-300 text-xs font-semibold mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            New: AI Face Tracking 2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Turn Long Videos into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">Viral Shorts</span> Instantly
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop spending hours editing. Our AI automatically identifies hooks, crops for vertical, adds captions, and gives you a virality score.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-purple-900/30 hover:scale-105 flex items-center gap-2"
            >
              Start Creating for Free <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                const demoSection = document.getElementById('demo-video');
                demoSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-lg transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" /> Watch Demo
            </button>
          </div>

          {/* Social Proof */}
          <div className="border-t border-white/5 pt-10">
            <p className="text-sm text-slate-500 mb-6 uppercase tracking-widest font-semibold">Trusted by 10,000+ Creators from</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-40">
               {/* Mock Logos */}
               <div className="font-bold text-xl text-white">YOUTUBE</div>
               <div className="font-bold text-xl text-white">TIKTOK</div>
               <div className="font-bold text-xl text-white">INSTAGRAM</div>
               <div className="font-bold text-xl text-white">TWITCH</div>
               <div className="font-bold text-xl text-white">SPOTIFY</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why ViralCut AI?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We don't just crop videos. We analyze the content to find the moments that will actually perform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center mb-6 text-purple-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Virality Score</h3>
              <p className="text-slate-400">Our model predicts which parts of your video have the highest retention potential before you even post.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-6 text-blue-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Cropping</h3>
              <p className="text-slate-400">Active speaker detection ensures the subject is always in frame, even in multi-person podcasts.</p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center mb-6 text-green-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Auto-Captions</h3>
              <p className="text-slate-400">Generate 99% accurate subtitles with trendy animations used by top creators like Alex Hormozi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 max-w-7xl mx-auto px-6">
         <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">From YouTube to TikTok in 3 clicks.</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shrink-0">1</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Paste your link</h3>
                    <p className="text-slate-400">Simply copy a link from YouTube, Twitch, or upload a file. We handle files up to 2 hours long.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shrink-0">2</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">AI Magic happens</h3>
                    <p className="text-slate-400">Our engine transcribes, analyzes sentiment, finds hooks, and reframes the video vertically.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shrink-0">3</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Export & Go Viral</h3>
                    <p className="text-slate-400">Get 10+ clips ready to post. Download them all or edit subtitles in our built-in editor.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div id="demo-video" className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl aspect-video flex items-center justify-center">
                 <div className="text-center">
                    <Scissors className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Interactive Demo Interface</p>
                 </div>
                 {/* Decorative UI elements */}
                 <div className="absolute top-4 left-4 right-4 flex gap-2">
                    <div className="w-20 h-2 bg-slate-800 rounded"></div>
                    <div className="w-full h-2 bg-slate-800 rounded"></div>
                 </div>
                 <div className="absolute bottom-4 left-4 right-4 h-12 bg-slate-800 rounded flex items-center px-4 gap-4">
                    <div className="w-8 h-8 rounded bg-slate-700"></div>
                    <div className="w-full h-2 bg-slate-700 rounded"></div>
                 </div>
              </div>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-b from-purple-900/50 to-slate-900 border border-purple-500/20 rounded-3xl p-12 md:p-20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none"></div>
             
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">Stop wasting time editing.</h2>
             <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto relative z-10">
               Join thousands of creators who are scaling their content output without hiring an expensive team.
             </p>
             
             <button 
               onClick={onGetStarted}
               className="px-10 py-5 bg-white text-purple-900 font-bold rounded-xl text-lg hover:bg-slate-100 transition-colors relative z-10"
             >
               Get Started for Free
             </button>
             
             <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400 relative z-10">
               <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-400" /> No credit card required</span>
               <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-purple-400" /> Secure processing</span>
             </div>
          </div>
        </div>
      </section>
      
      {/* Simple Footer */}
      <footer className="border-t border-white/5 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-purple-500">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white">ViralCut AI</span>
           </div>
           <div className="text-slate-500 text-sm">
             © 2024 ViralCut AI. All rights reserved.
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;