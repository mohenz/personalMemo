export interface Group {
  id: string;
  name: string;
  icon?: string; // name of lucide icon
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  groupId: string; // "all", "work", "personal", "travel", "trash", "favorites"
  createdAt: string; // e.g. "2023년 10월 15일 오후 2:30"
  updatedAt: string; // e.g. "2023년 10월 15일 오후 2:30"
  dateString: string; // e.g. "2026-07-15" to align with calendar
  isFavorite: boolean;
  isDeleted: boolean;
  images: string[]; // List of hotlinked image URLs
  checklist: ChecklistItem[];
}

export type ScreenType = 'SPLASH' | 'DASHBOARD' | 'EDITOR' | 'SEARCH' | 'CALENDAR' | 'ARCHIVE';
