import React from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Generic admin table shell: search box + table + pagination.
 * `columns` = [{ key, label, render?(row) }]
 */
export default function DataTable({
  columns,
  rows,
  loading,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = 'No records found.',
  headerActions,
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-border">
        {onSearchChange ? (
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="input pl-9"
            />
          </div>
        ) : <div />}
        {headerActions}
      </div>

      <div className="overflow-x-auto">
        <table className="table-shell">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} className="text-center text-muted py-10">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center text-muted py-10">{emptyMessage}</td></tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row._id || row.id || i}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:border-accent hover:text-accent transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:border-accent hover:text-accent transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
