/** Keep links to this store inside the current theme, including local preview. */
export function storeLink(href: string | undefined, storeUrl: string | undefined, locale = 'ar'): string {
  if (!href || href === '#') return '';
  try {
    const base = new URL(storeUrl || 'https://invalid.local');
    const url = new URL(href, base);
    if (!['http:', 'https:'].includes(url.protocol)) return href;
    if (url.hostname.replace(/^www\./, '') !== base.hostname.replace(/^www\./, '')) return href;
    const path = url.pathname.replace(/^\/(ar|en)(?=\/|$)/, '');
    return '/' + locale + (path === '/' ? '' : path) + url.search + url.hash;
  } catch { return href; }
}
