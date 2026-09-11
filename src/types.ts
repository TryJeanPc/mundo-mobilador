export interface Author {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
}

export interface ModApk {
  id: string;
  name: string;
  author: string;
  project: string;
  version: string;
  description: string;
  category: string;
  imageUrl?: string;
  downloadLink?: string;
  uploadDate: string;
  size: string;
  downloads: number;
}

export const CATEGORIES = [
  'Panda Mouse',
  'GG Mouse',
  'SSkey',
  'Otros'
] as const;

export interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: number;
  taggedModId?: string;
  taggedModName?: string;
  userId?: string;
  userAvatar?: string;
}
