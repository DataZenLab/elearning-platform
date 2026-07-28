import type { StrapiResponse, StrapiSingleResponse } from '@/types';

import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN || '';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  token?: string;
}

/**
 * Strapi API client with built-in auth and error handling
 */
class StrapiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const authToken = token || STRAPI_TOKEN;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    const url = new URL(`/api${endpoint}`, this.baseUrl);
    if (params && Object.keys(params).length > 0) {
      const queryString = qs.stringify(params, {
        encodeValuesOnly: true, // prettify URL
      });
      url.search = queryString;
    }
    return url.toString();
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: Pick<RequestOptions, 'cache' | 'next' | 'token'>
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(options?.token),
      cache: options?.cache,
      next: options?.next,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No error body');
      throw new Error(`Strapi GET ${endpoint} failed: ${res.status} ${res.statusText} - ${errorText}`);
    }

    return res.json();
  }

  async post<T>(endpoint: string, data: unknown, options?: Pick<RequestOptions, 'token'>): Promise<T> {
    const url = this.buildUrl(endpoint);
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(options?.token),
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No error body');
      throw new Error(`Strapi POST ${endpoint} failed: ${res.status} ${res.statusText} - ${errorText}`);
    }

    return res.json();
  }

  async put<T>(endpoint: string, data: unknown, options?: Pick<RequestOptions, 'token'>): Promise<T> {
    const url = this.buildUrl(endpoint);
    const res = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(options?.token),
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No error body');
      throw new Error(`Strapi PUT ${endpoint} failed: ${res.status} ${res.statusText} - ${errorText}`);
    }

    return res.json();
  }

  async delete(endpoint: string, options?: Pick<RequestOptions, 'token'>): Promise<void> {
    const url = this.buildUrl(endpoint);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(options?.token),
    });

    if (!res.ok) {
      throw new Error(`Strapi DELETE ${endpoint} failed: ${res.status} ${res.statusText}`);
    }
  }

  // Convenience methods for typed responses
  async findMany<T>(
    contentType: string,
    params?: Record<string, unknown>,
    options?: Pick<RequestOptions, 'cache' | 'next' | 'token'>
  ): Promise<StrapiResponse<T[]>> {
    return this.get<StrapiResponse<T[]>>(`/${contentType}`, params, options);
  }

  async findOne<T>(
    contentType: string,
    documentId: string,
    params?: Record<string, unknown>,
    options?: Pick<RequestOptions, 'cache' | 'next' | 'token'>
  ): Promise<StrapiSingleResponse<T>> {
    return this.get<StrapiSingleResponse<T>>(`/${contentType}/${documentId}`, params, options);
  }
}

export const strapi = new StrapiClient(STRAPI_URL);
export { STRAPI_URL };
