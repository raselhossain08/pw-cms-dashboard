"use client"
import { useState } from 'react'

export type ValidationRules<T extends Record<string, unknown> = Record<string, unknown>> = {
    required?: boolean | string
    minLength?: { value: number; message?: string }
    maxLength?: { value: number; message?: string }
    pattern?: { value: RegExp; message?: string }
    email?: boolean | string
    match?: { field: keyof T extends string ? keyof T : string; message?: string }
    custom?: (value: unknown, formData?: T) => string | undefined
}

export type FieldRules<T extends Record<string, unknown>> = Partial<Record<keyof T, ValidationRules<T>>>

export function useFormValidation<T extends Record<string, unknown>>(
    initialValues: T,
    rules: FieldRules<T>
) {
    const [values, setValues] = useState<T>(initialValues)
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

    const validateField = (name: keyof T, value: unknown, allValues?: T): string | undefined => {
        const fieldRules = rules[name]
        if (!fieldRules) return undefined

        // Required validation
        if (fieldRules.required) {
            if (value === '' || value === null || value === undefined) {
                return typeof fieldRules.required === 'string'
                    ? fieldRules.required
                    : `${String(name)} is required`
            }
        }

        // Email validation
        if (fieldRules.email && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (typeof value !== 'string' || !emailRegex.test(value)) {
                return typeof fieldRules.email === 'string'
                    ? fieldRules.email
                    : 'Please enter a valid email address'
            }
        }

        // MinLength validation
        if (fieldRules.minLength && typeof value === 'string') {
            if (value.length < fieldRules.minLength.value) {
                return fieldRules.minLength.message ||
                    `Must be at least ${fieldRules.minLength.value} characters`
            }
        }

        // MaxLength validation
        if (fieldRules.maxLength && typeof value === 'string') {
            if (value.length > fieldRules.maxLength.value) {
                return fieldRules.maxLength.message ||
                    `Must be no more than ${fieldRules.maxLength.value} characters`
            }
        }

        // Pattern validation
        if (fieldRules.pattern && typeof value === 'string') {
            if (!fieldRules.pattern.value.test(value)) {
                return fieldRules.pattern.message || 'Invalid format'
            }
        }

        // Match validation (for confirm password)
        if (fieldRules.match && value !== undefined) {
            const matchField = fieldRules.match.field as keyof T
            const matchValue = allValues?.[matchField]
            if (String(value) !== String(matchValue)) {
                return fieldRules.match.message ||
                    `Must match ${String(fieldRules.match.field)}`
            }
        }

        // Custom validation
        if (fieldRules.custom) {
            return fieldRules.custom(value, allValues)
        }

        return undefined
    }

    const validateAll = (data: T): boolean => {
        const newErrors: Partial<Record<keyof T, string>> = {}
        let isValid = true

        Object.keys(rules).forEach((field) => {
            const error = validateField(field as keyof T, data[field as keyof T], data)
            if (error) {
                newErrors[field as keyof T] = error
                isValid = false
            }
        })

        setErrors(newErrors)
        return isValid
    }

    const handleChange = (name: keyof T, value: unknown) => {
        const newValues = { ...values, [name]: value }
        setValues(newValues)

        // Validate on change if field was touched
        if (touched[name]) {
            const error = validateField(name, value, newValues)
            setErrors((prev) => ({ ...prev, [name]: error }))
        }
    }

    const handleBlur = (name: keyof T) => {
        setTouched((prev) => ({ ...prev, [name]: true }))
        const error = validateField(name, values[name], values)
        setErrors((prev) => ({ ...prev, [name]: error }))
    }

    const reset = () => {
        setValues(initialValues)
        setErrors({})
        setTouched({})
    }

    const setFieldError = (name: keyof T, error: string) => {
        setErrors((prev) => ({ ...prev, [name]: error }))
    }

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAll,
        reset,
        setFieldError,
        setValues,
    }
}
