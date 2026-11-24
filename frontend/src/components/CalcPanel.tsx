import React, { useState, useEffect, useCallback, useRef } from 'react'

interface CalcPanelProps {
  open: boolean
  onClose: () => void
}

interface HistoryEntry {
  expression: string
  result: string
}

export default function CalcPanel({ open, onClose }: CalcPanelProps) {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [copied, setCopied] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Keyboard input
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      // Don't hijack if user is typing in an input elsewhere
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key >= '0' && e.key <= '9') { handleDigit(e.key); return }
      if (e.key === '.') { handleDot(); return }
      if (e.key === '+') { handleOperator('+'); return }
      if (e.key === '-') { handleOperator('−'); return }
      if (e.key === '*') { handleOperator('×'); return }
      if (e.key === '/') { e.preventDefault(); handleOperator('÷'); return }
      if (e.key === 'Enter' || e.key === '=') { handleEquals(); return }
      if (e.key === 'Backspace') { handleBackspace(); return }
      if (e.key === 'Delete') { handleClear(); return }
      if (e.key === '%') { handlePercent(); return }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, display, expression, waitingForOperand]) // eslint-disable-line

  const handleDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(prev => prev === '0' ? digit : prev + digit)
    }
  }, [waitingForOperand])

  const handleDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.')
      setWaitingForOperand(false)
      return
    }
    if (!display.includes('.')) {
      setDisplay(prev => prev + '.')
    }
  }, [display, waitingForOperand])

  const handleOperator = useCallback((op: string) => {
    const value = parseFloat(display)
    if (expression && !waitingForOperand) {
      // chain calculation
      const result = evaluate(expression + display)
      const resultStr = formatNumber(result)
      setDisplay(resultStr)
      setExpression(resultStr + ' ' + op + ' ')
    } else {
      setExpression(display + ' ' + op + ' ')
    }
    setWaitingForOperand(true)
  }, [display, expression, waitingForOperand])

  const handleEquals = useCallback(() => {
    if (!expression) return
    const fullExpr = expression + display
    const result = evaluate(fullExpr)
    const resultStr = formatNumber(result)
    setHistory(prev => [{ expression: fullExpr, result: resultStr }, ...prev].slice(0, 10))
    setDisplay(resultStr)
    setExpression('')
    setWaitingForOperand(true)
  }, [display, expression])

  const handleClear = useCallback(() => {
    setDisplay('0')
    setExpression('')
    setWaitingForOperand(false)
  }, [])

  const handleBackspace = useCallback(() => {
    if (waitingForOperand) return
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0')
  }, [waitingForOperand])

  const handlePercent = useCallback(() => {
    const value = parseFloat(display)
    setDisplay(formatNumber(value / 100))
    setWaitingForOperand(false)
  }, [display])

  const handleToggleSign = useCallback(() => {
    const value = parseFloat(display)
    setDisplay(formatNumber(-value))
  }, [display])

  const handleCopyResult = () => {
    navigator.clipboard.writeText(display).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const handleHistoryClick = (entry: HistoryEntry) => {
    setDisplay(entry.result)
    setExpression('')
    setWaitingForOperand(true)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧮</span>
            <span className="text-sm font-semibold text-white">Calculator</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyResult}
              className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition"
              title="Copy result"
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl leading-none ml-1"
              aria-label="Close calculator"
            >
              ×
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="px-4 pt-4 pb-2">
          {/* Expression */}
          <div className="text-right text-xs text-gray-500 h-5 truncate">
            {expression || '\u00a0'}
          </div>
          {/* Main number */}
          <div
            className="text-right text-4xl font-light text-white mt-1 truncate"
            style={{ fontSize: display.length > 12 ? '1.5rem' : display.length > 9 ? '2rem' : '2.5rem' }}
          >
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="px-3 pb-3 grid grid-cols-4 gap-2 mt-2">
          {/* Row 1 */}
          <CalcBtn label="AC" onClick={handleClear} variant="secondary" />
          <CalcBtn label="±" onClick={handleToggleSign} variant="secondary" />
          <CalcBtn label="%" onClick={handlePercent} variant="secondary" />
          <CalcBtn label="÷" onClick={() => handleOperator('÷')} variant="operator" />

          {/* Row 2 */}
          <CalcBtn label="7" onClick={() => handleDigit('7')} />
          <CalcBtn label="8" onClick={() => handleDigit('8')} />
          <CalcBtn label="9" onClick={() => handleDigit('9')} />
          <CalcBtn label="×" onClick={() => handleOperator('×')} variant="operator" />

          {/* Row 3 */}
          <CalcBtn label="4" onClick={() => handleDigit('4')} />
          <CalcBtn label="5" onClick={() => handleDigit('5')} />
          <CalcBtn label="6" onClick={() => handleDigit('6')} />
          <CalcBtn label="−" onClick={() => handleOperator('−')} variant="operator" />

          {/* Row 4 */}
          <CalcBtn label="1" onClick={() => handleDigit('1')} />
          <CalcBtn label="2" onClick={() => handleDigit('2')} />
          <CalcBtn label="3" onClick={() => handleDigit('3')} />
          <CalcBtn label="+" onClick={() => handleOperator('+')} variant="operator" />

          {/* Row 5 */}
          <CalcBtn label="0" onClick={() => handleDigit('0')} wide />
          <CalcBtn label="." onClick={handleDot} />
          <CalcBtn label="=" onClick={handleEquals} variant="equals" />
        </div>

        {/* Backspace */}
        <div className="px-3 pb-2">
          <button
            onClick={handleBackspace}
            className="w-full py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition"
          >
            ⌫ Backspace
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="flex-1 overflow-y-auto border-t border-gray-700 px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">History</p>
            <div className="space-y-1.5">
              {history.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => handleHistoryClick(entry)}
                  className="w-full text-right hover:bg-gray-800 rounded-lg px-2 py-1.5 transition"
                >
                  <p className="text-xs text-gray-500 truncate">{entry.expression}</p>
                  <p className="text-sm font-semibold text-gray-200">= {entry.result}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setHistory([])}
              className="mt-2 text-xs text-gray-600 hover:text-gray-400 w-full text-center"
            >
              Clear history
            </button>
          </div>
        )}

        {/* Keyboard hint */}
        <div className="px-4 py-2 border-t border-gray-800 text-[10px] text-gray-600 text-center">
          Keyboard: 0–9, +, −, ×, ÷, Enter, Backspace, Esc
        </div>
      </div>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────

