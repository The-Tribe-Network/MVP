'use client';

import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemUI,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbItemData {
  label: string;
  href?: string;
}

interface SubpageHeaderProps {
  tribeId: string;
  /** Breadcrumb trail after "Dashboard". Last item is shown as current page. */
  breadcrumbs: BreadcrumbItemData[];
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional action buttons to display on the right */
  actions?: React.ReactNode;
  /** Optional className for the container */
  className?: string;
}

export function SubpageHeader({
  tribeId,
  breadcrumbs,
  title,
  subtitle,
  actions,
  className,
}: SubpageHeaderProps) {
  return (
    <div className={className}>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItemUI>
            <BreadcrumbLink asChild>
              <Link href={`/tribe/${tribeId}`}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItemUI>

          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <span key={item.label} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItemUI>
                  {isLast || !item.href ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItemUI>
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
