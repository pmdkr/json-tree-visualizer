// src/hooks/useTheme.js
import { useState, useEffect } from 'react';

const updateDocumentTheme = (isDark) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', isDark);
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light';
    setTheme(savedTheme);
    updateDocumentTheme(savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateDocumentTheme(newTheme === 'dark');
  };

  return { theme, toggleTheme };
};