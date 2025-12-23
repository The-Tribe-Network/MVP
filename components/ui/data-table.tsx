'use client';

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filterComponent?: React.ReactNode;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  onSearch,
  filterComponent,
  pagination,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
    manualPagination: !!pagination,
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        {onSearch && (
          <Input
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
            className="max-w-sm"
          />
        )}
        {filterComponent}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing{' '}
            {pagination.pageSize * (pagination.pageIndex - 1) + 1} to{' '}
            {Math.min(
              pagination.pageSize * pagination.pageIndex,
              pagination.total
            )}{' '}
            of {pagination.total} members
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
              disabled={pagination.pageIndex === 1}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {pagination.pageIndex} of{' '}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
              disabled={
                pagination.pageIndex * pagination.pageSize >= pagination.total
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
