import { useId } from 'react'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
}: SearchInputProps) {
  const inputId = useId()

  return (
    <div className="relative">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" strokeLinecap="round" />
      </svg>
      <input
        id={inputId}
        type="search"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full appearance-none border-0 border-b border-line bg-transparent py-3 pl-7 pr-8 text-[15px] text-ink placeholder:text-muted focus:border-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-4 w-4"
          >
            <path d="m7 7 10 10M17 7 7 17" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
