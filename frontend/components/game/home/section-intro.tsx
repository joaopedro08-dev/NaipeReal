import { cn } from "@/lib/utils"

export function SectionIntro({
  id,
  title,
  children,
  className,
}: {
  id: string
  title: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-3", className)}>
      <h2
        id={id}
        className="font-heading text-[clamp(2.1rem,4.6vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.02em] [font-variation-settings:'SOFT'_50]"
      >
        {title}
      </h2>
      {children && (
        <p className="max-w-[60ch] text-lg/relaxed text-felt-muted">
          {children}
        </p>
      )}
    </div>
  )
}
