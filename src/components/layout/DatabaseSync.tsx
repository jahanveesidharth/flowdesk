import { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function DatabaseSync() {
  const initSupabaseSync = useAppStore(s => s.initSupabaseSync);

  useEffect(() => {
    const unsubscribe = initSupabaseSync();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initSupabaseSync]);

  return null;
}
