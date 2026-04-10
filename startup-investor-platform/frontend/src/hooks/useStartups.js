import { useState, useEffect, useCallback } from 'react';
import { startupAPI } from '../utils/api';

export default function useStartups(initialParams = {}) {
  const [startups, setStartups] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 12, ...initialParams });

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await startupAPI.list(params);
      setStartups(res.data.startups || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load startups');
    } finally { setLoading(false); }
  }, [params]);

  useEffect(() => { fetch(); }, [fetch]);

  return { startups, total, loading, error, params, setParams, refetch: fetch };
}
