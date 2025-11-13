class CacheManager {
  constructor(ttl = 300000) { // Default TTL: 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    const item = {
      value,
      timestamp: Date.now()
    };
    this.cache.set(key, item);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

export default CacheManager;