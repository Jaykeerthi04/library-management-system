import { useState, useMemo } from "react";

export function usePagination<T>(items: T[], defaultPageSize = 5) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safeePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(
    () => items.slice((safeePage - 1) * pageSize, safeePage * pageSize),
    [items, safeePage, pageSize]
  );

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return {
    page: safeePage,
    pageSize,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    setPage,
    setPageSize: changePageSize,
  };
}
