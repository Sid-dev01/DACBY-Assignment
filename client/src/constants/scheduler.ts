import type { SchedulerStatus, SchedulerStatusFilter } from '../types/scheduler'

export const schedulerStatusOptions: Array<{ value: SchedulerStatusFilter; label: string }> = [
  { value: 'ALL', label: 'All runs' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'PARTIAL_SUCCESS', label: 'Partial success' },
  { value: 'FAILED', label: 'Failed' },
]

export const schedulerStatusLabels: Record<SchedulerStatus, string> = {
  SUCCESS: 'Success',
  FAILED: 'Failed',
  PARTIAL_SUCCESS: 'Partial success',
}
