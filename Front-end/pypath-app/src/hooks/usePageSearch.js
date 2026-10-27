import { createContext, useContext, useEffect } from 'react';

/* The top-bar search box is part of the shell; a page can take over what Enter does
   (the old PP.onGlobalSearch). The shell provides this ref. */
export const SearchCtx = createContext({ current: null });

/* usePageSearch(fn): while this page is mounted, pressing Enter in the top search box calls fn(query) */
export function usePageSearch(fn) {
  const ref = useContext(SearchCtx);
  useEffect(() => {
    ref.current = fn;
    return () => { if (ref.current === fn) ref.current = null; };
  }, [ref, fn]);
}
