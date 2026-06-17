import { useEffect, useState } from 'react';

/**
 * Returns different values on the server and client.
 * This is used to prevent hydration mismatches in React Navigation.
 */
export function useClientOnlyValue<T>(serverValue: T, clientValue: T): T {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? clientValue : serverValue;
}
