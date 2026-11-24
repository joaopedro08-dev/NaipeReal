import { cn } from "@/lib/utils"

export function HistoryList({ history }: { history: readonly string[] }) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nenhuma jogada ainda.</p>
    )
  }
  return (
    <ol className="hairline relative flex flex-col gap-2.5 border-l pl-4 text-sm">
      {history.map((entry, position) => (
        <li
          key={`${history.length - position}-${entry}`}
          className={cn(
            "relative leading-snug",
            position === 0 ? "font-semibold" : "opacity-80"
          )}
        >
          <span
            aria-hidden
            className={cn(
              "absolute top-1.5 -left-[1.29rem] size-2 rounded-full ring-2 ring-felt-abyss",
              position === 0 ? "bg-gold" : "bg-felt-line"
            )}
          />
          {entry}
        </li>
      ))}
    </ol>
  )
}
