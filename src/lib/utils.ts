import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function env<T>(constructor: (data: unknown) => T, key: string, defaultValue?: T) {
    if (!process.env[key] && !defaultValue) throw new Error(`Missing environment variable: ${key}`)
    return (constructor(process.env[key]) ?? defaultValue) as T
}
