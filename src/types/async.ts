export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T, E = unknown> {
  status: AsyncStatus
  data: T | null
  error: E | null
}
