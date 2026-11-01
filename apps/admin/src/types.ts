import type { Permission } from '@sparkoders/contracts';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: Permission;
  /** Shown greyed out with a "soon" badge: planned for the next phases. */
  soon?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}
