import { useCallback, useEffect, useState } from 'react'
import { fetchSchedulerLogs, runScheduler } from '../../api/scheduler'
import { schedulerStatusLabels, schedulerStatusOptions } from '../../constants/scheduler'
import { badgeClass } from '../../utils/badges'
import { formatDateTime, formatDuration } from '../../utils/formatters'
import { StateCard } from '../ui/StateCard'
import type { SchedulerLog, SchedulerStatusFilter } from '../../types/scheduler'

type SchedulerLogsPanelProps = {
  onSchedulerSuccess: () => void
}

const pageSizeOptions = [5, 10, 20, 50]

export function SchedulerLogsPanel({ onSchedulerSuccess }: SchedulerLogsPanelProps) {
  const [schedulerSecret, setSchedulerSecret] = useState('')
  const [logs, setLogs] = useState<SchedulerLog[]>([])
  const [totalLogs, setTotalLogs] = useState(0)
  const [statusFilter, setStatusFilter] = useState<SchedulerStatusFilter>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize))
  const firstVisibleLog = totalLogs ? (currentPage - 1) * pageSize + 1 : 0
  const lastVisibleLog = Math.min(currentPage * pageSize, totalLogs)

  const loadSchedulerLogs = useCallback(
    async (
      options: {
        pageOverride?: number
        signal?: AbortSignal
        showLoading?: boolean
      } = {},
    ) => {
      try {
        if (options.showLoading ?? true) {
          setIsLoadingLogs(true)
        }

        setErrorMessage('')

        const result = await fetchSchedulerLogs({
          limit: pageSize,
          page: options.pageOverride ?? currentPage,
          signal: options.signal,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
        })

        if (options.signal?.aborted) {
          return
        }

        setLogs(result.logs)
        setTotalLogs(result.total)
      } catch (error) {
        if (options.signal?.aborted) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Something went wrong while fetching scheduler logs.',
        )
      } finally {
        if (!options.signal?.aborted) {
          setIsLoadingLogs(false)
        }
      }
    },
    [currentPage, pageSize, statusFilter],
  )

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      void loadSchedulerLogs({ signal: controller.signal })
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [loadSchedulerLogs])

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
      setCurrentPage(1)
      await loadSchedulerLogs({ pageOverride: 1, showLoading: false })
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
              onChange={(event) => {
                setStatusFilter(event.target.value as SchedulerStatusFilter)
                setCurrentPage(1)
              }}
            >
              {schedulerStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field scheduler-page-size-field" htmlFor="scheduler-page-size">
            <span>Rows</span>
            <select
              id="scheduler-page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setCurrentPage(1)
              }}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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
              placeholder="Only needed to run scheduler"
            />
          </label>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void loadSchedulerLogs()}
            disabled={isLoadingLogs || isRunning}
          >
            {isLoadingLogs ? 'Loading...' : 'Refresh logs'}
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
        <StateCard title={isRunning ? 'Scheduler is running' : 'No scheduler logs found'}>
          {isRunning
            ? 'The scheduler response will appear here after the API finishes.'
            : 'No scheduler runs match the selected status filter.'}
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

      {!isLoadingLogs && logs.length > 0 ? (
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

      {!isLoadingLogs && !errorMessage && totalLogs > 0 ? (
        <div className="pagination-bar" aria-label="Scheduler logs pagination">
          <span>
            Showing {firstVisibleLog}-{lastVisibleLog} of {totalLogs}
          </span>
          <div className="pagination-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <strong>
              Page {currentPage} of {totalPages}
            </strong>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
