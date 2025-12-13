/**
 * Mock API Adapter
 *
 * Provides mock API responses for development and testing.
 */

import type { ApiAdapter } from "../../types";
import { handleGet, handlePost, handlePut, handleDelete } from "../mocks/handlers";

export const mockAdapter: ApiAdapter = {
  async get<T = unknown>(path: string): Promise<T> {
    try {
      return await handleGet<T>(path);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`API GET ${path}: ${message}`);
    }
  },

  async post<T = unknown>(
    path: string,
    body: Record<string, unknown> = {}
  ): Promise<T> {
    try {
      return await handlePost<T>(path, body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`API POST ${path}: ${message}`);
    }
  },

  async put<T = unknown>(
    path: string,
    body: Record<string, unknown> = {}
  ): Promise<T> {
    try {
      return await handlePut<T>(path, body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`API PUT ${path}: ${message}`);
    }
  },

  async delete<T = unknown>(path: string): Promise<T> {
    try {
      return await handleDelete<T>(path);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`API DELETE ${path}: ${message}`);
    }
  },
};

