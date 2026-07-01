import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { useThemeTokens } from "../theme/useThemeTokens";
import SearchableSelect from "./SearchableSelect";

const PAGE_SIZES = [10, 20, 50];

export function usePagination<T>(items: T[], resetKey = "", initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [resetKey, pageSize]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    pageSize,
    totalPages,
    paginatedItems,
    setPage,
    setPageSize,
  };
}

export default function PaginationControls({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZES,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}) {
  const t = useThemeTokens();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);

  return (
    <div className={clsx("mt-4 flex flex-col gap-3 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between", t.border)}>
      <div className={clsx("flex flex-wrap items-center gap-3", t.textSecondary)}>
        <span>
          {start}-{end} sur {totalItems}
        </span>
        <label className="flex items-center gap-2">
          <span>Afficher</span>
          <SearchableSelect
            selectId="pagination-page-size"
            variant="filter"
            panelLabel="Afficher"
            value={String(pageSize)}
            onChange={(value) => onPageSizeChange(Number(value))}
            searchable={false}
            options={pageSizeOptions.map((size) => ({
              value: String(size),
              label: String(size),
            }))}
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className={clsx("rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50", t.btnSecondary)}
        >
          Précédent
        </button>
        <span className={clsx("min-w-20 text-center text-xs", t.textSecondary)}>
          Page {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className={clsx("rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50", t.btnSecondary)}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
