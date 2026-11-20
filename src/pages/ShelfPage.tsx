import { useState } from 'react'
import { ErrorNotice } from '../components/ErrorNotice'
import { PageHeader } from '../components/PageHeader'
import { SearchInput } from '../components/SearchInput'
import { ShelfList } from '../components/ShelfList'
import { Tabs } from '../components/Tabs'
import { useShelfItems } from '../hooks/useShelfItems'
import { filterShelfItems } from '../lib/items'
import {
  KIND_EMPTY_MESSAGES,
  KIND_LABELS,
  KIND_NOUNS,
  type ShelfKind,
} from '../types'

export function ShelfPage() {
  const [kind, setKind] = useState<ShelfKind>('books')
  const [query, setQuery] = useState('')
  const { items, state, error, reload } = useShelfItems(kind)

  const visibleItems = filterShelfItems(items, query)
  const noun = KIND_NOUNS[kind]
  const hasQuery = query.trim().length > 0

  function changeKind(nextKind: ShelfKind) {
    setKind(nextKind)
    setQuery('')
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 pb-24 pt-14 sm:pt-20">
      <PageHeader
        title="Shelf"
        description="A quiet record of what I've read, watched, and learned."
      />

      <Tabs active={kind} onChange={changeKind} />

      <div className="pt-6">
        <SearchInput
          value={query}
          onChange={setQuery}
          label={`Search ${KIND_LABELS[kind].toLowerCase()}`}
          placeholder={`Search ${KIND_LABELS[kind].toLowerCase()}…`}
        />
      </div>

      <section
        id={`shelf-panel-${kind}`}
        role="tabpanel"
        aria-labelledby={`shelf-tab-${kind}`}
        className="pt-6"
      >
        {state === 'loading' ? (
          <p className="py-8 text-sm text-muted">Loading…</p>
        ) : null}

        {state === 'error' ? (
          <ErrorNotice
            message={error ?? 'Could not load the shelf.'}
            onRetry={reload}
          />
        ) : null}

        {state === 'ready' ? (
          <>
            <p
              className="pb-3 text-xs uppercase tracking-[0.14em] text-muted"
              aria-live="polite"
            >
              {hasQuery
                ? `${visibleItems.length} ${
                    visibleItems.length === 1 ? 'result' : 'results'
                  }`
                : `${visibleItems.length} ${
                    visibleItems.length === 1 ? noun.singular : noun.plural
                  }`}
            </p>

            {visibleItems.length > 0 ? (
              <ShelfList items={visibleItems} />
            ) : (
              <div className="border-t border-line py-10">
                <p className="text-sm text-muted">
                  {hasQuery
                    ? `No matches for “${query.trim()}”.`
                    : KIND_EMPTY_MESSAGES[kind]}
                </p>
                {hasQuery ? (
                  <p className="mt-2 text-sm text-muted">
                    Try a different word or clear the search.
                  </p>
                ) : null}
              </div>
            )}
          </>
        ) : null}
      </section>
    </main>
  )
}
