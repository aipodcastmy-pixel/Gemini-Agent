import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'AgentDB';
const STORE_NAME = 'agentStore';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject('Error opening IndexedDB.');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = request.result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

export const useIndexedDB = () => {
  const [data, setData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const dbInstance = await openDB();
      const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const result: Record<string, any> = {};
        getAllRequest.result.forEach((item: { key: string; value: any }) => {
          result[item.key] = item.value;
        });
        setData(result);
      };

      getAllRequest.onerror = () => {
        setError('Could not fetch all data from IndexedDB.');
      };
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const writeData = useCallback(async (key: string, value: any): Promise<string> => {
    try {
      const dbInstance = await openDB();
      const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ key, value });

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          refreshData();
          resolve(`Successfully stored data with key '${key}'.`);
        };
        request.onerror = () => {
          reject(`Error storing data with key '${key}'.`);
        };
      });
    } catch (err) {
      return Promise.reject((err as Error).message);
    }
  }, [refreshData]);

  const readData = useCallback(async (key: string): Promise<string> => {
    try {
        const dbInstance = await openDB();
        const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
    
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                if (request.result) {
                    resolve(JSON.stringify(request.result.value, null, 2));
                } else {
                    resolve(`No data found for key '${key}'.`);
                }
            };
            request.onerror = () => {
                reject(`Error reading data for key '${key}'.`);
            };
        });
    } catch (err) {
        return Promise.reject((err as Error).message);
    }
  }, []);

  const deleteData = useCallback(async (key: string): Promise<string> => {
    try {
        const dbInstance = await openDB();
        const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                refreshData();
                resolve(`Successfully deleted data with key '${key}'.`);
            };
            request.onerror = () => {
                reject(`Error deleting data with key '${key}'.`);
            };
        });
    } catch (err) {
        return Promise.reject((err as Error).message);
    }
  }, [refreshData]);

  const getAllKeys = useCallback(async (): Promise<string> => {
    try {
        const dbInstance = await openDB();
        const transaction = dbInstance.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAllKeys();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const keys = request.result as string[];
                if (keys.length === 0) {
                    resolve("IndexedDB is currently empty.");
                } else {
                    resolve(`Available keys: ${keys.join(', ')}`);
                }
            };
            request.onerror = () => {
                reject('Error fetching keys from IndexedDB.');
            };
        });
    } catch(err) {
        return Promise.reject((err as Error).message);
    }
  }, []);

  const clearDB = useCallback(async () => {
    try {
        const dbInstance = await openDB();
        const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        return new Promise<void>((resolve, reject) => {
            request.onsuccess = () => {
                refreshData();
                resolve();
            };
            request.onerror = () => {
                reject('Error clearing IndexedDB.');
            };
        });
    } catch(err) {
        setError((err as Error).message);
    }
  }, [refreshData]);

  return { data, error, writeData, readData, deleteData, getAllKeys, clearDB };
};
