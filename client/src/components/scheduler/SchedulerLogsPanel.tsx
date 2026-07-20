import { useState } from 'react'
import { fetchSchedulerLogs, runScheduler } from '../../api/scheduler'
import { schedulerStatusLabels, schedulerStatusOptions } from '../../constants/scheduler'
import { badgeClass } from '../../utils/badges'
import { formatDateTime, formatDuration } from '../../utils/formatters'
import { StateCard } from '../ui/StateCard'
import type { SchedulerLog, SchedulerStatusFilter } from '../../types/scheduler'

type SchedulerLogsPanelProps = {
  onSchedulerSuccess: () => void
}

export function SchedulerLogsPanel({ onSchedulerSuccess }: SchedulerLogsPanelProps) {
  const [schedulerSecret, setSchedulerSecret] = useState('')
  const [logs, setLogs] = useState<SchedulerLog[]>([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [statusFilter, setStatusFilter] = useState<SchedulerStatusFilter>('ALL')
  const [hasLoadedLogs, setHasLoadedLogs] = useState(false)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadSchedulerLogs(options: { secretOverride?: string; showLoading?: boolean } = {}) {
    const trimmedSecret = options.secretOverride ?? schedulerSecret.trim()

    if (!trimmedSecret) {
      setErrorMessage('Scheduler secret is required to fetch logs.')
      return
    }

    try {
      if (options.showLoading ?? true) {
        setIsLoadingLogs(true)
      }

      setErrorMessage('')

      const result = await fetchSchedulerLogs({
        secret: trimmedSecret,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      })

      setLogs(result.logs)
      setTotalLogs(result.total)
      setHasLoadedLogs(true)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while fetching scheduler logs.',
      )
    } finally {
      setIsLoadingLogs(false)
    }
  }

  async function handleRunScheduler() {
    const trimmedSecret = schedulerSecret.trim()

    if (!trimmedSecret) {
      setErrorMessage('Scheduler secret is required to run the scheduler.')
      return
    }

    try {
      setIsRunning(true)
      setErrorMessage('')

      await runScheduler({ secret: trimmedSecret })

      onSchedulerSuccess()
      await loadSchedulerLogs({ showLoading: false, secretOverride: trimmedSecret })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while running the scheduler.',
      )
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <section className="scheduler-panel orders-panel" aria-labelledby="scheduler-heading">
      <div className="panel-heading scheduler-heading">
        <div>
          <p className="eyebrow">Scheduler</p>
          <h2 id="scheduler-heading">Scheduler logs</h2>
          <p>{totalLogs ? `${totalLogs} scheduler runs found` : 'Fetch scheduler runs from the logs API.'}</p>
        </div>

        <div className="scheduler-form">
          <label className="filter-field scheduler-status-field" htmlFor="scheduler-status-filter">
            <span>Status</span>
            <select
              id="scheduler-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as SchedulerStatusFilter)}
            >
              {schedulerStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field secret-field" htmlFor="scheduler-secret">
            <span>Secret</span>
            <input
              id="scheduler-secret"
              type="password"
              value={schedulerSecret}
              onChange={(event) => {
                setSchedulerSecret(event.target.value)
                setErrorMessage('')
              }}
              autoComplete="new-password"
              placeholder="x-scheduler-secret"
            />
          </label>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void loadSchedulerLogs()}
            disabled={isLoadingLogs || isRunning}
          >
            {isLoadingLogs ? 'Loading...' : hasLoadedLogs ? 'Refresh logs' : 'Load logs'}
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={() => void handleRunScheduler()}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run scheduler'}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <StateCard title="Scheduler request failed" tone="error">
          {errorMessage}
        </StateCard>
      ) : null}

      {!errorMessage && !logs.length && !isLoadingLogs ? (
        <StateCard title={isRunning ? 'Scheduler is running' : hasLoadedLogs ? 'No scheduler logs found' : 'Scheduler logs'}>
          {isRunning
            ? 'The scheduler response will appear here after the API finishes.'
            : hasLoadedLogs
              ? 'No scheduler runs match the selected status filter.'
              : 'Enter the scheduler secret and click Load logs.'}
        </StateCard>
      ) : null}

      {isLoadingLogs ? (
        <div className="table-wrap">
          <table className="orders-table scheduler-table" aria-label="Loading scheduler logs">
            <thead>
              <tr>
                <th>Started</th>
                <th>Duration</th>
                <th>Checked</th>
                <th>Updated</th>
                <th>Failed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }, (_, rowIndex) => (
                <tr className="skeleton-row" key={rowIndex}>
                  {Array.from({ length: 6 }, (_, cellIndex) => (
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

      {!isLoadingLogs && logs.length ? (
        <div className="table-wrap">
          <table className="orders-table scheduler-table" aria-label="Scheduler logs">
            <thead>
              <tr>
                <th>Started</th>
                <th>Duration</th>
                <th>Checked</th>
                <th>Updated</th>
                <th>Failed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log._id ?? `${log.startedAt}-${index}`}>
                  <td data-label="Started">{formatDateTime(log.startedAt)}</td>
                  <td data-label="Duration">{formatDuration(log.durationInMs)}</td>
                  <td data-label="Checked">{log.totalOrdersChecked}</td>
                  <td data-label="Updated">{log.totalOrdersUpdated}</td>
                  <td data-label="Failed">{log.failedOrders}</td>
                  <td data-label="Status">
                    <span className={`scheduler-badge scheduler-badge-${badgeClass(log.status)}`}>
                      {schedulerStatusLabels[log.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
