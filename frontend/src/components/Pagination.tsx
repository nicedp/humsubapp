import React from 'react'

interface PaginationProps {
  skip: number
  limit: number
  total: number
  onPageChange: (newSkip: number) => void
}

export default function Pagination({ skip, limit, total, onPageChange }: PaginationProps) {
  const currentPage = Math.floor(skip / limit) + 1
  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (totalPages <= 1) return null

  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  // Build page numbers to show: always show first, last, current ± 1, with ellipsis
  const pages: (number | '...')[] = []
  const range = new Set<number>()
  range.add(1)
  range.add(totalPages)
  for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
    range.add(p)
  }
  const sorted = Array.from(range).sort((a, b) => a - b)
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) pages.push('...')
    pages.push(sorted[i])
  }

  const goTo = (page: number) => onPageChange((page - 1) * limit)

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-xs text-gray-500">
        Showing <span className="font-medium">{Math.min(skip + 1, total)}</span>–<span className="font-medium">{Math.min(skip + limit, total)}</span> of <span className="font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={!canPrev}
          className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          ← Prev
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p as number)}
              className={`w-8 h-8 text-xs rounded-lg border font-medium transition-colors ${
                p === currentPage
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={!canNext}
          className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}