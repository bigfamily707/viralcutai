import React, { useState } from 'react';
import { Check, Star, Zap } from 'lucide-react';
import { BillingCycle, UserPlan } from '../types';

interface PricingProps {
  currentPlan: UserPlan;
  onUpgrade: (plan: UserPlan) => void;
}

const Pricing: React.FC<PricingProps> = ({ currentPlan, onUpgrade }) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');

  const plans = [
    {
      id: 'free',
      name: 'Trial',
      price: 0,
      description: 'Test the waters.',
      features: [
        '30 minutes total processing time',
        '720p Export Quality',
        'Auto-Captions',
        'Standard Templates'
      ],
      buttonText: currentPlan === 'free' ? 'Current Plan' : 'Downgrade',
      highlight: false
    },
    {
      id: 'pro',
      name: 'Creator Pro',
      price: billingCycle === 'annual' ? 16 : 19,
      period: '/mo',
      billingText: billingCycle === 'annual' ? 'Billed $192 annually' : 'Billed monthly',
      description: 'For serious creators.',
      features: [
        'Unlimited Uploads',
        '4K Export Quality',
        'No Watermarks',
        'Custom Brand Fonts',
        'Bulk Processing',
        'Priority Support'
      ],
      buttonText: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      highlight: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
        <p className="text-slate-400 mb-8">Start with 30 minutes free. Upgrade to remove limits.</p>
        
        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(prev => prev === 'annual' ? 'monthly' : 'annual')}
            className="w-14 h-8 bg-slate-800 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <div className={`absolute top-1 left-1 w-6 h-6 bg-purple-500 rounded-full transition-transform duration-300 ${billingCycle === 'annual' ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-white' : 'text-slate-500'}`}>
            Yearly <span className="text-green-400 text-xs ml-1 font-bold">(Save 15%)</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative rounded-2xl p-8 transition-all duration-300 ${
              plan.highlight 
                ? 'bg-slate-900 border-2 border-purple-600 shadow-2xl shadow-purple-900/20 transform md:-translate-y-4' 
                : 'bg-slate-900/50 border border-slate-800'
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> POPULAR
              </div>
            )}
            
            <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
            <div className="flex items-end gap-1 mb-1">
              <div className="text-4xl font-bold text-white">${plan.price}</div>
              {plan.price > 0 && <span className="text-lg text-slate-500 font-normal mb-1">{plan.period}</span>}
            </div>
            {plan.price > 0 && <div className="text-xs text-slate-500 mb-6">{plan.billingText}</div>}
            {!plan.price && <div className="text-xs text-slate-500 mb-6 opacity-0">Spacer</div>}
            
            <p className="text-slate-400 text-sm mb-8">{plan.description}</p>
            
            <button 
              onClick={() => plan.id !== currentPlan && onUpgrade(plan.id as UserPlan)}
              disabled={plan.id === currentPlan}
              className={`w-full py-3 rounded-xl font-bold transition-colors mb-8 ${
                plan.highlight 
                  ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20' 
                  : 'border border-slate-700 text-white hover:bg-slate-800'
              } ${plan.id === currentPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {plan.buttonText}
            </button>
            
            <ul className="space-y-4">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className={`w-4 h-4 ${plan.highlight ? 'text-green-400' : 'text-purple-500'}`} /> 
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center max-w-2xl mx-auto bg-slate-900/30 p-8 rounded-2xl border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-2">Enterprise / Agency?</h3>
        <p className="text-slate-400 text-sm mb-4">
          Need API access, SSO, or unlimited seats? We have custom packages starting at $99/mo.
        </p>
        <button className="text-purple-400 font-semibold text-sm hover:text-purple-300 flex items-center justify-center gap-1 mx-auto">
          Contact Sales <Zap className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pricing;