interface CalcBtnProps {
  label: string
  onClick: () => void
  variant?: 'default' | 'secondary' | 'operator' | 'equals'
  wide?: boolean
}

function CalcBtn({ label, onClick, variant = 'default', wide = false }: CalcBtnProps) {
  const base = 'flex items-center justify-center rounded-2xl text-lg font-medium h-14 transition-all active:scale-95 select-none cursor-pointer'
  const variantCls = {
    default: 'bg-gray-700 hover:bg-gray-600 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-500 text-white',
    operator: 'bg-orange-500 hover:bg-orange-400 text-white',
    equals: 'bg-orange-500 hover:bg-orange-400 text-white',
  }[variant]

  return (
    <button
      onClick={onClick}
      className={`${base} ${variantCls} ${wide ? 'col-span-2' : ''}`}
    >
      {label}
    </button>
  )
}

// ─── Math evaluator ───────────────────────────────────────────
// Safely evaluates expressions like "12.5 × 3 + 100 ÷ 4"
function evaluate(expr: string): number {
  // Normalize operators
  const normalized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .trim()

  // Simple recursive descent evaluator (no eval())
  let pos = 0

  function parseExpr(): number {
    let left = parseTerm()
    while (pos < normalized.length && (normalized[pos] === '+' || normalized[pos] === '-')) {
      const op = normalized[pos]
      pos++
      const right = parseTerm()
      left = op === '+' ? left + right : left - right
    }
    return left
  }

  function parseTerm(): number {
    let left = parseFactor()
    while (pos < normalized.length && (normalized[pos] === '*' || normalized[pos] === '/')) {
      const op = normalized[pos]
      pos++
      const right = parseFactor()
      left = op === '*' ? left * right : right !== 0 ? left / right : 0
    }
    return left
  }

  function parseFactor(): number {
    // skip spaces
    while (pos < normalized.length && normalized[pos] === ' ') pos++
    let negative = false
    if (normalized[pos] === '-') { negative = true; pos++ }
    // skip spaces after sign
    while (pos < normalized.length && normalized[pos] === ' ') pos++
    let numStr = ''
    while (pos < normalized.length && (normalized[pos] === '.' || (normalized[pos] >= '0' && normalized[pos] <= '9'))) {
      numStr += normalized[pos++]
    }
    // skip trailing spaces
    while (pos < normalized.length && normalized[pos] === ' ') pos++
    const n = numStr ? parseFloat(numStr) : 0
    return negative ? -n : n
  }

  try {
    const result = parseExpr()
    return isFinite(result) ? result : 0
  } catch {
    return 0
  }
}

function formatNumber(n: number): string {
  if (!isFinite(n)) return '0'
  // Avoid floating-point noise (e.g. 0.1 + 0.2 = 0.30000000000000004)
  const rounded = Math.round(n * 1e10) / 1e10
  const str = String(rounded)
  // If it's a very long decimal, limit to 10 significant digits
  if (str.length > 15) {
    return parseFloat(rounded.toPrecision(10)).toString()
  }
  return str
}