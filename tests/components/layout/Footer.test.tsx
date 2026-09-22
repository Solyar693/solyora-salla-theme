import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Footer } from '../../../app/components/layout/Footer';

const state = {
  store: {
    name: 'Acme',
    logo: 'logo.png',
    url: '/',
    description: '<p>Handmade goods</p>',
    apps: [],
  } as Record<string, unknown>,
  theme: { settings: {} } as Record<string, unknown>,
};

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ store: state.store, theme: state.theme }),
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (_k: string, fb?: string) => fb ?? _k }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: ({ name, fallback }: { name: string; fallback?: unknown }) => (
    <div data-hook-slot={name}>{fallback as never}</div>
  ),
}));

vi.mock('@salla.sa/twilight-theme-engine/modal', () => ({
  ImageModal: ({ isOpen, src }: { isOpen: boolean; src: string }) =>
    isOpen ? <div data-testid="tax-modal" data-src={src} /> : null,
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className }: { to: string; children?: unknown; className?: string }) => (
    <a href={to} className={className}>
      {children as never}
    </a>
  ),
  Image: (props: Record<string, unknown>) => (
    <img alt={String(props.alt ?? '')} src={String(props.src ?? '')} />
  ),
}));

vi.mock('@salla.sa/twilight-components-react/apps-icons', () => ({
  SallaAppsIcons: () => <salla-apps-icons />,
}));
vi.mock('@salla.sa/twilight-components-react/social', () => ({
  SallaSocial: () => <salla-social />,
}));
vi.mock('@salla.sa/twilight-components-react/menu', () => ({
  SallaMenu: (props: Record<string, unknown>) => (
    <salla-menu data-source={String(props.source ?? '')} />
  ),
}));
vi.mock('@salla.sa/twilight-components-react/trust-badges', () => ({
  SallaTrustBadges: () => <salla-trust-badges />,
}));
vi.mock('@salla.sa/twilight-components-react/payments', () => ({
  SallaPayments: () => <salla-payments />,
}));

beforeEach(() => {
  state.store = {
    name: 'Acme',
    logo: 'logo.png',
    url: '/',
    description: '<p>Handmade goods</p>',
    apps: [],
  };
  state.theme = { settings: {} };
  delete (window as unknown as { salla?: unknown }).salla;
});

describe('Footer', () => {
  it('renders the logo (not a store-name heading), description, social, badges, apps and payments', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('.solyora-footer-wordmark')?.textContent).toBe('SOLYORA');
    expect(container.querySelector('.store-footer h3')?.textContent).not.toBe('Acme');
    expect(container.querySelector('.store-footer__desc')?.innerHTML).toContain('Handmade goods');
    expect(container.querySelector('salla-social')).toBeTruthy();
    expect(container.querySelector('salla-trust-badges')).toBeTruthy();
    expect(container.querySelector('salla-apps-icons')).toBeTruthy();
    expect(container.querySelector('salla-payments')).toBeTruthy();
    expect(container.querySelector('[data-hook-slot="footer:start"]')).toBeTruthy();
    expect(container.querySelector('[data-hook-slot="footer:end"]')).toBeTruthy();
  });

  it('renders both Salla menus and the contact widget', () => {
    const { container } = render(<Footer />);
    const menu = container.querySelector('.store-footer__links salla-menu[data-source=footer]');
    expect(menu).toBeTruthy();
    expect(menu?.getAttribute('data-source')).toBe('footer');
    expect(container.querySelector('.store-footer__links salla-menu[data-source=header]')).toBeTruthy();
    expect(container.querySelector('salla-contacts')).toBeTruthy();
  });

  it('uses a four-column grid on desktop with a wide brand column', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('.store-footer__inner .container')?.className).toContain(
      'lg:grid-cols-4'
    );
    expect(container.querySelector('.store-footer__brand')?.className).toContain('sm:col-span-2');
  });

  it('has no newsletter sign-up', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('form.footer-newsletter')).toBeNull();
    expect(container.querySelector('input[type="email"]')).toBeNull();
  });

  describe('SBC certificate badge', () => {
    it('shows nothing without a certificate', () => {
      const { container } = render(<Footer />);
      expect(container.querySelector('[data-testid="store-footer-sbc"]')).toBeNull();
    });

    it('links to the SBC verification page for the certificate id', () => {
      state.store = { ...state.store, settings: { certificate: { id: '0123456789' } } };
      const { container } = render(<Footer />);
      const link = container.querySelector('[data-testid="store-footer-sbc"]') as HTMLAnchorElement;
      expect(link.href).toBe(
        'https://eauthenticate.saudibusiness.gov.sa/certificate-details/0123456789'
      );
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
      expect((link.querySelector('img') as HTMLImageElement).src).toBe(
        'https://cdn.salla.network/images/sbc.png?v=2.0.5'
      );
      expect(link.textContent).toContain('Trusted by');
      expect(link.textContent).toContain('Business Platform');
    });

    it('sits with the tax registration in the trust row', () => {
      state.store = {
        ...state.store,
        settings: { tax: { number: '300000000000003' }, certificate: { id: '0123456789' } },
      };
      const { container } = render(<Footer />);
      const trust = container.querySelector('[data-testid="store-footer-trust"]');
      expect(trust?.querySelector('[data-testid="store-footer-tax"]')).toBeTruthy();
      expect(trust?.querySelector('[data-testid="store-footer-sbc"]')).toBeTruthy();
    });

    it('escapes the certificate id in the link', () => {
      state.store = { ...state.store, settings: { certificate: { id: 'a/b?c' } } };
      const { container } = render(<Footer />);
      expect(
        (container.querySelector('[data-testid="store-footer-sbc"]') as HTMLAnchorElement).href
      ).toContain('/certificate-details/a%2Fb%3Fc');
    });
  });

  describe('tax registration', () => {
    it('shows nothing without a tax number', () => {
      const { container } = render(<Footer />);
      expect(container.querySelector('[data-testid="store-footer-tax"]')).toBeNull();
    });

    it('shows the tax number', () => {
      state.store = { ...state.store, settings: { tax: { number: '300000000000003' } } };
      const { container } = render(<Footer />);
      expect(container.querySelector('[data-testid="store-footer-tax"]')?.textContent).toContain(
        '300000000000003'
      );
      expect(container.querySelector('[data-testid="store-footer-tax-certificate"]')).toBeNull();
    });

    it('opens the certificate image in a modal from the tax icon', () => {
      state.store = {
        ...state.store,
        settings: { tax: { number: '300000000000003', certificate: 'https://x.test/cert.jpg' } },
      };
      const { container, queryByTestId, getByTestId } = render(<Footer />);
      const icon = container.querySelector(
        '[data-testid="store-footer-tax-certificate"] img'
      ) as HTMLImageElement;
      expect(icon.src).toBe(
        'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=70,height=70,onerror=redirect,format=auto/images/tax.png?v=2.0.5'
      );
      expect(queryByTestId('tax-modal')).toBeNull();

      fireEvent.click(
        container.querySelector('[data-testid="store-footer-tax-certificate"]') as HTMLElement
      );
      expect(getByTestId('tax-modal').getAttribute('data-src')).toBe('https://x.test/cert.jpg');
    });
  });
});
