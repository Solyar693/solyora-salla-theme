import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('@tanstack/react-router', () => ({ createFileRoute: () => (options: unknown) => ({ options }) }));
vi.mock('@salla.sa/twilight-theme-engine/routes/account', () => ({ Wishlist: { loader: vi.fn(), Component: () => null } }));
vi.mock('@salla.sa/twilight-theme-engine/skeleton', () => ({ CustomerPageSkeleton: () => null }));
vi.mock('@salla.sa/twilight-theme-engine/tanstack', () => ({ withHead: () => undefined }));
import { Route } from '../../../app/routes/account.wishlist';
import { Wishlist } from '@salla.sa/twilight-theme-engine/routes/account';
const options = (Route as unknown as { options: any }).options;
beforeEach(() => vi.mocked(Wishlist.loader).mockReset());
describe('Wishlist route delegation', () => {
  it('uses the official loader with the requested locale and page', async () => {
    const payload = { wishlist: { items: [] } };
    vi.mocked(Wishlist.loader).mockResolvedValueOnce(payload as never);
    const search = options.validateSearch({ page: '2' });
    expect(await options.loader({ deps: options.loaderDeps({ search }), params: { locale: 'ar' } })).toBe(payload);
    expect(Wishlist.loader).toHaveBeenCalledExactlyOnceWith({ search: { page: 2 }, locale: 'ar' });
  });
  it('preserves an authentication rejection instead of fabricating an empty list', async () => {
    const denied = Object.assign(new Error('Unauthorized'), { status: 401 });
    vi.mocked(Wishlist.loader).mockRejectedValueOnce(denied);
    await expect(options.loader({ deps: {}, params: { locale: 'ar' } })).rejects.toBe(denied);
  });
});
