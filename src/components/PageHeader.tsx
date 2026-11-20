type PageHeaderProps = {
  title: string
  description: string
  eyebrow?: string
}

export function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <header className="pb-9">
      {eyebrow ? (
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-serif text-[2rem] leading-none tracking-tight text-ink sm:text-[2.4rem]">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>
    </header>
  )
}
