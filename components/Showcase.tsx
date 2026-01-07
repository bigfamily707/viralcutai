import React from 'react';
import { Play } from 'lucide-react';

const Showcase: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">Made with ViralCut AI</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          See how top creators are using our AI to 10x their content output.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[1, 2, 3, 4].map((i) => (
            <div key={i} className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 cursor-pointer">
              <img 
                src={`https://picsum.photos/400/700?random=${i + 10}`} 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-white ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                   <span className="text-xs font-bold text-white">Creator {i}</span>
                 </div>
                 <p className="text-xs text-slate-300 line-clamp-2">Using the Viral Hook template to grow from 0 to 100k.</p>
              </div>
            </div>
         ))}
      </div>

      <div className="mt-20 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/20 rounded-3xl p-12 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Ready to go viral?</h3>
        <p className="text-slate-300 mb-8 max-w-xl mx-auto">Join 50,000+ creators saving hours every week.</p>
        <button className="px-8 py-4 bg-white text-purple-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
          Create Your First Clip Now
        </button>
      </div>
    </div>
  );
};

export default Showcase;