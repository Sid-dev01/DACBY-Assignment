import { useState } from 'react'
import { OrdersDashboard } from './components/orders/OrdersDashboard'
import { SchedulerLogsPanel } from './components/scheduler/SchedulerLogsPanel'
import './App.css'

type DashboardView = 'orders' | 'scheduler'

const dashboardViews: Array<{
  description: string
  label: string
  value: DashboardView
}> = [
  {
    description: 'Orders, payments, and fulfillment status',
    label: 'Orders',
    value: 'orders',
  },
  {
    description: 'Scheduler runs and transition history',
    label: 'Scheduler',
    value: 'scheduler',
  },
]

const viewDetails: Record<DashboardView, { eyebrow: string; title: string; copy: string }> = {
  orders: {
    eyebrow: 'Order operations',
    title: 'Orders Dashboard',
    copy: 'Track customer orders, payment health, and fulfillment status from one focused view.',
  },
  scheduler: {
    eyebrow: 'Automation monitor',
    title: 'Scheduler Logs',
    copy: 'Review scheduler runs, updated orders, failures, and execution duration.',
  },
}

function App() {
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0)
  const [activeView, setActiveView] = useState<DashboardView>('orders')
  const activeViewDetails = viewDetails[activeView]

  return (
    <div className="app-layout">
      <aside className="sidebar" aria-label="Dashboard navigation">
        <div className="sidebar-brand">
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          <div>
            <strong>DACBY</strong>
            <span>Admin panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {dashboardViews.map((view) => (
            <button
              aria-current={activeView === view.value ? 'page' : undefined}
              className={`nav-item ${activeView === view.value ? 'nav-item-active' : ''}`}
              key={view.value}
              onClick={() => setActiveView(view.value)}
              type="button"
            >
              <span>{view.label}</span>
              <small>{view.description}</small>
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard-shell">
        <section className="dashboard-header">
          <div>
            <p className="eyebrow">{activeViewDetails.eyebrow}</p>
            <h1>{activeViewDetails.title}</h1>
            <p className="header-copy">{activeViewDetails.copy}</p>
          </div>
        </section>

        <div className="dashboard-stack">
          {activeView === 'orders' ? (
            <OrdersDashboard refreshSignal={ordersRefreshKey} />
          ) : (
            <SchedulerLogsPanel
              onSchedulerSuccess={() => setOrdersRefreshKey((currentKey) => currentKey + 1)}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
