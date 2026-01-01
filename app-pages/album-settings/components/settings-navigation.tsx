'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FileText, Image, ImageIcon, AlertTriangle } from 'lucide-react';

interface AlbumSettingsNavigationProps {
  tribeId: string;
  albumId: string;
}

interface NavItem {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
}

const navItems: NavItem[] = [
  {
    id: 'details',
    label: 'Details',
    description: 'Edit album info',
    href: 'details',
    icon: FileText,
  },
  {
    id: 'photos',
    label: 'Photos',
    description: 'Add or remove photos',
    href: 'photos',
    icon: Image,
  },
  {
    id: 'cover',
    label: 'Cover Image',
    description: 'Change cover photo',
    href: 'cover',
    icon: ImageIcon,
  },
  {
    id: 'danger-zone',
    label: 'Danger Zone',
    description: 'Delete album',
    href: 'danger-zone',
    icon: AlertTriangle,
    variant: 'destructive',
  },
];

export function AlbumSettingsNavigation({
  tribeId,
  albumId,
}: AlbumSettingsNavigationProps) {
  const pathname = usePathname();
  const basePath = `/tribe/${tribeId}/media/album/${albumId}/settings`;

  return (
    <nav className="w-64 space-y-1">
      {navItems.map((item) => {
        const href = `${basePath}/${item.href}`;
        const isActive = pathname === href || pathname?.startsWith(`${href}/`);
        const Icon = item.icon;
        const isDestructive = item.variant === 'destructive';

        return (
          <Link
            key={item.id}
            href={href}
            className={cn(
              'flex items-start gap-3 px-3 py-3 rounded-lg transition-colors',
              isActive
                ? isDestructive
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary'
                : isDestructive
                  ? 'text-destructive/70 hover:bg-destructive/5 hover:text-destructive'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <span className="block text-sm font-medium">{item.label}</span>
              <span
                className={cn(
                  'block text-xs truncate',
                  isActive ? 'opacity-80' : 'text-muted-foreground'
                )}
              >
                {item.description}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
