"use client"

import { useState } from "react"
import { z } from "zod"
import { validateSchema } from "@/lib/validations/auth"

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>
  onValidationSuccess?: (data: T) => void
  onValidationError?: (errors: Record<string, string>) => void
}

export function useFormValidation<T>({
  schema,
  onValidationSuccess,
  onValidationError,
}: UseFormValidationOptions<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (data: unknown): T | null => {
    setErrors({})
    
    const validation = validateSchema(schema, data)
    if (!validation.success || !validation.data) {
      const validationErrors = validation.errors || {}
      setErrors(validationErrors)
      onValidationError?.(validationErrors)
      return null
    }

    onValidationSuccess?.(validation.data)
    return validation.data
  }

  const clearErrors = () => {
    setErrors({})
  }

  return {
    errors,
    validate,
    clearErrors,
  }
}
