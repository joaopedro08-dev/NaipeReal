import { CardBack } from "@/components/game/cards/card-face"

export function StatusPage({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action: React.ReactNode
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div aria-hidden className="flex -space-x-6">
        <CardBack className="h-24 w-[4.25rem] -rotate-12" />
        <CardBack className="z-10 h-24 w-[4.25rem] -translate-y-2" />
        <CardBack className="h-24 w-[4.25rem] rotate-12" />
      </div>
      <div className="flex max-w-md flex-col gap-3">
        <h1 className="font-heading text-[clamp(2rem,6vw,2.75rem)] leading-[1.05] font-semibold [font-variation-settings:'SOFT'_50]">
          {title}
        </h1>
        <p className="text-felt-muted">{children}</p>
      </div>
      {action}
    </main>
  )
}
