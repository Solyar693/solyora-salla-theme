import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Header } from '../../../app/components/layout/Header';

const state = {
  store: {
    url: '/',
    name: 'Acme',
    logo: 'logo.png',
    description: '<p>Handmade goods</p>',
    social: { twitter: 'https://x.com/acme' },
  } as Record<string, unknown>,
  theme: { settings: {} } as Record<string, unknown>,
  isHome: true,
  routeIds: [] as string[],
};

vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (s: { matches: { routeId: string }[] }) => unknown }) =>
    select({ matches: state.routeIds.map((routeId) => ({ routeId })) }),
}));

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ store: state.store, theme: state.theme }),
  useIsHome: () => state.isHome,
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fb?: string) => fb ?? _k }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: ({ name }: { name: string }) => <div data-hook-slot={name} />,
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Image: (props: Record<string, unknown>) => (
    <img alt={String(props.alt ?? '')} src={String(props.src ?? '')} />
  ),
}));

vi.mock('../../../app/components/layout/HeaderNav', () => ({
  HeaderNav: ({ open }: { open: boolean }) => <nav data-testid="header-nav" data-open={open} />,
}));

vi.mock('@salla.sa/twilight-components-react/advertisement', () => ({
  SallaAdvertisement: () => <salla-advertisement />,
}));
vi.mock('@salla.sa/twilight-components-react/search', () => ({
  SallaSearch: () => <salla-search />,
}));
vi.mock('@salla.sa/twilight-components-react/social', () => ({
  SallaSocial: () => <salla-social />,
}));
vi.mock('@salla.sa/twilight-components-react/user-menu', () => ({
  SallaUserMenu: () => <salla-user-menu />,
}));
vi.mock('@salla.sa/twilight-components-react/cart-summary', () => ({
  SallaCartSummary: ({ children }: { children?: React.ReactNode }) => (
    <salla-cart-summary>{children}</salla-cart-summary>
  ),
}));

beforeEach(() => {
  state.store = {
    url: '/',
    name: 'Acme',
    logo: 'logo.png',
    description: '<p>Handmade goods</p>',
    social: { twitter: 'https://x.com/acme' },
  };
  state.theme = { settings: {} };
  state.isHome = true;
  state.routeIds = [];
});

describe('Header', () => {
  it('renders the shell: logo, actions, search modal, cart, and the hook slots', () => {
    const { container, getAllByLabelText } = render(<Header />);
    expect(container.querySelector('header.site-header')).toBeTruthy();
    expect(container.querySelector('.site-header__brand img')).toBeTruthy();
    expect(container.querySelector('salla-user-menu')).toBeTruthy();
    expect(container.querySelector('salla-cart-summary')).toBeTruthy();
    expect(container.querySelector('salla-search')).toBeTruthy();
    // One search trigger, in the actions group opposite the menu button.
    expect(getAllByLabelText('Search')).toHaveLength(1);
    expect(container.querySelector('[data-hook-slot="header:start"]')).toBeTruthy();
    expect(container.querySelector('[data-hook-slot="header:end"]')).toBeTruthy();
  });

  it('renders the store name, description and social links in the intro row', () => {
    const { container } = render(<Header />);
    const intro = container.querySelector('.site-header__intro-inner');
    expect(intro?.querySelector('.site-header__intro-title')?.textContent).toBe('Acme');
    expect(container.querySelector('.site-header__intro-text')?.innerHTML).toContain(
      'Handmade goods'
    );
    expect(container.querySelector('.site-header__intro salla-social')).toBeTruthy();
  });

  it('omits the description block when the store has none', () => {
    state.store.description = '';
    const { container } = render(<Header />);
    expect(container.querySelector('.site-header__intro-text')).toBeNull();
  });

  it('uses <h1> for the intro title on the homepage and <p> elsewhere', () => {
    const { container, rerender } = render(<Header />);
    expect(container.querySelector('h1.site-header__intro-title')?.textContent).toBe('Acme');
    state.isHome = false;
    rerender(<Header />);
    expect(container.querySelector('p.site-header__intro-title')?.textContent).toBe('Acme');
  });

  it('opens the nav drawer when the menu button is clicked', () => {
    const { getByLabelText, getByTestId } = render(<Header />);
    const button = getByLabelText('Menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(getByTestId('header-nav').getAttribute('data-open')).toBe('true');
  });

  it('dispatches the search event when the search button is clicked', () => {
    const dispatch = vi.fn();
    (window as unknown as { salla: unknown }).salla = { event: { dispatch } };
    const { getByLabelText } = render(<Header />);
    fireEvent.click(getByLabelText('Search'));
    expect(dispatch).toHaveBeenCalledWith('search::open');
  });

  it('pins the bar on scroll by default (header_is_sticky unset)', () => {
    const { container } = render(<Header />);
    Object.defineProperty(window, 'scrollY', { value: 10, configurable: true });
    fireEvent.scroll(window);
    expect(container.querySelector('.site-header__bar.is-scrolled')).toBeTruthy();
  });

  it('never pins the bar when header_is_sticky is disabled', () => {
    state.theme = { settings: { header_is_sticky: false } };
    const { container } = render(<Header />);
    Object.defineProperty(window, 'scrollY', { value: 10, configurable: true });
    fireEvent.scroll(window);
    expect(container.querySelector('.site-header__bar.is-scrolled')).toBeNull();
  });

  it('adds the product-page modifier from route match state, not the body class', () => {
    state.routeIds = ['/{-$locale}/$slug/p{$id}'];
    const { container } = render(<Header />);
    expect(container.querySelector('header.site-header--product')).toBeTruthy();
  });

  it('omits the product-page modifier on other routes', () => {
    state.routeIds = ['/{-$locale}/cart'];
    const { container } = render(<Header />);
    expect(container.querySelector('header.site-header--product')).toBeNull();
  });
});
