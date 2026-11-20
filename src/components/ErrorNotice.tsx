type ErrorNoticeProps = {
  message: string
  onRetry: () => void
}

export function ErrorNotice({ message, onRetry }: ErrorNoticeProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 border border-line px-4 py-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="text-danger">{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="border-b border-ink text-xs uppercase tracking-[0.14em] text-ink transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        Try again
      </button>
    </div>
  )
}
