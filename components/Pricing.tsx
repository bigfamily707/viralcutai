import React from 'react';
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
        <p className="text-slate-400">Start for free, upgrade when you go viral.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative">
          <h3 className="text-xl font-semibold text-white mb-2">Creator</h3>
          <div className="text-4xl font-bold text-white mb-6">$0<span className="text-lg text-slate-500 font-normal">/mo</span></div>
          <p className="text-slate-400 text-sm mb-8">Perfect for testing the waters and creating your first few viral clips.</p>
          <button className="w-full py-3 rounded-xl border border-slate-700 text-white font-semibold hover:bg-slate-800 transition-colors mb-8">
            Get Started
          </button>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-purple-500" /> 60 upload mins/month</li>
            <li className="flex items-center gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-purple-500" /> 720p Export Quality</li>
            <li className="flex items-center gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-purple-500" /> Auto-Captions</li>
            <li className="flex items-center gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-purple-500" /> Standard Templates</li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="bg-slate-900 border-2 border-purple-600 rounded-2xl p-8 relative transform md:-translate-y-4">
          <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">POPULAR</div>
          <h3 className="text-xl font-semibold text-white mb-2">Influencer</h3>
          <div className="text-4xl font-bold text-white mb-6">$29<span className="text-lg text-slate-500 font-normal">/mo</span></div>
          <p className="text-slate-400 text-sm mb-8">For serious creators who post daily content.</p>
          <button className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors mb-8 shadow-lg shadow-purple-900/20">
            Start Free Trial
          </button>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm text-white"><Check className="w-4 h-4 text-green-400" /> 300 upload mins/month</li>
            <li className="flex items-center gap-3 text-sm text-white"><Check className="w-4 h-4 text-green-400" /> 4K Export Quality</li>
            <li className="flex items-center gap-3 text-sm text-white"><Check className="w-4 h-4 text-green-400" /> No Watermarks</li>
            <li className="flex items-center gap-3 text-sm text-white"><Check className="w-4 h-4 text-green-400" /> Custom Brand Fonts</li>
            <li className="flex items-center gap-3 text-sm text-white"><Check className="w-4 h-4 text-green-400" /> Bulk Processing</li>
          </ul>
        </div>

        {/* Agency Plan */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-white mb-2">Agency</h3>
          <div className="text-4xl font-bold text-white mb-6">$99<span className="text-lg text-slate-500 font-normal">/mo</span></div>
          <p className="text-slate-400 text-sm mb-8">Volume processing for teams and multiple accounts.</p>
          <button className="w-full py-3 rounded-xl border border-slate-700 text-white font-semibold hover:bg-slate-800 transition-colors mb-8">
            Contact Sales
          </button>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-purple-500" /> Unlimited uploads</li>
            <li className="flex items-center gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-purple-500" /> API Access</li>
            <li className="flex items-center gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-purple-500" /> Team Collaboration</li>
            <li className="flex items-center gap-3 text-sm text-slate-300"><Check className="w-4 h-4 text-purple-500" /> Dedicated Account Manager</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Pricing;