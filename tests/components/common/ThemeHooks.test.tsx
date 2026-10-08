import { describe, it, expect, vi } from 'vitest';
const register = vi.hoisted(() => vi.fn());
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  hookRegistry: { register },
  HookName: { BODY_END: 'body:end', PRODUCT_DESCRIPTION: 'product:single.description' },
}));
vi.mock('../../../app/components/cart', () => ({ AddProductToast: () => null }));
vi.mock('../../../app/components/product', () => ({ DigitalFilesSettings: () => null }));
import { registerThemeHooks } from '../../../app/hooks';

describe('theme hook initialization', () => {
  it('registers only when the router explicitly initializes it', () => {
    expect(register).not.toHaveBeenCalled();
    registerThemeHooks();
    expect(register.mock.calls.map(call => call[0])).toEqual([
      'body:end', 'product:single.description',
    ]);
  });
});
