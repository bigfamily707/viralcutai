import React from 'react';
import { TEMPLATES } from '../constants';
import { Video, Zap, MessageSquare, ShoppingBag, Smile } from 'lucide-react';

const TemplatesPage: React.FC = () => {
  const getIcon = (id: string) => {
    switch(id) {
      case 'viral_hook': return <Zap className="w-6 h-6 text-yellow-400" />;
      case 'testimonial': return <MessageSquare className="w-6 h-6 text-blue-400" />;
      case 'product': return <ShoppingBag className="w-6 h-6 text-green-400" />;
      case 'humor': return <Smile className="w-6 h-6 text-pink-400" />;
      default: return <Video className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">AI-Powered Templates</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Choose from our pre-trained models designed to maximize engagement for specific types of content.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((template) => (
          <div key={template.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
              {getIcon(template.id)}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
            <p className="text-slate-400 text-sm mb-6">{template.description}</p>
            
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Best For</div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs">Instagram Reels</span>
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs">TikTok</span>
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs">Shorts</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;