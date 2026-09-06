import * as React from "react"
import { clsx, type ClassValue } from "clsx"

function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, fullWidth, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50 disabled:pointer-events-none"

    const variants = {
      default: "bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90",
      outline: "border border-[var(--border)] bg-transparent hover:bg-[var(--bg-elevated)]",
      ghost: "bg-transparent hover:bg-[var(--bg-elevated)]",
      destructive: "bg-red-600 text-white hover:bg-red-700"
    }

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-md",
      md: "h-10 px-4 text-sm rounded-md",
      lg: "h-12 px-6 text-base rounded-md"
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, type ButtonProps }