import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
const navigate = vi.hoisted(() => vi.fn());
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({ useNavigate: () => navigate }));
import { SearchNavigation } from '../../../app/components/common/SearchNavigation';
beforeEach(() => navigate.mockReset());
function mount(value = 'bag & shoes') {
  const view = render(<><SearchNavigation /><salla-search><input className="s-search-input" defaultValue={value} /></salla-search></>);
  return { ...view, input: view.container.querySelector('input')! };
}
describe('Search navigation', () => {
  it('keeps Enter inside the router and encodes reserved query characters', () => {
    const { input } = mount();
    const publishedRedirect = vi.fn();
    input.addEventListener('keydown', publishedRedirect);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/search?q=bag%20%26%20shoes');
    expect(publishedRedirect).not.toHaveBeenCalled();
  });
  it('uses the current typed value without waiting for the SDK debounce', () => {
    const { input } = mount('old');
    fireEvent.change(input, { target: { value: 'new query' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(navigate).toHaveBeenCalledWith('/search?q=new%20query');
  });
  it('does not navigate empty searches', () => {
    const { input } = mount('   ');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(navigate).not.toHaveBeenCalled();
  });
  it('does not interfere with composition or unrelated form fields', () => {
    const { input, container } = mount();
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    const other = document.createElement('input');
    container.appendChild(other);
    fireEvent.keyDown(other, { key: 'Enter' });
    expect(navigate).not.toHaveBeenCalled();
  });
  it('removes the capture handler on unmount', () => {
    const { input, unmount } = mount();
    unmount();
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    input.remove();
    expect(navigate).not.toHaveBeenCalled();
  });
});
