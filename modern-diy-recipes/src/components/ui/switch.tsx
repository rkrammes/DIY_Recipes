"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Custom Switch without Radix UI dependency
const Switch = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
  }
>(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  // Use internal state if not controlled
  const [internalChecked, setInternalChecked] = React.useState(checked || false)
  
  // Update internal state when prop changes
  React.useEffect(() => {
    if (checked !== undefined) {
      setInternalChecked(checked)
    }
  }, [checked])
  
  // Determine the current checked state
  const isChecked = checked !== undefined ? checked : internalChecked
  
  // Handle toggle
  const handleToggle = () => {
    if (disabled) return
    
    const newChecked = !isChecked
    setInternalChecked(newChecked)
    onCheckedChange?.(newChecked)
  }
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      disabled={disabled}
      ref={ref}
      onClick={handleToggle}
      className={cn(
        "peer inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isChecked ? "bg-primary" : "bg-secondary",
        className
      )}
      {...props}
    >
      <span 
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
          isChecked ? "translate-x-5" : "translate-x-0"
        )}
        aria-hidden="true"
      />
    </button>
  )
})
Switch.displayName = "Switch"

export { Switch }