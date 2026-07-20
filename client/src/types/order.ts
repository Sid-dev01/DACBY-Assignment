export type OrderStatus = 'PLACED' | 'PROCESSING' | 'READY_TO_SHIP'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED'
export type StatusFilter = 'ALL' | OrderStatus

export type OrderItem = {
  productName: string
  quantity: number
  price: number
}

export type Order = {
  _id?: string
  orderId: string
  customerName: string
  phoneNumber: string
  items: OrderItem[]
  amount: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
}
