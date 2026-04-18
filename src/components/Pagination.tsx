import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  isLimited: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export default function Pagination({ page, totalPages, isLimited, onNext, onPrev }: PaginationProps) {
  return (
    <div className="mt-12 flex justify-center items-center gap-4">
      <Button variant="outline" onClick={onPrev} disabled={page <= 1}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      <span className="text-sm font-medium">Page {page} of {totalPages}</span>
      <Button variant="outline" onClick={onNext} disabled={page >= totalPages && !isLimited}>
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
