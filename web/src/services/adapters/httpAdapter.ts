/**
 * HTTP API Adapter
 *
 * Real HTTP client for connecting to the backend API.
 */

import type { ApiAdapter } from "../../types";
import { API_BASE_URL } from "../config";

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const httpAdapter: ApiAdapter = {
  async get<T = unknown>(path: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return handleResponse<T>(response);
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
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      return handleResponse<T>(response);
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
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      return handleResponse<T>(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`API PUT ${path}: ${message}`);
    }
  },

  async delete<T = unknown>(path: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return handleResponse<T>(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`API DELETE ${path}: ${message}`);
    }
  },
};

