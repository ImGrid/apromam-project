/**
 * Hook para detectar si el navegador tiene conexión a internet
 * Retorna true si hay conexión, false si no
 *
 * Siguiendo mejores prácticas:
 * - SSR-safe (verifica si navigator existe)
 * - Cleanup de event listeners
 * - Logging para debugging
 */

import { useEffect, useState } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    // SSR-safe: Verificar si navigator existe
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      console.log('[Network] ✅ Conexión recuperada');
    }

    function handleOffline() {
      setIsOnline(false);
      console.log('[Network] ❌ Sin conexión');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup: remover listeners al desmontar
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
