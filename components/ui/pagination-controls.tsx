import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getPageUrl, getPageNumbers } from '@/lib/pagination';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  baseUrl: string;
  preserveParams?: string;
}

export function PaginationControls({
  page,
  totalPages,
  baseUrl,
  preserveParams,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={page > 1 ? getPageUrl(baseUrl, page - 1, preserveParams) : undefined}
            className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
          />
        </PaginationItem>
        {getPageNumbers(page, totalPages).map((pageNum, i) =>
          pageNum === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href={getPageUrl(baseUrl, pageNum, preserveParams)}
                isActive={pageNum === page}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href={page < totalPages ? getPageUrl(baseUrl, page + 1, preserveParams) : undefined}
            className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
