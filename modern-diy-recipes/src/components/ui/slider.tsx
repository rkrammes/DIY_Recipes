"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Custom Slider without Radix UI dependency
const Slider = React.forwardRef<
  HTMLDivElement,
  {
    defaultValue?: number[];
    value?: number[];
    onValueChange?: (value: number[]) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    disabled?: boolean;
  }
>(({
  defaultValue,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled = false,
  ...props
}, ref) => {
  // Use internal state if value is not controlled
  const [internalValue, setInternalValue] = React.useState<number[]>(value || defaultValue || [0])
  
  // Update internal value when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])
  
  // Current thumb value
  const thumbValue = internalValue[0] || 0
  
  // Calculate the percentage for thumb position and range width
  const percentage = ((thumbValue - min) / (max - min)) * 100
  
  // Handle slider track click
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    
    const trackRect = e.currentTarget.getBoundingClientRect()
    const position = (e.clientX - trackRect.left) / trackRect.width
    const newValue = min + position * (max - min)
    
    // Round to the nearest step
    const steppedValue = Math.round(newValue / step) * step
    const clampedValue = Math.max(min, Math.min(max, steppedValue))
    
    const newValues = [clampedValue]
    
    setInternalValue(newValues)
    onValueChange?.(newValues)
  }
  
  // Handle thumb drag
  const handleThumbDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    
    const startPosition = e.clientX
    const startValue = thumbValue
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const trackRect = e.currentTarget.parentElement?.getBoundingClientRect()
      if (!trackRect) return
      
      const deltaX = moveEvent.clientX - startPosition
      const deltaPercentage = deltaX / trackRect.width
      const deltaValue = deltaPercentage * (max - min)
      let newValue = startValue + deltaValue
      
      // Round to the nearest step
      newValue = Math.round(newValue / step) * step
      newValue = Math.max(min, Math.min(max, newValue))
      
      const newValues = [newValue]
      
      setInternalValue(newValues)
      onValueChange?.(newValues)
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <div
        className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary"
        onClick={handleTrackClick}
      >
        <div
          className="absolute h-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div
        className={cn(
          "block h-4 w-4 rounded-full border border-primary bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
        )}
        style={{ 
          position: 'absolute',
          left: `calc(${percentage}% - 0.5rem)` 
        }}
        onMouseDown={handleThumbDrag}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={thumbValue}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
      />
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }