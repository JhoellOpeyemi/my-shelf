import type { KeyboardEvent } from 'react'
import { KIND_LABELS, SHELF_KINDS, type ShelfKind } from '../types'

type TabsProps = {
  active: ShelfKind
  onChange: (kind: ShelfKind) => void
  idPrefix?: string
  label?: string
}

export function Tabs({
  active,
  onChange,
  idPrefix = 'shelf',
  label = 'Shelf sections',
}: TabsProps) {
  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % SHELF_KINDS.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + SHELF_KINDS.length) % SHELF_KINDS.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = SHELF_KINDS.length - 1
    }

    if (nextIndex === null) return

    event.preventDefault()
    const nextKind = SHELF_KINDS[nextIndex]
    onChange(nextKind)
    document.getElementById(`${idPrefix}-tab-${nextKind}`)?.focus()
  }

  return (
    <div className="border-b border-line">
      <div
        role="tablist"
        aria-label={label}
        className="-mb-px flex gap-7"
      >
        {SHELF_KINDS.map((kind, index) => {
          const selected = kind === active

          return (
            <button
              key={kind}
              id={`${idPrefix}-tab-${kind}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={
                selected ? `${idPrefix}-panel-${kind}` : undefined
              }
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(kind)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${
                selected
                  ? 'border-ink text-ink'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {KIND_LABELS[kind]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
