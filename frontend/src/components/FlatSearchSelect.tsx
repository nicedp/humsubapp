import React, { useState, useRef, useEffect, useCallback } from 'react'

export interface FlatOption {
  id: string
  flatNumber: string
  blockName?: string | null
  floor?: number | null
  type?: string | null
}

interface Props {
  options: FlatOption[]
  value: string          // selected flatId
  onChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  /** Extra CSS classes applied to the trigger button */
  className?: string
  /** Used in table-cell context — smaller padding, no ring on trigger */
  compact?: boolean
}

function buildLabel(f: FlatOption): string {
  const parts: string[] = [f.flatNumber]
  if (f.blockName) parts.push(f.blockName)
  return parts.join(' · ')
}

function matchesSearch(f: FlatOption, q: string): boolean {
  const lower = q.toLowerCase()
  if (f.flatNumber.toLowerCase().includes(lower)) return true
  if (f.blockName?.toLowerCase().includes(lower)) return true
  return false
}

export default function FlatSearchSelect({
  options,
  value,
  onChange,
  placeholder = 'Search flat…',
  disabled = false,
  className = '',
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.id === value) ?? null
  const filtered = query.trim() ? options.filter(o => matchesSearch(o, query)) : options

  // Reset highlight when filtered list changes
  useEffect(() => { setHighlighted(0) }, [query])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return
    const item = listRef.current.children[highlighted] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [highlighted])

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function openDropdown() {
    if (disabled) return
    setOpen(true)
    setQuery('')
    setHighlighted(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function selectOption(id: string) {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  function clearSelection(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setOpen(false)
    setQuery('')
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[highlighted]) selectOption(filtered[highlighted].id)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    } else if (e.key === 'Tab') {
      setOpen(false)
      setQuery('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, highlighted])

  // ── Trigger button styling ──────────────────────────────────────────────────
  const triggerCls = compact
    ? `w-full border border-gray-200 rounded px-2 py-1 text-xs text-left flex items-center justify-between gap-1 focus:outline-none focus:ring-1 focus:ring-blue-300 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed bg-transparent' : 'bg-white hover:border-blue-400 cursor-pointer'} ${className}`
    : `w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'bg-white hover:border-blue-400 cursor-pointer'} ${className}`

  return (
    <div ref={containerRef} className="relative">
      {/* ── Trigger ── */}
      <button
        type="button"
        onClick={openDropdown}
        disabled={disabled}
        className={triggerCls}
        tabIndex={0}
      >
        <span className={selected ? 'text-gray-900 font-medium truncate' : compact ? 'text-gray-400' : 'text-gray-400'}>
          {selected ? buildLabel(selected) : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {selected && !disabled && (
            <span
              onClick={clearSelection}
              title="Clear"
              className={`rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors leading-none ${compact ? 'text-[10px] px-0.5' : 'text-xs px-1'}`}
            >
              ✕
            </span>
          )}
          <span className={`text-gray-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>▾</span>
        </span>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to filter…"
                className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Options list */}
          <ul
            ref={listRef}
            className="max-h-52 overflow-y-auto py-1"
            role="listbox"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-gray-400 text-center">No flats found</li>
            ) : (
              filtered.map((f, i) => (
                <li
                  key={f.id}
                  role="option"
                  aria-selected={f.id === value}
                  onMouseDown={() => selectOption(f.id)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`px-3 py-2 cursor-pointer text-sm flex items-center justify-between gap-2 ${
                    i === highlighted ? 'bg-blue-50' : ''
                  } ${f.id === value ? 'font-semibold text-blue-700' : 'text-gray-800'}`}
                >
                  <span className="font-mono font-medium">{f.flatNumber}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {f.blockName && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {f.blockName}
                      </span>
                    )}
                    {f.floor != null && (
                      <span className="text-xs text-gray-400">
                        Floor {f.floor}
                      </span>
                    )}
                    {f.id === value && (
                      <span className="text-blue-500 text-xs">✓</span>
                    )}
                  </span>
                </li>
              ))
            )}
          </ul>

          {/* Count hint */}
          {filtered.length > 0 && (
            <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400">
                {filtered.length} of {options.length} flat{options.length !== 1 ? 's' : ''}
                {query ? ` matching "${query}"` : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}