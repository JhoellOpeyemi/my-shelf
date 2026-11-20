import { useCallback, useEffect, useState } from 'react'
import { fetchShelfItems } from '../lib/items'
import type { ShelfItem, ShelfKind } from '../types'

type LoadState = 'loading' | 'ready' | 'error'

type LoadResult = {
  kind: ShelfKind
  version: number
  state: Exclude<LoadState, 'loading'>
  items: ShelfItem[]
  error: string | null
}

export function useShelfItems(kind: ShelfKind) {
  const [result, setResult] = useState<LoadResult | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true

    fetchShelfItems(kind)
      .then((items) => {
        if (!active) return
        setResult({ kind, version, state: 'ready', items, error: null })
      })
      .catch((cause: unknown) => {
        if (!active) return
        setResult({
          kind,
          version,
          state: 'error',
          items: [],
          error:
            cause instanceof Error ? cause.message : 'Could not load the shelf.',
        })
      })

    return () => {
      active = false
    }
  }, [kind, version])

  const current =
    result?.kind === kind && result.version === version ? result : null

  const reload = useCallback(() => {
    setVersion((currentVersion) => currentVersion + 1)
  }, [])

  return {
    items: current?.items ?? [],
    state: current?.state ?? 'loading',
    error: current?.error ?? null,
    reload,
  }
}
