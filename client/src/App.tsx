import { useState } from 'react'
import { OrdersDashboard } from './components/orders/OrdersDashboard'
import { SchedulerLogsPanel } from './components/scheduler/SchedulerLogsPanel'
import './App.css'

function App() {
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0)

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Order operations</p>
          <h1>Orders Dashboard</h1>
          <p className="header-copy">
            Track customer orders, payment health, scheduler activity, and fulfillment status.
          </p>
        </div>
      </section>

      <div className="dashboard-stack">
        <OrdersDashboard refreshSignal={ordersRefreshKey} />
        <SchedulerLogsPanel
          onSchedulerSuccess={() => setOrdersRefreshKey((currentKey) => currentKey + 1)}
        />
      </div>
    </main>
  )
}

export default App
