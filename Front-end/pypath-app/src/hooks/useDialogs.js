import { createContext, useContext } from 'react';

export const DialogCtx = createContext(null);

/* const { confirm, message } = useDialogs();  if (await confirm({ title, text })) ... */
export const useDialogs = () => useContext(DialogCtx);
