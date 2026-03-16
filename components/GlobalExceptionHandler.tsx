'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export default function GlobalExceptionHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      toast.error("We've experienced a slight hiccup—we will work on this. Please try again.");
    };

    const handleGlobalError = (event: ErrorEvent) => {
      // Don't toast for everything, but log it
      console.error('Global Runtime Error:', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  return null;
}
