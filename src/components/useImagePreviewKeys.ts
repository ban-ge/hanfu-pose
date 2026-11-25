import { useEffect, useRef } from 'react';

export function useImagePreviewKeys(enabled: boolean, onNavigate: (direction: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="slider"], [role="tablist"], [role="listbox"]')) return;
      const root = ref.current;
      if (!root) return;
      const dialog = target?.closest('[role="dialog"], [role="alertdialog"]');
      if (dialog && !dialog.contains(root)) return;
      if (!dialog && document.querySelector('[aria-modal="true"]') && !root.closest('[aria-modal="true"]')) return;
      event.preventDefault();
      onNavigate(event.key === 'ArrowLeft' ? -1 : 1);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [enabled, onNavigate]);
  return ref;
}
