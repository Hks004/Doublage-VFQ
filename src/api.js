let activeFetchPromise = null;

export async function getAppData() {
  // 1. IF LOCAL DEV: Skip caching
  if (import.meta.env.DEV) {
    const res = await fetch('./data.json');
    return await res.json();
  }

  // 2. REQUEST LOCK: Prevent simultaneous duplicate fetches
  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  activeFetchPromise = (async () => {
    const CACHE_KEY = 'app_data_v1';
    const VERSION_KEY = 'app_version_v1';
    const cachedData = localStorage.getItem(CACHE_KEY);
    const localVersion = localStorage.getItem(VERSION_KEY);

    try {
      // Always fetch tiny version check with cache buster
      const versionRes = await fetch(`./version.json?t=${Date.now()}`);
      const remoteMeta = await versionRes.json();

      // 3. CHECK: If local version matches remote version AND we have cached data, use cache!
      if (localVersion && String(localVersion) === String(remoteMeta.version) && cachedData) {
        console.log("⚡ Version matches! Using local cache (0 MB heavy bandwidth used).");
        return JSON.parse(cachedData);
      }

      // 4. Otherwise, fetch the 4.2 MB data file
      console.log("🔄 New version detected or first load. Fetching fresh 4.2 MB data.json...");
      const dataRes = await fetch('./data.json');
      const freshData = await dataRes.json();

      // Save to localStorage
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
        localStorage.setItem(VERSION_KEY, String(remoteMeta.version));
      } catch (e) {
        console.warn("Storage quota or private mode restriction:", e);
      }

      return freshData;

    } catch (error) {
      console.warn("Failed to check version/data, falling back to local cache", error);
      if (cachedData) return JSON.parse(cachedData);
      throw error;
    } finally {
      // Release the lock
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
}