'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="size-10 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-black/5 dark:border-white/10" />
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}
      className="relative size-10 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-black/5 dark:border-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group overflow-hidden"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {currentTheme === 'light' ? (
          <motion.div
            key="sun"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={20} className="text-orange-500" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={20} className="text-indigo-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
