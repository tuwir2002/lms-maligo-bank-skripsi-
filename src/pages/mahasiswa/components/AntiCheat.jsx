import React, { useEffect, useRef } from 'react';

const AntiCheat = ({ isFullscreen, setIsFullscreen, examRef, handleViolation, setSubmitDialogOpen }) => {
  const lastViolationTime = useRef(0);
  const DEBOUNCE_TIME = 2000; // 2 seconds debounce

  // Helper to check if event is related Electrolyte submit button or dialog
  const isSubmitRelated = (target) => {
    return (
      target.closest('button')?.textContent.includes('Selesai dan Kumpulkan') ||
      target.closest('button')?.textContent.includes('Kumpulkan') ||
      target.closest('button')?.textContent.includes('Batal') ||
      target.closest('[role="dialog"]')
    );
  };

  // Block right-click
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (isSubmitRelated(e.target)) return;
      e.preventDefault();
      handleViolation('Right-click detected');
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [handleViolation]);

  // Block keyboard shortcuts and detect screenshot attempts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSubmitRelated(e.target)) return;
      if (
        e.key === 'PrintScreen' ||
        e.key === 'F12' ||
        e.ctrlKey ||
        e.altKey ||
        (e.ctrlKey && ['c', 'v', 't', 'n', 'u'].includes(e.key.toLowerCase())) ||
        (e.metaKey && ['c', 'v'].includes(e.key.toLowerCase())) // MacOS Cmd+C, Cmd+V
      ) {
        e.preventDefault();
        handleViolation(
          e.key === 'PrintScreen' ? 'Screenshot attempt detected' : `Keyboard shortcut detected: ${e.key}`
        );
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleViolation]);

  // Detect tab switching or window focus change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('Tab switch detected');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleViolation]);

  // Enforce fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
        handleViolation('Exited fullscreen mode');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, setIsFullscreen, handleViolation]);

  // Detect DevTools opening (basic heuristic)
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        const now = Date.now();
        if (now - lastViolationTime.current < DEBOUNCE_TIME) return;
        lastViolationTime.current = now;
        handleViolation('DevTools opening detected');
      }
    };
    const interval = setInterval(detectDevTools, 1000);
    return () => clearInterval(interval);
  }, [handleViolation]);

  // Ensure submit button is clickable
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.closest('button')?.textContent.includes('Selesai dan Kumpulkan')) {
        setSubmitDialogOpen(true);
      }
    };
    const examElement = examRef.current;
    if (examElement) {
      examElement.addEventListener('click', handleClick);
      return () => examElement.removeEventListener('click', handleClick);
    }
  }, [examRef, setSubmitDialogOpen]);

  return null;
};

export default AntiCheat;