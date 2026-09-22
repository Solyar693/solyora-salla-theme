import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup, act } from '@testing-library/react';
import { HeaderNav } from '../../../app/components/layout/HeaderNav';

const query: { data: unknown[] } = { data: [] };

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => query,
}));

vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>();
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (_k: string, fb?: string) => fb ?? _k,
    languageName: 'English',
    isRTL: false,
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({
    store: { name: 'Store', url: '/', logo: '/logo.png', settings: {} },
    currency: { code: 'SAR' },
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/api/menu', () => ({
  menu: { queries: { header: () => ({ queryKey: ['menus', 'header'] }) } },
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className, onClick }: Record<string, unknown>) => (
    <a href={String(to)} className={className as string} onClick={onClick as () => void}>
      {children as React.ReactNode}
    </a>
  ),
  Image: ({ src, alt }: Record<string, unknown>) => <img src={src as string} alt={alt as string} />,
}));

const items = [
  { id: 1, title: 'Offers', url: '/offers' },
  {
    id: 2,
    title: 'Home',
    url: '/home',
    children: [
      { id: 21, title: 'Living room', url: '/living' },
      { id: 22, title: 'Bedroom', url: '/bedroom' },
    ],
  },
];

beforeEach(() => {
  query.data = [];
  document.body.className = '';
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('HeaderNav', () => {
  it('renders nothing while closed', () => {
    query.data = items;
    const { container } = render(<HeaderNav open={false} onClose={() => {}} />);
    expect(container.querySelector('.site-nav-drawer')).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it('opens on the root Miller column, then drills into a parent', () => {
    query.data = items;
    const { container, getByText, queryByText } = render(<HeaderNav open onClose={() => {}} />);

    expect(container.querySelector('.site-nav-drawer')).toBeTruthy();

    // Root column only: the two top-level rows, one of them a parent trigger.
    // Child rows are not mounted until their parent is opened.
    expect(container.querySelectorAll('.site-nav-drawer__panel').length).toBe(1);
    expect(container.querySelectorAll('.site-nav-drawer__link').length).toBe(2);
    expect(container.querySelectorAll('.site-nav-drawer__link--parent').length).toBe(1);
    expect(queryByText('Living room')).toBeNull();

    // Open the "Home" parent → a second column with its children appears.
    fireEvent.click(getByText('Home'));

    expect(container.querySelectorAll('.site-nav-drawer__panel').length).toBe(2);
    expect(container.querySelectorAll('.site-nav-drawer__link').length).toBe(4);
    expect(container.querySelectorAll('.site-nav-drawer__link--parent').length).toBe(1);
    expect(getByText('Living room')).toBeTruthy();
    expect(getByText('Bedroom')).toBeTruthy();
    expect(container.querySelector('.site-nav-drawer__browse-all')).toBeTruthy();
  });

  it('starts at the root column again when reopened after closing', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    query.data = items;
    const onClose = () => {};
    const { container, getByText, rerender } = render(<HeaderNav open onClose={onClose} />);

    fireEvent.click(getByText('Home'));
    expect(container.querySelectorAll('.site-nav-drawer__panel').length).toBe(2);

    // Close, and let the exit transition finish so the drawer leaves the tree.
    rerender(<HeaderNav open={false} onClose={onClose} />);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(container.querySelector('.site-nav-drawer')).toBeNull();

    rerender(<HeaderNav open onClose={onClose} />);
    expect(container.querySelectorAll('.site-nav-drawer__panel').length).toBe(1);
    expect(container.querySelector('.site-nav-drawer__browse-all')).toBeNull();
  });

  it('locks body scroll while open', () => {
    query.data = items;
    render(<HeaderNav open onClose={() => {}} />);
    expect(document.body.classList.contains('menu-opened')).toBe(true);
  });
});
