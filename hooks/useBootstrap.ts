import { useEffect } from 'react';

import { useAuthStore } from '../store/authStore';

export function useBootstrap() {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);
}
