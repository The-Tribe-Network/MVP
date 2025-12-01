'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface FormFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  type?: 'text' | 'textarea'
  textareaProps?: {
    maxLength?: number
    rows?: number
  }
}

export function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  description,
  required = false,
  disabled = false,
  type = 'text',
  textareaProps,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {type === 'textarea' ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[100px]"
          maxLength={textareaProps?.maxLength}
          rows={textareaProps?.rows}
        />
      ) : (
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      )}
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}

interface BioFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  maxLength?: number
}

export function BioField({
  value,
  onChange,
  disabled = false,
  maxLength = 500,
}: BioFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="bio">Bio</Label>
      <Textarea
        id="bio"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tell us about yourself..."
        className="min-h-[100px]"
        maxLength={maxLength}
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground text-right">
        {value.length}/{maxLength} characters
      </p>
    </div>
  )
}

