import { useEffect } from 'react';

export const useTitle = (title) => {
  useEffect(() => {
    document.title = `${title} | OfficeLink`;
    
    return () => {
      document.title = 'OfficeLink';
    };
  }, [title]);
};