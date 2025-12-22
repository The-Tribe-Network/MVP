import { Sparkles, Users, TrendingUp, Gamepad2, Home, Briefcase } from 'lucide-react';
import type { Category } from './types';

/**
 * Available categories for filtering tribes
 */
export const DISCOVER_CATEGORIES: Category[] = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'social', label: 'Social', icon: Users },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'family', label: 'Family', icon: Home },
  { id: 'work', label: 'Work', icon: Briefcase },
  { id: 'hobbies', label: 'Hobbies', icon: TrendingUp },
];

/**
 * Default filter values
 */
export const DEFAULT_FILTERS = {
  search: '',
  category: 'all',
} as const;

