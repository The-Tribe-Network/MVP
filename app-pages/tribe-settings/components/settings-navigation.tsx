'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Settings,
  Users,
  Shield,
  Key,
  MessageSquare,
  Image,
  Calendar,
  Mail,
  ShieldCheck,
  Activity,
} from 'lucide-react';

interface SettingsNavigationProps {
  tribeId: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'General', href: 'general', icon: Settings },
  { label: 'Members', href: 'members', icon: Users },
  { label: 'Roles', href: 'roles', icon: Shield },
  { label: 'Permissions', href: 'permissions', icon: Key },
  { label: 'Timeline', href: 'timeline', icon: MessageSquare },
  { label: 'Media', href: 'media', icon: Image },
  { label: 'Events', href: 'events', icon: Calendar },
  { label: 'Invitations', href: 'invitations', icon: Mail },
  { label: 'Moderation', href: 'moderation', icon: ShieldCheck },
  { label: 'Activity', href: 'activity', icon: Activity },
];

export function SettingsNavigation({ tribeId }: SettingsNavigationProps) {
  const pathname = usePathname();
  const basePath = `/tribe/${tribeId}/settings`;

  return (
    <nav className="w-64 space-y-1">
      {navItems.map((item) => {
        const href = `${basePath}/${item.href}`;
        const isActive = pathname === href || pathname?.startsWith(`${href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

