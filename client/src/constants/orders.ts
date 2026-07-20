import type { OrderStatus, PaymentStatus, StatusFilter } from '../types/order'

export const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PLACED', label: 'Placed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'READY_TO_SHIP', label: 'Ready to ship' },
]

export const statusLabels: Record<OrderStatus, string> = {
  PLACED: 'Placed',
  PROCESSING: 'Processing',
  READY_TO_SHIP: 'Ready to ship',
}

export const paymentLabels: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
}
