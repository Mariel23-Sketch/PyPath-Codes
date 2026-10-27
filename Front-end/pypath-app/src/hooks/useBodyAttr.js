import { useEffect } from 'react';

/* Sets <body data-name="value"> while mounted (some old CSS rules look at body[data-portal="student"]). */
export default function useBodyAttr(name, value) {
  useEffect(() => {
    document.body.dataset[name] = value;
    return () => { delete document.body.dataset[name]; };
  }, [name, value]);
}
