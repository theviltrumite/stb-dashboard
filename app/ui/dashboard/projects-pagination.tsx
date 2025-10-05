'use client';

import { Button } from '@/components/ui/button';

type Props = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export default function ProjectsPagination({ currentPage, totalPages, onPageChange }: Props) {
    const canPrev = currentPage > 1;
    const canNext = currentPage < totalPages;

    return (
        <div className="flex justify-center items-center mt-4 space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canPrev}
            >
                ← Önceki
            </Button>
            <span className="text-sm">
                Sayfa {currentPage} / {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!canNext}
            >
                Sonraki →
            </Button>
        </div>
    );
}
