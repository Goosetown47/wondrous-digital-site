import { useEffect, useState } from 'react';

export function useCSRFToken() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCSRFToken() {
      try {
        const response = await fetch('/api/csrf');
        if (response.ok) {
          const data = await response.json();
          setCSRFToken(data.token);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCSRFToken();
  }, []);

  const getHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    
    return headers;
  };

  return { csrfToken, loading, getHeaders };
}