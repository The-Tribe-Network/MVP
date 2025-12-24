'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface SettingsHeaderProps {
  tribeId: string;
}

const settingsLabels: Record<string, string> = {
  general: 'General',
  members: 'Members',
  roles: 'Roles',
  permissions: 'Permissions',
  timeline: 'Timeline',
  media: 'Media',
  events: 'Events',
  invitations: 'Invitations',
  moderation: 'Moderation',
  activity: 'Activity',
};

export function SettingsHeader({ tribeId }: SettingsHeaderProps) {
  const pathname = usePathname();

  // Extract current settings section from pathname
  // e.g., /tribe/123/settings/general -> general
  const basePath = `/tribe/${tribeId}/settings`;
  const currentSection = pathname?.replace(`${basePath}/`, '').split('/')[0] || '';
  const sectionLabel = settingsLabels[currentSection] || 'Settings';

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/tribe/${tribeId}`}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {currentSection ? (
              <BreadcrumbLink asChild>
                <Link href={`/tribe/${tribeId}/settings`}>Settings</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Settings</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {currentSection && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold">Tribe Settings</h1>
      <p className="text-muted-foreground mt-1">
        Manage your tribe's configuration and preferences
      </p>
    </div>
  );
}
