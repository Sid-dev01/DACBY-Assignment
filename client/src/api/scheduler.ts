import { apiRequest } from './client'
import type { SchedulerLog, SchedulerStatus } from '../types/scheduler'

type RunSchedulerOptions = {
  secret: string
  signal?: AbortSignal
}

type FetchSchedulerLogsOptions = {
  limit?: number
  page?: number
  signal?: AbortSignal
  status?: SchedulerStatus
}

type SchedulerLogsPayload = {
  logs?: SchedulerLog[]
  total?: number
}

export function runScheduler(options: RunSchedulerOptions) {
  return apiRequest<SchedulerLog>('/scheduler/process-orders', {
    method: 'POST',
    headers: {
      'x-scheduler-secret': options.secret,
    },
    signal: options.signal,
  })
}

export async function fetchSchedulerLogs(options: FetchSchedulerLogsOptions) {
  const query = new URLSearchParams({
    page: String(options.page ?? 1),
    limit: String(options.limit ?? 10),
    sortBy: 'createdAt',
    order: 'desc',
  })

  if (options.status) {
    query.set('status', options.status)
  }

  const data = await apiRequest<SchedulerLogsPayload>(`/scheduler/logs?${query.toString()}`, {
    signal: options.signal,
  })
  const logs = data?.logs ?? []

  return {
    logs,
    total: data?.total ?? logs.length,
  }
}
