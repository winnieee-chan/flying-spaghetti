/**
 * API Configuration
 *
 * Controls whether to use mock data or real backend API.
 * Toggle via VITE_USE_MOCKS environment variable.
 */

// Vite environment interface
interface ImportMetaEnv {
  readonly VITE_USE_MOCKS?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const importMeta: ImportMeta;
const env = (import.meta as unknown as ImportMeta).env;

// Default to mocks in development, real API in production
export const USE_MOCKS =
  env.VITE_USE_MOCKS === "true" ||
  (env.VITE_USE_MOCKS !== "false" && env.DEV);

// Backend API base URL
export const API_BASE_URL =
  env.VITE_API_BASE_URL || "http://localhost:3001/api";

// Simulated latency range for mocks (ms)
export const MOCK_LATENCY_MIN = 100;
export const MOCK_LATENCY_MAX = 400;

