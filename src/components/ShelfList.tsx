import type { ShelfItem } from '../types'

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date)
}

type ShelfListProps = {
  items: readonly ShelfItem[]
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-3.5 w-3.5"
    >
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ShelfList({ items }: ShelfListProps) {
  return (
    <ul className="divide-y divide-line border-b border-line">
      {items.map((item) => {
        const formattedDate = formatDate(item.createdAt)

        return (
          <li
            key={item.id}
            className="flex items-baseline justify-between gap-6 py-5"
          >
            <div className="min-w-0">
              <h2 className="text-[15px] font-medium leading-snug text-ink">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-baseline gap-1.5 decoration-line underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  >
                    <span>{item.title}</span>
                    <ExternalLinkIcon />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  item.title
                )}
              </h2>
              <p
                className="mt-1 truncate text-sm text-muted"
                title={item.subtitle}
              >
                {item.subtitle}
              </p>
            </div>
            {formattedDate ? (
              <time
                dateTime={item.createdAt}
                className="shrink-0 text-xs text-muted"
              >
                {formattedDate}
              </time>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
