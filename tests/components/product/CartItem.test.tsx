import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({ useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }) }));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({ useMoney: () => ({ format: (value: number) => String(value) }) }));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({ Link: ({ to, children }: any) => <a href={to}>{children}</a>, Image: (props: any) => <img src={props.src} alt={props.alt} /> }));
vi.mock('@salla.sa/twilight-components-react/cart-item-offers', () => ({ SallaCartItemOffers: () => null }));
import { CartItem } from '../../../app/components/cart/CartItem';
const updateItem = vi.fn();
const deleteItem = vi.fn();
const onMutated = vi.fn();
const item = { id: 71, product_id: 42, product_name: 'Fixture', url: '/fixture/p42', quantity: 2, max_quantity: 5, is_available: true, price: 30, total: 60 } as never;
beforeEach(() => {
  vi.useFakeTimers();
  updateItem.mockReset().mockResolvedValue({});
  deleteItem.mockReset().mockResolvedValue({});
  onMutated.mockReset();
  window.salla = { cart: { updateItem, deleteItem } } as never;
});
afterEach(() => vi.useRealTimers());
const settle = () => act(async () => { await vi.advanceTimersByTimeAsync(400); });
describe('Cart row SDK interactions (no network)', () => {
  it('shows the server stock validation reason and restores the confirmed quantity', async () => {
    updateItem.mockRejectedValueOnce({ response: { data: { error: { message: 'Only one item is available' } } } });
    render(<CartItem item={item} onMutated={onMutated} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quantity +' }));
    await settle();
    expect(screen.getByRole('alert').textContent).toBe('Only one item is available');
    expect((screen.getByLabelText('Quantity') as HTMLInputElement).value).toBe('2');
    expect(onMutated).not.toHaveBeenCalled();
  });
  it('preserves selected variant options and notes when changing quantity', async () => {
    updateItem.mockImplementation(async (payload: FormData) => {
      if (payload.get('options[12]') !== '44') throw new Error('Required size missing');
      return {};
    });
    const { container } = render(<CartItem item={item} onMutated={onMutated} />);
    const form = container.querySelector('form')!;
    const size = document.createElement('select');
    size.name = 'options[12]';
    size.innerHTML = '<option value="44" selected>XL - 44</option>';
    form.appendChild(size);
    const note = document.createElement('input');
    note.name = 'notes';
    note.value = 'Gift wrapping';
    form.appendChild(note);
    fireEvent.click(screen.getByRole('button', { name: 'Quantity +' }));
    await settle();
    expect(Object.fromEntries(updateItem.mock.calls[0][0])).toEqual({
      id: '71', quantity: '3', 'options[12]': '44', notes: 'Gift wrapping',
    });
    expect(onMutated).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('reports an unavailable SDK instead of pretending an update succeeded', async () => {
    delete (window as unknown as { salla?: unknown }).salla;
    render(<CartItem item={item} onMutated={onMutated} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quantity +' }));
    await settle();
    expect((screen.getByLabelText('Quantity') as HTMLInputElement).value).toBe('2');
    expect(screen.getByRole('alert').textContent).toContain('Unable to update');
    expect(onMutated).not.toHaveBeenCalled();
  });

  it('debounces rapid quantity changes into one SDK call with the real row ID', async () => {
    render(<CartItem item={item} onMutated={onMutated} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quantity +' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quantity +' }));
    await settle();
    expect(updateItem).toHaveBeenCalledTimes(1);
    expect(Object.fromEntries(updateItem.mock.calls[0][0])).toEqual({ id: '71', quantity: '4' });
    expect(onMutated).toHaveBeenCalledTimes(1);
  });
  it('respects stock limits', async () => {
    render(<CartItem item={item} onMutated={onMutated} />);
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '999' } });
    await settle();
    expect(updateItem).toHaveBeenCalledTimes(1);
    expect(Object.fromEntries(updateItem.mock.calls[0][0])).toEqual({ id: '71', quantity: '5' });
    expect((screen.getByRole('button', { name: 'Quantity +' }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('rolls back a failed quantity change to the server value', async () => {
    updateItem.mockRejectedValueOnce(new Error('stock changed'));
    render(<CartItem item={item} onMutated={onMutated} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quantity +' }));
    await settle();
    expect((screen.getByLabelText('Quantity') as HTMLInputElement).value).toBe('2');
    expect(onMutated).not.toHaveBeenCalled();
  });
  it('cancels pending quantity updates when removing a row', async () => {
    render(<CartItem item={item} onMutated={onMutated} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quantity +' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove from the cart' }));
    await settle();
    expect(deleteItem).toHaveBeenCalledExactlyOnceWith('71');
    expect(updateItem).not.toHaveBeenCalled();
  });
  it('restores controls if removal fails', async () => {
    deleteItem.mockRejectedValueOnce(new Error('offline'));
    render(<CartItem item={item} onMutated={onMutated} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove from the cart' }));
    await settle();
    expect((screen.getByRole('button', { name: 'Remove from the cart' }) as HTMLButtonElement).disabled).toBe(false);
    expect(onMutated).not.toHaveBeenCalled();
  });
  it('does not send a pending update after leaving the page', async () => {
    const { unmount } = render(<CartItem item={item} onMutated={onMutated} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quantity +' }));
    unmount();
    await settle();
    expect(updateItem).not.toHaveBeenCalled();
  });
});
