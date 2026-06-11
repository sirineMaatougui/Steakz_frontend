import { useState, useEffect, useCallback } from 'react';
import { getData, apiError } from './api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}

/** GET a URL through the API envelope with loading / error / refetch state. */
export function useApi<T>(url: string | null): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setData(await getData<T>(url));
      setError('');
    } catch (e) {
      setError(apiError(e));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
