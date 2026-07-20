export type SchedulerStatus = 'SUCCESS' | 'FAILED' | 'PARTIAL_SUCCESS'
export type SchedulerStatusFilter = 'ALL' | SchedulerStatus

export type SchedulerLog = {
  _id?: string
  startedAt: string
  endedAt: string
  durationInMs: number
  totalOrdersChecked: number
  totalOrdersUpdated: number
  failedOrders: number
  status: SchedulerStatus
  errorMessage?: string
  createdAt?: string
}
