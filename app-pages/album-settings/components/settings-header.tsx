'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { albumDetailOptions } from '@/lib/query-options/albums';

interface AlbumSettingsHeaderProps {
  tribeId: string;
  albumId: string;
}

const settingsLabels: Record<string, string> = {
  details: 'Details',
  photos: 'Photos',
  cover: 'Cover Image',
  'danger-zone': 'Danger Zone',
};

export function AlbumSettingsHeader({ tribeId, albumId }: AlbumSettingsHeaderProps) {
  const pathname = usePathname();
  const { data: album } = useQuery(albumDetailOptions(tribeId, albumId));

  // Extract current settings section from pathname
  const basePath = `/tribe/${tribeId}/media/album/${albumId}/settings`;
  const currentSection = pathname?.replace(`${basePath}/`, '').split('/')[0] || '';
  const sectionLabel = settingsLabels[currentSection] || 'Settings';
  const albumName = album?.name || 'Album';

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
            <BreadcrumbLink asChild>
              <Link href={`/tribe/${tribeId}/media`}>Media</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/tribe/${tribeId}/media/album/${albumId}`}>
                {albumName}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {currentSection ? (
              <BreadcrumbLink asChild>
                <Link href={basePath}>Settings</Link>
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

      <h1 className="text-3xl font-bold">Album Settings</h1>
      <p className="text-muted-foreground mt-1">
        Manage your album's configuration and content
      </p>
    </div>
  );
}
