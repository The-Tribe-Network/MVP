"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FormFieldProps extends React.ComponentProps<typeof Input> {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  minLength?: number
  className?: string
}

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  minLength,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={error ? "border-destructive" : className}
        required={required}
        minLength={minLength}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
