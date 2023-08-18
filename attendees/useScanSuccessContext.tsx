import { createContext, useContext } from 'react';

export const ScanSuccessContext = createContext(null);

export const useScanSuccessContext = () => {
  return useContext(ScanSuccessContext);
};
