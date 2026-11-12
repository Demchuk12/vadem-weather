export type ApiErrorCode =
  'network' | 'unauthorized' | 'not_found' | 'rate_limit' | 'server' | 'aborted'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number | null

  constructor(code: ApiErrorCode, message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export type QueryParams = Record<string, string | number | boolean | undefined>

export function buildUrl(base: string, params: QueryParams = {}): string {
  const url = new URL(base)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  return url.toString()
}

function codeFromStatus(status: number): ApiErrorCode {
  if (status === 401 || status === 403) return 'unauthorized'
  if (status === 404) return 'not_found'
  if (status === 429) return 'rate_limit'
  return 'server'
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof ApiError && error.code === 'aborted')
  )
}

export async function getJson<T>(url: string, init: { signal?: AbortSignal } = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { signal: init.signal, headers: { Accept: 'application/json' } })
  } catch (error) {
    if (isAbortError(error)) throw new ApiError('aborted', 'Request aborted')
    throw new ApiError('network', error instanceof Error ? error.message : 'Network error')
  }

  if (!response.ok) {
    let message = response.statusText
    try {
      const body = (await response.json()) as { message?: string }
      if (body?.message) message = body.message
    } catch {}
    throw new ApiError(codeFromStatus(response.status), message, response.status)
  }

  return (await response.json()) as T
}
