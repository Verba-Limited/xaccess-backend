import type { ReactNode } from 'react'

type Line = { label: string; value: string }

export function DemoLoginHint({
  title,
  lines,
  footnote,
}: {
  title: string
  lines: Line[]
  footnote?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-left text-amber-950">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">{title}</p>
      <dl className="mt-2 space-y-1.5 text-xs">
        {lines.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
            <dt className="shrink-0 text-amber-800/90">{label}</dt>
            <dd className="font-mono text-[13px] font-medium text-amber-950 break-all">{value}</dd>
          </div>
        ))}
      </dl>
      {footnote && <p className="mt-2 text-xs text-amber-800/85">{footnote}</p>}
    </div>
  )
}
