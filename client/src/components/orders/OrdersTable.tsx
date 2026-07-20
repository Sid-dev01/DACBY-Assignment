import { paymentLabels, statusLabels } from '../../constants/orders'
import { badgeClass } from '../../utils/badges'
import { formatCurrency, formatDateTime, formatProductSummary } from '../../utils/formatters'
import type { Order } from '../../types/order'

type OrdersTableProps = {
  isLoading?: boolean
  orders: Order[]
}

const tableHeaders = [
  'Order ID',
  'Customer',
  'Phone',
  'Product',
  'Amount',
  'Status',
  'Payment',
  'Created',
]

export function OrdersTable({ isLoading = false, orders }: OrdersTableProps) {
  return (
    <div className="table-wrap">
      <table className="orders-table" aria-label={isLoading ? 'Loading orders' : 'Orders'}>
        <thead>
          <tr>
            {tableHeaders.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? Array.from({ length: 6 }, (_, rowIndex) => (
                <tr className="skeleton-row" key={rowIndex}>
                  {tableHeaders.map((header) => (
                    <td key={header}>
                      <span className="skeleton-line" />
                    </td>
                  ))}
                </tr>
              ))
            : orders.map((order) => (
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
  )
}
