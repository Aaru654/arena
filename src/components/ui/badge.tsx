import * as React from "react"
import { clsx, type ClassValue } from "clsx"

function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "muted" | "info"
}

const Badge: React.FC<BadgeProps> = ({ className, variant = "muted", ...props }) => {
  const variants = {
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    muted: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)]",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge, type BadgeProps }