function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
        {description ? <p className="mt-3 text-sm leading-6 text-muted sm:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export default SectionHeading
