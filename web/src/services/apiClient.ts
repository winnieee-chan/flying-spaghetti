/**
 * API Client
 *
 * Main API client that delegates to the appropriate adapter based on configuration.
 * Toggle between mock and real API via VITE_USE_MOCKS environment variable.
 */

import type { ApiAdapter } from "../types";
import { USE_MOCKS } from "./config";
import { mockAdapter } from "./adapters/mockAdapter";
import { httpAdapter } from "./adapters/httpAdapter";

// Select adapter based on configuration
const adapter: ApiAdapter = USE_MOCKS ? mockAdapter : httpAdapter;

// Log which mode is active in development
const isDev = typeof process !== "undefined" && process.env?.NODE_ENV === "development";
if (isDev || USE_MOCKS) {
  console.log(`[API] Using ${USE_MOCKS ? "mock" : "HTTP"} adapter`);
}

export const api: ApiAdapter = adapter;

// Re-export config for convenience
export { USE_MOCKS, API_BASE_URL } from "./config";

