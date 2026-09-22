/** Keep links to this store inside the current theme, including local preview. */
export function storeLink(href: string | undefined, storeUrl: string | undefined, locale = 'ar'): string {
  if (!href || href === '#') return '';
  try {
    const base = new URL(storeUrl || 'https://invalid.local');
    const url = new URL(href, base);
    if (!['http:', 'https:'].includes(url.protocol)) return href;
    if (url.hostname.replace(/^www\./, '') !== base.hostname.replace(/^www\./, '')) return href;
    let path = url.pathname.replace(/^\/(ar|en)(?=\/|$)/, '');
    const storePath = base.pathname.replace(/^\/(ar|en)(?=\/|$)/, '').replace(/\/$/, '');
    // Hosted demo/Salla stores include their username in the public URL.
    // The theme router adds that base itself; retaining it here duplicates it.
    if (storePath && (path === storePath || path.startsWith(storePath + '/'))) {
      path = path.slice(storePath.length) || '/';
    } else if (storePath && /^(https?:)?\/\//.test(href)) {
      // Another store on the same shared Salla host is still an external link.
      return href;
    }
    return '/' + locale + (path === '/' ? '' : path) + url.search + url.hash;
  } catch { return href; }
}
