interface CacheEntry {
  value: any;
  expiresAt: number;
}

// Dùng globalThis để giữ cache instance không bị reload/khởi tạo lại trong quá trình Next.js HMR
const globalWithCache = globalThis as unknown as {
  inMemoryCacheInstance?: Map<string, CacheEntry>;
};

if (!globalWithCache.inMemoryCacheInstance) {
  globalWithCache.inMemoryCacheInstance = new Map<string, CacheEntry>();
}

const cache = globalWithCache.inMemoryCacheInstance;

export const memoryCache = {
  get<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }

    return entry.value as T;
  },

  set(key: string, value: any, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    cache.set(key, { value, expiresAt });
  },

  delete(key: string): void {
    cache.delete(key);
  },

  clear(): void {
    cache.clear();
  },

  // Xóa các key bắt đầu bằng một tiền tố cụ thể (ví dụ: "exams:")
  deletePattern(prefix: string): void {
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key);
      }
    }
  }
};
