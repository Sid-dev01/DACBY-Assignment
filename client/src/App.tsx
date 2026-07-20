
import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

type OrderStatus = 'PLACED' | 'PROCESSING' | 'READY_TO_SHIP'
type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED'
type StatusFilter = 'ALL' | OrderStatus

type OrderItem = {
  productName: string
  quantity: number
  price: number
}

type Order = {
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

type OrdersResponse = {
  success: boolean
  message?: string
  data?: {
    orders?: Order[]
    total?: number
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '')
const AUTO_REFRESH_SECONDS = 30

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PLACED', label: 'Placed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'READY_TO_SHIP', label: 'Ready to ship' },
]

const statusLabels: Record<OrderStatus, string> = {
  PLACED: 'Placed',
  PROCESSING: 'Processing',
  READY_TO_SHIP: 'Ready to ship',
}

const paymentLabels: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount)
}

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  return dateFormatter.format(date)
}

function formatProductSummary(items: OrderItem[]) {
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

function badgeClass(value: string) {
  return value.toLowerCase().replaceAll('_', '-')
}

function App() {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadOrders = useCallback(
    async (options: { signal?: AbortSignal; showLoading?: boolean } = {}) => {
      const { signal, showLoading = true } = options
      const query = new URLSearchParams({
        page: '1',
        limit: '100',
        sortBy: 'createdAt',
        order: 'desc',
      })

      if (statusFilter !== 'ALL') {
        query.set('orderStatus', statusFilter)
      }

      try {
        if (showLoading) {
          setIsLoading(true)
        } else {
          setIsRefreshing(true)
        }

        setErrorMessage('')

        const response = await fetch(`${API_BASE_URL}/orders/get-orders?${query.toString()}`, {
          headers: {
            Accept: 'application/json',
          },
          signal,
        })

        const body = (await response.json().catch(() => null)) as OrdersResponse | null

        if (!response.ok || !body?.success) {
          throw new Error(body?.message ?? `Request failed with status ${response.status}`)
        }

        const fetchedOrders = body.data?.orders ?? []

        setOrders(fetchedOrders)
        setTotalOrders(body.data?.total ?? fetchedOrders.length)
        setLastUpdated(new Date())
      } catch (error) {
        if (signal?.aborted) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Something went wrong while fetching orders.',
        )
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    },
    [statusFilter],
  )

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      void loadOrders({ signal: controller.signal, showLoading: true })
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [loadOrders])

  useEffect(() => {
    if (!autoRefresh) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      void loadOrders({ showLoading: false })
    }, AUTO_REFRESH_SECONDS * 1000)

    return () => window.clearInterval(intervalId)
  }, [autoRefresh, loadOrders])

  const metrics = useMemo(() => {
    const revenue = orders.reduce((total, order) => total + order.amount, 0)
    const paidOrders = orders.filter((order) => order.paymentStatus === 'PAID').length
    const pendingOrders = orders.filter((order) => order.orderStatus !== 'READY_TO_SHIP').length

    return {
      paidOrders,
      pendingOrders,
      revenue,
    }
  }, [orders])

  const activeFilterLabel =
    statusOptions.find((option) => option.value === statusFilter)?.label ?? 'Selected status'
  const showEmptyState = !isLoading && !errorMessage && orders.length === 0
  const showOrdersTable = !isLoading && !errorMessage && orders.length > 0

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Order operations</p>
          <h1>Orders Dashboard</h1>
          <p className="header-copy">
            Track customer orders, payment health, and fulfillment status from one responsive view.
          </p>
        </div>

        <div className="header-actions" aria-label="Dashboard actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void loadOrders({ showLoading: false })}
            disabled={isLoading || isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh now'}
          </button>
          <button
            className={`button ${autoRefresh ? 'button-active' : 'button-primary'}`}
            type="button"
            onClick={() => setAutoRefresh((enabled) => !enabled)}
          >
            {autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
          </button>
        </div>
      </section>

      <section className="control-bar" aria-label="Order filters">
        <label className="filter-field" htmlFor="status-filter">
          <span>Status</span>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="sync-status" aria-live="polite">
          <span className={`sync-dot ${autoRefresh ? 'sync-dot-active' : ''}`} aria-hidden="true" />
          {lastUpdated
            ? `Last updated ${formatDateTime(lastUpdated.toISOString())}`
            : 'Waiting for first sync'}
        </div>
      </section>

      <section className="metrics-grid" aria-label="Order summary">
        <article className="metric-card">
          <span className="metric-label">Matching orders</span>
          <strong>{totalOrders}</strong>
          <span>{orders.length} loaded in this view</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Revenue shown</span>
          <strong>{formatCurrency(metrics.revenue)}</strong>
          <span>Calculated from loaded orders</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Paid orders</span>
          <strong>{metrics.paidOrders}</strong>
          <span>{orders.length ? Math.round((metrics.paidOrders / orders.length) * 100) : 0}% paid</span>
        </article>
        <article className="metric-card">
          <span className="metric-label">Open fulfillment</span>
          <strong>{metrics.pendingOrders}</strong>
          <span>Placed or processing</span>
        </article>
      </section>

      <section className="orders-panel">
        <div className="panel-heading">
          <div>
            <h2>{activeFilterLabel}</h2>
            <p>Newest orders first, refreshed from the orders API.</p>
          </div>
          {isRefreshing ? <span className="refreshing-pill">Syncing</span> : null}
        </div>

        {isLoading ? (
          <div className="table-wrap">
            <table className="orders-table" aria-label="Loading orders">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }, (_, index) => (
                  <tr className="skeleton-row" key={index}>
                    {Array.from({ length: 8 }, (_, cellIndex) => (
                      <td key={cellIndex}>
                        <span className="skeleton-line" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="state-card state-card-error" role="alert">
            <h3>Could not load orders</h3>
            <p>{errorMessage}</p>
            <button className="button button-primary" type="button" onClick={() => void loadOrders()}>
              Try again
            </button>
          </div>
        ) : null}

        {showEmptyState ? (
          <div className="state-card">
            <h3>No orders found</h3>
            <p>
              {statusFilter === 'ALL'
                ? 'New orders will appear here as soon as the API returns them.'
                : `There are no ${activeFilterLabel.toLowerCase()} orders right now.`}
            </p>
            {statusFilter !== 'ALL' ? (
              <button className="button button-secondary" type="button" onClick={() => setStatusFilter('ALL')}>
                Clear filter
              </button>
            ) : null}
          </div>
        ) : null}

        {showOrdersTable ? (
          <div className="table-wrap">
            <table className="orders-table" aria-label="Orders">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id ?? order.orderId}>
                    <td data-label="Order ID">
                      <span className="order-id">{order.orderId}</span>
                    </td>
                    <td data-label="Customer">
                      <strong>{order.customerName}</strong>
                    </td>
                    <td data-label="Phone">
                      <a className="phone-link" href={`tel:${order.phoneNumber}`}>
                        {order.phoneNumber}
                      </a>
                    </td>
                    <td data-label="Product">{formatProductSummary(order.items)}</td>
                    <td data-label="Amount" className="amount-cell">
                      {formatCurrency(order.amount)}
                    </td>
                    <td data-label="Status">
                      <span className={`status-badge status-badge-${badgeClass(order.orderStatus)}`}>
                        {statusLabels[order.orderStatus]}
                      </span>
                    </td>
                    <td data-label="Payment">
                      <span className={`payment-badge payment-badge-${badgeClass(order.paymentStatus)}`}>
                        {paymentLabels[order.paymentStatus]}
                      </span>
                    </td>
                    <td data-label="Created">{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default App
