import type { OrderItem } from '../types/order'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount)
}

export function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  return dateFormatter.format(date)
}

export function formatDuration(durationInMs: number) {
  if (durationInMs < 1000) {
    return `${durationInMs} ms`
  }

  return `${(durationInMs / 1000).toFixed(1)} s`
}

export function formatProductSummary(items: OrderItem[]) {
  if (!items.length) {
    return 'No product'
  }

  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0)
  const [firstItem, ...otherItems] = items
  const quantitySuffix = firstItem.quantity > 1 ? ` x${firstItem.quantity}` : ''

  if (!otherItems.length) {
    return `${firstItem.productName}${quantitySuffix}`
  }

  return `${firstItem.productName}${quantitySuffix} + ${otherItems.length} more (${totalQuantity} items)`
}
