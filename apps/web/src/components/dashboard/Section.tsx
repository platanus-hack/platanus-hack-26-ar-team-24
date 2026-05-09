export default function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="py-16 border-t border-white/5 first:border-t-0 first:pt-0">
      <div className="mb-10">
        <p className="text-xs font-mono text-zinc-500 mb-3 tracking-wider uppercase">{eyebrow}</p>
        <h2 className="font-serif text-3xl sm:text-4xl mb-3">{title}</h2>
        {description && (
          <p className="text-zinc-400 max-w-xl">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}
