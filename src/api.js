let activeFetchPromise = null;

// --- UTILITAIRE INDEXEDDB ---
const DB_NAME = 'DublajeVFQ_DB';
const STORE_NAME = 'app_store';
const DATA_KEY = 'app_data';
const VERSION_KEY = 'app_version';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getFromIDB(key) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function setToIDB(key, value) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
// -----------------------------

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
    let cachedData = null;
    let localVersion = null;

    try {
      cachedData = await getFromIDB(DATA_KEY);
      localVersion = await getFromIDB(VERSION_KEY);
    } catch (e) {
      console.warn("Error reading from IndexedDB:", e);
    }

    try {
      // Always fetch tiny version check with cache buster
      const versionRes = await fetch(`./version.json?t=${Date.now()}`);
      const remoteMeta = await versionRes.json();

      // 3. CHECK: If local version matches remote version AND we have cached data, use cache!
      if (localVersion && String(localVersion) === String(remoteMeta.version) && cachedData) {
        console.log("⚡ Version matches! Using IndexedDB cache (0 MB heavy bandwidth used).");
        return cachedData;
      }

      // 4. Otherwise, fetch the 4.2 MB data file
      console.log("🔄 New version detected or first load. Fetching fresh 4.2 MB data.json...");
      const dataRes = await fetch('./data.json');
      const freshData = await dataRes.json();

      // Save to IndexedDB (No 5MB limit!)
      try {
        await setToIDB(DATA_KEY, freshData);
        await setToIDB(VERSION_KEY, String(remoteMeta.version));
      } catch (e) {
        console.warn("IndexedDB write restriction:", e);
      }

      return freshData;

    } catch (error) {
      console.warn("Failed to check version/data, falling back to local cache", error);
      if (cachedData) return cachedData;
      throw error;
    } finally {
      // Release the lock
      activeFetchPromise = null;
    }
  })();

  return activeFetchPromise;
}