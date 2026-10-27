import { useSyncExternalStore } from 'react';
import { theme } from '../services/theme';

/* Returns the resolved theme ('light' | 'dark'); re-renders when it changes. */
export default function useTheme() {
  return useSyncExternalStore(theme.subscribe, theme.current);
}
