// Performance utilities untuk SOP management
import React from "react";
import prisma from "@/lib/prisma";

/**
 * Lazy load Mammoth.js on demand untuk mengurangi bundle size
 */
export async function importMammoth() {
  const { default: mammoth } = await import("mammoth");
  return mammoth;
}

/**
 * Convert DOCX ke HTML dengan async import
 */
export async function convertDocxToHtml(arrayBuffer: ArrayBuffer): Promise<string> {
  const mammoth = await importMammoth();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}

/**
 * Simple request cache untuk deduplication
 * Prevents multiple requests untuk data yang sama
 */
class RequestCache {
  private cache = new Map<string, Promise<any>>();

  async fetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key) as Promise<T>;
    }
    const promise = fetcher();
    this.cache.set(key, promise);
    // Auto cleanup setelah 5 menit
    setTimeout(() => this.cache.delete(key), 5 * 60 * 1000);
    return promise;
  }

  clear() {
    this.cache.clear();
  }
}

export const globalRequestCache = new RequestCache();

/**
 * Debounce hook untuk mengurangi API calls
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Efficient pagination handler untuk infinite scroll
 */
export class PaginationHandler {
  private currentPage = 0;
  private pageSize: number;
  private totalItems: number;

  constructor(pageSize: number = 20, totalItems: number = 0) {
    this.pageSize = pageSize;
    this.totalItems = totalItems;
  }

  getNextRange(): [number, number] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize - 1;
    this.currentPage++;
    return [start, end];
  }

  hasMore(): boolean {
    return this.currentPage * this.pageSize < this.totalItems;
  }

  reset() {
    this.currentPage = 0;
  }
}

/**
 * Batch query untuk mengambil multiple SOPs sekaligus
 */
export async function batchFetchSops(
  ids: string[],
  columns: string[] = ["id", "judul", "toko", "updatedAt"]
): Promise<any[]> {
  if (ids.length === 0) return [];
  
  const data = await prisma.sop.findMany({
    where: { id: { in: ids } },
    select: columns.reduce((acc, col) => ({ ...acc, [col]: true }), {})
  });
  
  return data || [];
}

/**
 * Optimized search dengan full-text capability
 */
export async function searchSops(
  query: string,
  filters?: {
    store?: string;
    role?: string;
  }
) {
  const data = await prisma.sop.findMany({
    where: {
      ...(query ? { judul: { contains: query } } : {}),
      ...(filters?.store ? { toko: filters.store } : {})
    },
    select: { id: true, judul: true, toko: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 50
  });

  return data;
}
