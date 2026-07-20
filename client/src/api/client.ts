export type ApiEnvelope<TData> = {
  success: boolean
  message?: string
  data?: TData
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '')

function buildHeaders(headers?: HeadersInit) {
  const mergedHeaders = new Headers(headers)

  if (!mergedHeaders.has('Accept')) {
    mergedHeaders.set('Accept', 'application/json')
  }

  return mergedHeaders
}

export async function apiRequest<TData>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers),
  })

  const body = (await response.json().catch(() => null)) as ApiEnvelope<TData> | null

  if (!response.ok || !body?.success) {
    throw new Error(body?.message ?? `Request failed with status ${response.status}`)
  }

  return body.data as TData
}
