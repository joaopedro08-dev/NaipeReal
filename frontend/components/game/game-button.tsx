import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TONES = {
  gold: "bg-gold text-gold-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_6px_16px_-8px_var(--gold)] hover:bg-[color-mix(in_oklch,var(--gold),white_12%)] focus-visible:ring-gold/60",
  felt: "border-felt-line/70 bg-felt-deep/80 text-felt-foreground hover:border-felt-line hover:bg-felt focus-visible:ring-gold/60",
  panel: "",
} as const

export function GameButton({
  tone = "felt",
  className,
  ...props
}: React.ComponentProps<typeof Button> & { tone?: keyof typeof TONES }) {
  return (
    <Button
      className={cn(
        "h-11 min-w-11 gap-1.5 rounded-lg px-4 text-sm font-semibold transition-[transform,background-color,border-color,box-shadow] duration-200 ease-deal active:scale-[0.97] disabled:opacity-60 [&_svg:not([class*='size-'])]:size-4",
        TONES[tone],
        className
      )}
      {...props}
    />
  )
}
