/**
 * Store Helpers
 *
 * Shared utilities for Zustand stores to reduce boilerplate.
 */

import type { StoreApi } from "zustand";

// ============================================================================
// Types
// ============================================================================

export interface AsyncState {
  loading: boolean;
  error: string | null;
}

type SetState<T> = StoreApi<T>["setState"];

// ============================================================================
// Async Action Helper
// ============================================================================

/**
 * Wraps an async action with loading/error state management.
 * Reduces boilerplate for try/catch/loading patterns in stores.
 *
 * @example
 * ```ts
 * fetchData: async () => {
 *   return asyncAction(set, async () => {
 *     const data = await api.get<Data[]>("/data");
 *     set({ data });
 *     return data;
 *   });
 * }
 * ```
 */
export async function asyncAction<T extends AsyncState, R>(
  set: SetState<T>,
  action: () => Promise<R>
): Promise<R> {
  set({ loading: true, error: null } as Partial<T>);
  try {
    const result = await action();
    set({ loading: false } as Partial<T>);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    set({ error: errorMessage, loading: false } as Partial<T>);
    throw error;
  }
}

/**
 * Same as asyncAction but doesn't throw - returns undefined on error.
 * Useful for actions where you don't need to handle the error in the caller.
 */
export async function asyncActionSafe<T extends AsyncState, R>(
  set: SetState<T>,
  action: () => Promise<R>
): Promise<R | undefined> {
  try {
    return await asyncAction(set, action);
  } catch {
    return undefined;
  }
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Clear error state
 */
export function clearError<T extends AsyncState>(set: SetState<T>): void {
  set({ error: null } as Partial<T>);
}

/**
 * Set error state
 */
export function setError<T extends AsyncState>(
  set: SetState<T>,
  error: string
): void {
  set({ error, loading: false } as Partial<T>);
}

