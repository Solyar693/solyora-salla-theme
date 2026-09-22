import { describe, it, expect, vi } from 'vitest';
vi.mock('@tanstack/react-router', () => ({ createFileRoute: () => (options: unknown) => ({ options }) }));
vi.mock('@salla.sa/twilight-theme-engine/routes/product-listing', () => ({ ProductListing: { loader: vi.fn(async (input) => input) } }));
vi.mock('@salla.sa/twilight-theme-engine/tanstack', () => ({ withHead: () => undefined }));
vi.mock('../../../app/components/product/ProductListPage', () => ({ ProductListPage: () => null }));
vi.mock('../../../app/components/product/ProductListSkeleton', () => ({ ProductListSkeleton: () => null }));
import { Route } from '../../../app/routes/search-page';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
const options = (Route as unknown as { options: any }).options;
describe('Search route', () => {
  it('preserves query, sort and pagination through to the Salla loader', async () => {
    const search = options.validateSearch({ q: 'bag', sort: 'price-asc', page: '2' });
    await options.loader({ deps: options.loaderDeps({ search }), params: { locale: 'ar' } });
    expect(ProductListing.loader).toHaveBeenLastCalledWith({ params: { source: 'search' }, search: { q: 'bag', sort: 'price-asc', page: 2 }, locale: 'ar' });
  });
  it('rejects malformed query values and invalid page numbers', () => {
    expect(options.validateSearch({ q: {}, sort: [], page: Infinity })).toEqual({ q: '' });
    expect(options.validateSearch({ page: -4 })).toEqual({ q: '' });
  });
});
