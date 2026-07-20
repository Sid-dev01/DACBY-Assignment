import { apiRequest } from './client'
import type { Order, OrderStatus } from '../types/order'

type OrdersPayload = {
  orders?: Order[]
  total?: number
}

type FetchOrdersOptions = {
  signal?: AbortSignal
  status?: OrderStatus
}

export async function fetchOrders(options: FetchOrdersOptions = {}) {
  const query = new URLSearchParams({
    page: '1',
    limit: '100',
    sortBy: 'createdAt',
    order: 'desc',
  })

  if (options.status) {
    query.set('orderStatus', options.status)
  }

  const data = await apiRequest<OrdersPayload>(`/orders/get-orders?${query.toString()}`, {
    signal: options.signal,
  })
  const orders = data?.orders ?? []

  return {
    orders,
    total: data?.total ?? orders.length,
  }
}
