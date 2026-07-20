import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchOrders } from '../../api/orders'
import { paymentLabels, statusOptions } from '../../constants/orders'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { OrdersTable } from './OrdersTable'
import { StateCard } from '../ui/StateCard'
import type { Order, StatusFilter } from '../../types/order'

const AUTO_REFRESH_SECONDS = 30

type OrdersDashboardProps = {
  refreshSignal: number
}

export function OrdersDashboard({ refreshSignal }: OrdersDashboardProps) {
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

      try {
        if (showLoading) {
          setIsLoading(true)
        } else {
          setIsRefreshing(true)
        }

        setErrorMessage('')

        const result = await fetchOrders({
          signal,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
        })

        setOrders(result.orders)
        setTotalOrders(result.total)
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
  }, [loadOrders, refreshSignal])

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
  const paidPercentage = orders.length ? Math.round((metrics.paidOrders / orders.length) * 100) : 0
  const showEmptyState = !isLoading && !errorMessage && orders.length === 0
  const showOrdersTable = !isLoading && !errorMessage && orders.length > 0

  return (
    <section aria-labelledby="orders-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Orders</p>
          <h2 id="orders-heading">Order queue</h2>
        </div>
      </div>

      <section className="control-bar" aria-label="Order filters and actions">
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

        <div className="control-actions" aria-label="Order refresh actions">
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
          <span>
            {paidPercentage}% {paymentLabels.PAID.toLowerCase()}
          </span>
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

        {isLoading ? <OrdersTable isLoading orders={[]} /> : null}

        {errorMessage ? (
          <StateCard
            action={
              <button className="button button-primary" type="button" onClick={() => void loadOrders()}>
                Try again
              </button>
            }
            title="Could not load orders"
            tone="error"
          >
            {errorMessage}
          </StateCard>
        ) : null}

        {showEmptyState ? (
          <StateCard
            action={
              statusFilter !== 'ALL' ? (
                <button className="button button-secondary" type="button" onClick={() => setStatusFilter('ALL')}>
                  Clear filter
                </button>
              ) : null
            }
            title="No orders found"
          >
            {statusFilter === 'ALL'
              ? 'New orders will appear here as soon as the API returns them.'
              : `There are no ${activeFilterLabel.toLowerCase()} orders right now.`}
          </StateCard>
        ) : null}

        {showOrdersTable ? <OrdersTable orders={orders} /> : null}
      </section>
    </section>
  )
}
