import { useEffect } from 'react';

// The old pages set <body class="auth"> / <body data-active="..."> in their HTML.
export default function useBodyClass(cls) {
  useEffect(() => {
    if (!cls) return undefined;
    document.body.classList.add(cls);
    return () => document.body.classList.remove(cls);
  }, [cls]);
}
