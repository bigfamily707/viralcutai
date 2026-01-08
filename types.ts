export enum AppStep {
  UPLOAD = 'UPLOAD',
  CONFIG = 'CONFIG',
  PROCESSING = 'PROCESSING',
  DASHBOARD = 'DASHBOARD'
}

export enum AppView {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  WORKSPACE = 'WORKSPACE',
  TEMPLATES = 'TEMPLATES',
  PRICING = 'PRICING',
  SHOWCASE = 'SHOWCASE'
}

export enum AspectRatio {
  PORTRAIT_9_16 = '9:16',
  SQUARE_1_1 = '1:1',
  LANDSCAPE_16_9 = '16:9'
}

export type UserPlan = 'free' | 'pro' | 'agency';
export type BillingCycle = 'monthly' | 'annual';

export interface User {
  name: string;
  email: string;
  plan: UserPlan;
}

export interface VideoClip {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  viralScore: number;
  hashtags: string[];
  summary: string;
  transcript: string;
  startTime: number;
  endTime: number;
  videoUrl?: string;
}

export interface ProcessingConfig {
  aspectRatio: AspectRatio;
  template: string;
  customPrompt: string;
  faceDetection: boolean;
  autoCaptions: boolean;
}

export interface MockChartData {
  time: string;
  engagement: number;
}