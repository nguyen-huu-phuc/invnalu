import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatVND(amount: number | null | undefined): string {
  if (amount == null) return '-'
  return `${Number(amount).toLocaleString('vi-VN')} đ`
}
