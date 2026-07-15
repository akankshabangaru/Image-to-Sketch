export type SketchStyle = 'pencil' | 'colored' | 'charcoal' | 'cartoon';

export interface SketchSettings {
  intensity: number;
  contrast: number;
  brightness: number;
  edgeSharpness: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'business';
  avatarUrl: string | null;
  authProvider: 'local' | 'google';
  storageUsedBytes: number;
  createdAt: string;
}

export interface SketchImage {
  _id: string;
  user: string;
  originalUrl: string;
  originalFileName: string;
  originalSizeBytes: number;
  resultUrl: string | null;
  style: SketchStyle;
  settings: SketchSettings;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  isFavorite: boolean;
  processingTimeMs?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageStats {
  totalImages: number;
  completedImages: number;
  favoriteImages: number;
  storageUsedBytes: number;
  storageLimitBytes: number;
}

export interface AdminStats {
  totalUsers: number;
  totalImages: number;
  completedImages: number;
  failedImages: number;
  imagesToday: number;
  imagesThisMonth: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  mostUsedStyle: string | null;
  styleBreakdown: { _id: string; count: number }[];
  dailyTrend: { _id: string; count: number }[];
}
