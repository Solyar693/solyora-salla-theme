import { useEffect } from 'react';
import { useNavigate } from '@salla.sa/twilight-theme-engine/providers';

/** The SDK's Enter handler assigns the published store URL. Use the theme
 * router instead, preserving its locale and local-preview store base. */
export function SearchNavigation() {
  const navigate = useNavigate();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.isComposing || event.defaultPrevented) return;
      const input = event.composedPath().find(node =>
        node instanceof HTMLInputElement && node.matches('input.s-search-input')
      ) as HTMLInputElement | undefined;
      if (!input || !input.closest('salla-search, .s-search-modal')) return;
      const query = input.value.trim();
      event.preventDefault();
      event.stopPropagation();
      if (!query) return;
      const modal = input.closest('salla-modal') as (HTMLElement & { close?: () => Promise<void> }) | null;
      void modal?.close?.();
      navigate(`/search?q=${encodeURIComponent(query)}`);
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [navigate]);
  return null;
}
