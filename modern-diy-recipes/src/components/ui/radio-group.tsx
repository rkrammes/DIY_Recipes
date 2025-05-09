"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Since we don't have @radix-ui/react-radio-group, let's create a simple implementation
const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, value, onValueChange, ...props }, ref) => {
  // Pass value and onValueChange to RadioGroupContext so children can access them
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        role="radiogroup"
        {...props}
      />
    </RadioGroupContext.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

// Context for RadioGroup state
const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({})

const RadioGroupItem = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
    value: string;
    disabled?: boolean;
  }
>(({ className, value, disabled, children, ...props }, ref) => {
  const { value: groupValue, onValueChange } = React.useContext(RadioGroupContext)
  const isChecked = value === groupValue
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isChecked && "border-2",
        className
      )}
      data-state={isChecked ? "checked" : "unchecked"}
      data-disabled={disabled ? true : undefined}
      aria-checked={isChecked}
      role="radio"
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (!disabled && onValueChange) {
          onValueChange(value)
        }
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ') && onValueChange) {
          e.preventDefault()
          onValueChange(value)
        }
      }}
      {...props}
    >
      {isChecked && (
        <div className="flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-current" />
        </div>
      )}
      {children}
    </div>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }