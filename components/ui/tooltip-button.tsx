"use client"

import * as React from "react"
import { Button, buttonVariants } from "./button"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import { type VariantProps } from "class-variance-authority"

export interface TooltipButtonProps
  extends React.ComponentProps<"button">,
  VariantProps<typeof buttonVariants> {
  /**
   * The message to display in the tooltip
   */
  message: string
  /**
   * Optional tooltip side placement
   */
  tooltipSide?: "top" | "right" | "bottom" | "left"
  /**
   * Optional tooltip alignment
   */
  tooltipAlign?: "start" | "center" | "end"
  /**
   * Optional delay before showing tooltip (in milliseconds)
   */
  tooltipDelay?: number
  /**
   * Optional className for the tooltip content
   */
  tooltipClassName?: string
  /**
   * Whether to render as a child component
   */
  asChild?: boolean
  /**
   * Optional wrapper component to wrap the button (e.g., DropdownMenuTrigger)
   * This allows the button to be wrapped by other components while maintaining tooltip functionality
   */
  wrapper?: React.ComponentType<React.PropsWithChildren<{ asChild?: boolean }>>
}

/**
 * A reusable button component with an integrated tooltip.
 * 
 * @example
 * ```tsx
 * <TooltipButton 
 *   message="Click to save"
 *   variant="default"
 *   onClick={handleSave}
 * >
 *   Save
 * </TooltipButton>
 * ```
 */
export function TooltipButton({
  message,
  tooltipSide = "top",
  tooltipAlign = "center",
  tooltipDelay,
  tooltipClassName,
  className,
  children,
  asChild,
  wrapper: Wrapper,
  ...buttonProps
}: TooltipButtonProps) {
  const button = (
    <Button className={className} asChild={asChild} {...buttonProps}>
      {children}
    </Button>
  )

  const triggerButton = Wrapper ? (
    <Wrapper asChild>
      {button}
    </Wrapper>
  ) : (
    button
  )

  return (
    <Tooltip delayDuration={tooltipDelay}>
      <TooltipTrigger asChild>
        {triggerButton}
      </TooltipTrigger>
      <TooltipContent
        side={tooltipSide}
        align={tooltipAlign}
        className={tooltipClassName}
      >
        {message}
      </TooltipContent>
    </Tooltip>
  )
}

