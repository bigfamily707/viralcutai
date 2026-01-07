import { AspectRatio } from './types';

export const TEMPLATES = [
  { id: 'viral_hook', name: 'Viral Reel Cutter', description: 'Focuses on high-energy hooks and fast cuts.' },
  { id: 'testimonial', name: 'Testimonial Highlight', description: 'Extracts positive user feedback and emotional moments.' },
  { id: 'tutorial', name: 'Tutorial Summary', description: 'Condenses instructional content into step-by-step shorts.' },
  { id: 'product', name: 'Product Teaser', description: 'Highlights features and benefits for sales.' },
  { id: 'humor', name: 'Funny Moments', description: 'Finds jokes, laughter, and lighthearted segments.' },
];

export const ASPECT_RATIOS = [
  { id: AspectRatio.PORTRAIT_9_16, label: '9:16 (Reels/TikTok)', icon: 'smartphone' },
  { id: AspectRatio.SQUARE_1_1, label: '1:1 (Post)', icon: 'square' },
  { id: AspectRatio.LANDSCAPE_16_9, label: '16:9 (YouTube)', icon: 'monitor' },
];

export const MOCK_TRANSCRIPT_SEGMENT = `
In today's video, I'm going to show you the absolute secret to productivity that nobody talks about. 
It's not about waking up at 5 AM. It's not about cold showers. 
It's about the energy management system. 
When you align your tasks with your biological peak hours, everything changes. 
I tried this for 30 days and my output tripled. Tripled!
So step one is identifying your chronotype. Are you a bear, a wolf, or a lion?
`;