import { describe, it, expect } from 'vitest';
import { storeLink } from '../../../app/components/common/storeLink';

describe('storeLink across custom and hosted store domains', () => {
  it('does not duplicate a hosted store base in product links', () => {
    expect(storeLink('https://demostore.salla.sa/dev-test/dress/p42', 'https://demostore.salla.sa/dev-test/'))
      .toBe('/ar/dress/p42');
  });
  it('preserves query and fragment while replacing locale', () => {
    expect(storeLink('https://demostore.salla.sa/ar/dev-test/dress/p42?q=a#size', 'https://demostore.salla.sa/dev-test/', 'en'))
      .toBe('/en/dress/p42?q=a#size');
  });
  it('keeps links to other stores on a shared domain external', () => {
    const href = 'https://demostore.salla.sa/other/dress/p42';
    expect(storeLink(href, 'https://demostore.salla.sa/dev-test/')).toBe(href);
  });
  it('supports merchant relative category links without inventing a category', () => {
    expect(storeLink('/-/c42', 'https://demostore.salla.sa/dev-test/')).toBe('/ar/-/c42');
  });
  it('keeps custom-domain routes working', () => {
    expect(storeLink('https://www.example.com/en/bag/p42', 'https://example.com', 'ar')).toBe('/ar/bag/p42');
  });
  it('preserves external/contact links and omits an empty CTA', () => {
    expect(storeLink('https://elsewhere.test/page', 'https://example.com')).toBe('https://elsewhere.test/page');
    expect(storeLink('tel:123', 'https://example.com')).toBe('tel:123');
    expect(storeLink('#', 'https://example.com')).toBe('');
  });
});
