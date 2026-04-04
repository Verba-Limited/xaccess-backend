export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-500">
        This area is reserved for upcoming features aligned with the Figma admin
        experience.
      </p>
    </div>
  )
}
