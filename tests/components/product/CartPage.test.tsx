import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
const state = vi.hoisted(() => ({ getId: vi.fn(), refetch: vi.fn(), detail: {} as any }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (q: any) => q.queryKey[0] === 'cart' ? state.detail : { data: null }, useQueryClient: () => ({ invalidateQueries: vi.fn() }) }));
vi.mock('@salla.sa/twilight-theme-engine/api/cart', () => ({ cart: { queries: { detail: (id: number) => ({ queryKey: ['cart', id] }) } } }));
vi.mock('@salla.sa/twilight-theme-engine/api/loyalty', () => ({ loyalty: { queries: { points: () => ({ queryKey: ['loyalty'] }) } } }));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({ useTwilight: () => ({ store: { settings: {} } }) }));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({ useTranslation: () => ({ locale: 'en', t: (_key: string, fallback: string) => fallback }) }));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({ HookSlot: () => null, usePageConfig: () => {} }));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({ Breadcrumb: () => null, NoContent: ({ message }: any) => <p>{message}</p> }));
vi.mock('@salla.sa/twilight-theme-engine/cart', () => ({ CartSummary: () => null, SeoCartWidget: () => null }));
vi.mock('@salla.sa/twilight-theme-engine/skeleton', () => ({ CartSkeleton: () => <p>Loading cart</p> }));
vi.mock('@salla.sa/twilight-components-react/conditional-offer', () => ({ SallaConditionalOffer: () => null }));
vi.mock('@salla.sa/twilight-components-react/offer', () => ({ SallaOffer: () => null }));
vi.mock('@salla.sa/twilight-components-react/product-options', () => ({ SallaProductOptions: () => null }));
vi.mock('../../../app/components/cart/CartItem', () => ({ CartItem: () => null }));
import { CartPage } from '../../../app/components/cart/CartPage';
beforeEach(() => {
  state.getId.mockReset().mockResolvedValue(123);
  state.refetch.mockReset();
  state.detail = { data: undefined, isError: false, refetch: state.refetch };
  window.salla = { cart: { api: { getCurrentCartId: state.getId } }, event: { on: vi.fn(), off: vi.fn() } } as never;
});
describe('Cart loading states (isolated SDK)', () => {
  it('shows loading while the cart response is pending', () => {
    render(<CartPage page={{} as never} />);
    expect(screen.getByText('Loading cart')).toBeTruthy();
  });
  it('shows a retry action on a detail request error instead of an endless skeleton', async () => {
    state.detail.isError = true;
    render(<CartPage page={{} as never} />);
    expect(await screen.findByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(state.refetch).toHaveBeenCalledTimes(1);
  });
  it('handles a rejected cart ID request and can recover on retry', async () => {
    state.getId.mockRejectedValueOnce(new Error('offline'));
    render(<CartPage page={{} as never} />);
    expect(await screen.findByRole('alert')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(state.getId).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });
  it('renders empty only for a successful empty response', async () => {
    state.detail.data = { items: [] };
    render(<CartPage page={{} as never} />);
    expect(await screen.findByText('Your cart is empty')).toBeTruthy();
  });
});
